import razorpay
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import *
from .serializers import *
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.db.models import Sum
from decimal import Decimal


RAZORPAY_KEY_ID = "rzp_test_SASnyteTTEwRTl"
RAZORPAY_KEY_SECRET = "087jJzViGkBHVeAhCJlD5Qxg"

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class MasterDataViewSet(viewsets.ModelViewSet):
    """Generic ViewSet for simple Master Data"""
    permission_classes = []

class ContactViewSet(MasterDataViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class ProductViewSet(MasterDataViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class AnalyticalAccountViewSet(MasterDataViewSet):
    queryset = AnalyticalAccount.objects.all()
    serializer_class = AnalyticalAccountSerializer

class AutoAnalyticRuleViewSet(MasterDataViewSet):
    queryset = AutoAnalyticRule.objects.all()
    serializer_class = AutoAnalyticRuleSerializer

class BudgetViewSet(MasterDataViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

    @action(detail=True, methods=['post'])
    def revise(self, request, pk=None):
        old_budget = self.get_object()
        
        # 1. Logic: If it's already a revision, keep the original parent. If it's new, set parent to self.
        original_budget = old_budget.parent_budget if old_budget.parent_budget else old_budget
        new_rev_number = old_budget.revision_number + 1
        
        # 2. Name Logic: "Expo Budget (Rev 01)"
        base_name = old_budget.name.split(' (Rev')[0] # Strip old revision tag if any
        new_name = f"{base_name} (Rev {str(new_rev_number).zfill(2)})"

        with transaction.atomic():
            # 3. Create New Draft Budget
            new_budget = Budget.objects.create(
                name=new_name,
                start_date=old_budget.start_date,
                end_date=old_budget.end_date,
                state='draft',  # Starts as Draft so you can edit it
                revision_number=new_rev_number,
                parent_budget=original_budget
            )
            
            # 4. Copy Lines
            for line in old_budget.lines.all():
                BudgetLine.objects.create(
                    budget=new_budget,
                    analytical_account=line.analytical_account,
                    planned_amount=line.planned_amount # User can now edit this in Draft
                )
            
            # 5. Archive Old Budget
            old_budget.state = 'cancelled' # Or 'archived' if you add that choice
            old_budget.save()
            
        return Response(BudgetSerializer(new_budget).data)
    
    @action(detail=False, methods=['post'])
    def check_availability(self, request):
        """
        Checks if a transaction amount fits within the budget.
        Expects: { "account_id": 1, "amount": 5000, "date": "2026-01-31" }
        """
        account_id = request.data.get('account_id')
        amount = float(request.data.get('amount', 0))
        date_str = request.data.get('date', str(date.today()))

        # 1. Find the Active Budget Line
        # We look for a CONFIRMED budget that covers this date
        budget_line = BudgetLine.objects.filter(
            analytical_account_id=account_id,
            budget__start_date__lte=date_str,
            budget__end_date__gte=date_str,
            budget__state='confirmed'
        ).first()

        if not budget_line:
            return Response({
                'status': 'no_budget', 
                'warning': 'No active budget found for this account/period.'
            })

        # 2. Calculate Actuals (Spent so far)
        # Sum of all POSTED analytic items for this account in this period
        spent = AnalyticItem.objects.filter(
            account_id=account_id,
            date__gte=budget_line.budget.start_date,
            date__lte=budget_line.budget.end_date
        ).aggregate(total=Sum('amount'))['total'] or 0

        # 3. Compare
        planned = float(budget_line.planned_amount)
        remaining = planned - float(spent)
        
        # Check if adding the NEW amount would exceed the budget
        # Note: 'spent' includes previous bills. We check if (spent + new_amount) > planned
        is_exceeded = (float(spent) + amount) > planned

        return Response({
            'status': 'success',
            'budget_name': budget_line.budget.name,
            'planned': planned,
            'spent': spent,
            'remaining': remaining - amount, # Remaining AFTER this transaction
            'is_exceeded': is_exceeded,
            'warning': "⚠️ Exceeds Approved Budget" if is_exceeded else "Budget is within limits."
        })

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        invoice = self.get_object()
        
        # 1. Check for Missing Accounts
        missing = [f"Line with {l.product.name}" for l in invoice.lines.all() if not l.analytical_account]
        if missing:
             return Response({'error': 'Missing Analytical Account', 'details': missing}, status=400)
            
        with transaction.atomic():
            # 2. Calculate Totals
            total = sum(line.quantity * line.price_unit for line in invoice.lines.all())
            
            invoice.state = 'posted'
            invoice.payment_state = 'not_paid'
            invoice.amount_total = total      # 🟢 Set Total
            invoice.amount_residual = total   # 🟢 Set Residual = Total initially
            invoice.save()
            
            # 3. Create Analytic Entries
            for line in invoice.lines.all():
                if line.analytical_account:
                    amount = line.quantity * line.price_unit
                    if invoice.invoice_type == 'in_invoice': amount = -amount
                    AnalyticItem.objects.create(
                        name=f"Invoice: {invoice.id} - {line.product.name}",
                        account=line.analytical_account,
                        amount=amount, 
                        reference=f"INV-{invoice.id}",
                        date=date.today()
                    )
                    
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        invoice = self.get_object()
        
        # 🟢 Get Payment Amount from User (or default to full residual)
        amount_to_pay = float(request.data.get('amount', invoice.amount_residual))
        
        if invoice.state != 'posted':
             return Response({'error': 'Invoice must be posted to pay'}, status=400)
        
        if amount_to_pay <= 0 or amount_to_pay > invoice.amount_residual:
             return Response({'error': f'Invalid Amount. Max Payble: {invoice.amount_residual}'}, status=400)

        with transaction.atomic():
            # 1. Create Payment Record
            Payment.objects.create(
                payment_type='send' if invoice.invoice_type == 'in_invoice' else 'receive',
                partner=invoice.partner,
                amount=amount_to_pay,
                ref=f"Payment for {invoice.id}",
                date=date.today()
            )

            # 2. Update Residual
            invoice.amount_residual -= Decimal(str(amount_to_pay))
            
            # 3. Update Status Logic
            if invoice.amount_residual <= 0:
                invoice.payment_state = 'paid'
                invoice.amount_residual = 0 # Safety clamp
            else:
                invoice.payment_state = 'partial' # 🟢 Mark as Partial
            
            invoice.save()
        
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        invoice = self.get_object()
        
        # Calculate Total
        total_amount = sum(line.quantity * line.price_unit for line in invoice.lines.all())

        # 🔍 NEW: Find the Payment Reference (Razorpay ID)
        payment_ref = ""
        if invoice.payment_state == 'paid':
            # We look for the latest payment by this partner with the exact invoice amount
            # This is the best match since we didn't link Payment->Invoice explicitly in the DB models
            payment = Payment.objects.filter(
                partner=invoice.partner,
                amount=total_amount
            ).order_by('-id').first()
            
            if payment:
                payment_ref = payment.ref  # This will contain "Razorpay: pay_..."

        template_path = 'invoice_pdf.html'
        template = get_template(template_path)
        
        context = {
            'invoice': invoice,
            'lines': invoice.lines.all(),
            'total': total_amount,
            'payment_ref': payment_ref, # 👈 Passing it to HTML
        }
        
        html = template.render(context)
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{invoice.id}.pdf"'

        pisa_status = pisa.CreatePDF(html, dest=response)
        if pisa_status.err:
            return HttpResponse('We had some errors <pre>' + html + '</pre>')
            
        return response
    
    @action(detail=True, methods=['post'])
    def create_razorpay_order(self, request, pk=None):
        invoice = self.get_object()
        amount_in_paise = int(sum(line.quantity * line.price_unit for line in invoice.lines.all()) * 100)
        
        data = { "amount": amount_in_paise, "currency": "INR", "receipt": f"INV-{invoice.id}" }
        payment = client.order.create(data=data)
        
        return Response({
            'order_id': payment['id'], 
            'amount': amount_in_paise, 
            'key_id': RAZORPAY_KEY_ID
        })

    @action(detail=True, methods=['post'])
    def verify_razorpay_payment(self, request, pk=None):
        invoice = self.get_object()
        data = request.data

        try:
            client.utility.verify_payment_signature(data)
            
            with transaction.atomic():
                invoice.payment_state = 'paid'
                invoice.save()
                
                Payment.objects.create(
                    payment_type='receive',
                    partner=invoice.partner,
                    amount=sum(line.quantity * line.price_unit for line in invoice.lines.all()),
                    ref=f"Razorpay: {data['razorpay_payment_id']}",
                    date=date.today()
                )

            return Response({'status': 'Payment Verified & Captured'})
        except Exception as e:
            return Response({'error': 'Invalid Signature'}, status=400)
    

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer

    @action(detail=True, methods=['post'])
    def create_bill(self, request, pk=None):
        po = self.get_object()
        
        if po.state != 'confirmed':
            return Response({'error': 'PO must be Confirmed to create a Bill'}, status=400)
            
        with transaction.atomic():
            # 1. Create the Vendor Bill (Invoice)
            invoice = Invoice.objects.create(
                partner=po.partner,
                invoice_type='in_invoice', # Vendor Bill
                date=date.today(),
                state='draft'
            )
            
            # 2. Copy Lines from PO to Bill
            for line in po.lines.all():
                InvoiceLine.objects.create(
                    invoice=invoice,
                    product=line.product,
                    quantity=line.quantity,
                    price_unit=line.price_unit,
                    analytical_account=line.analytical_account # Carry over the cost center!
                )
                
            # 3. Mark PO as Done/Locked
            po.state = 'done'
            po.save()
            
        return Response({'message': f'Vendor Bill {invoice.id} created successfully!', 'invoice_id': invoice.id})

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer

    @action(detail=True, methods=['post'])
    def create_invoice(self, request, pk=None):
        so = self.get_object()
        
        if so.state != 'confirmed':
            return Response({'error': 'SO must be Confirmed to create an Invoice'}, status=400)
            
        with transaction.atomic():
            # 1. Create Customer Invoice
            invoice = Invoice.objects.create(
                partner=so.partner,
                invoice_type='out_invoice', # Customer Invoice
                date=date.today(),
                state='draft'
            )
            
            # 2. Copy Lines
            for line in so.lines.all():
                # Apply Auto-Analytic Logic here if SO didn't have it
                # (Or just copy if SO had it)
                InvoiceLine.objects.create(
                    invoice=invoice,
                    product=line.product,
                    quantity=line.quantity,
                    price_unit=line.price_unit
                    # account logic is usually auto-applied on Invoice Save via Signals
                )
                
            so.state = 'done'
            so.save()
            
        return Response({'message': f'Invoice {invoice.id} created successfully!', 'invoice_id': invoice.id})

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

