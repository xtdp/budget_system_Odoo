from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import *
from .serializers import *

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
        """
        Handles Budget Revision Logic
        1. Archive current budget
        2. Clone it to a new draft with revision_number + 1
        """
        old_budget = self.get_object()
        
        new_budget = Budget.objects.create(
            name=old_budget.name,
            start_date=old_budget.start_date,
            end_date=old_budget.end_date,
            state='revised',
            revision_number=old_budget.revision_number + 1,
            parent_budget=old_budget
        )
        
        for line in old_budget.lines.all():
            BudgetLine.objects.create(
                budget=new_budget,
                analytical_account=line.analytical_account,
                planned_amount=line.planned_amount
            )
            
        old_budget.state = 'cancelled'
        old_budget.save()
        
        return Response(BudgetSerializer(new_budget).data)

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        invoice = self.get_object()
        
        missing_accounts = []
        for line in invoice.lines.all():
            if not line.analytical_account:
                missing_accounts.append(f"Line with product '{line.product.name}'")
        
        if missing_accounts:
            return Response({
                'error': 'Cannot Confirm: Missing Analytical Account!', 
                'details': f"Please select an account for: {', '.join(missing_accounts)}"
            }, status=400)
            
        with transaction.atomic():
            invoice.state = 'posted'
            invoice.payment_state = 'not_paid'
            invoice.save()
            
            for line in invoice.lines.all():
                if line.analytical_account:
                    amount = line.quantity * line.price_unit
                    
                    if invoice.invoice_type == 'in_invoice':
                        amount = -amount
                    
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
        
        if invoice.payment_state == 'paid':
             return Response({'error': 'Invoice already paid'}, status=400)

        if invoice.state != 'posted':
            return Response({'error': 'Invoice must be posted to pay'}, status=400)
        
        with transaction.atomic():
            invoice.payment_state = 'paid'
            invoice.save()
            
            Payment.objects.create(
                payment_type='receive',
                partner=invoice.partner,
                amount=sum(line.quantity * line.price_unit for line in invoice.lines.all()),
                ref=f"Payment for {invoice.id}",
                date=date.today()
            )
        
        return Response(InvoiceSerializer(invoice).data)
    

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer