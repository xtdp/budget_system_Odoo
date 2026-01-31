from rest_framework import serializers
from .models import *
from core.models import User

class AnalyticalAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticalAccount
        fields = '__all__'

class AutoAnalyticRuleSerializer(serializers.ModelSerializer):
    target_account_name = serializers.CharField(source='target_account.name', read_only=True)
    
    class Meta:
        model = AutoAnalyticRule
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'

class BudgetLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='analytical_account.name', read_only=True)
    actual_amount = serializers.SerializerMethodField()

    class Meta:
        model = BudgetLine
        fields = ['id', 'analytical_account', 'account_name', 'planned_amount', 'actual_amount']

    def get_actual_amount(self, obj):
        total = 0
        items = AnalyticItem.objects.filter(
            account=obj.analytical_account,
            date__gte=obj.budget.start_date,
            date__lte=obj.budget.end_date 
        )
        for item in items:
            total += item.amount
        return total

class BudgetSerializer(serializers.ModelSerializer):
    lines = BudgetLineSerializer(many=True)
    
    class Meta:
        model = Budget
        fields = ['id', 'name', 'start_date', 'end_date', 'state', 'lines']

    def create(self, validated_data):
        """
        Custom Create to handle Nested Budget Lines
        """
        # 1. Separate the lines data from the budget data
        lines_data = validated_data.pop('lines')
        
        # 2. Create the Parent Budget
        budget = Budget.objects.create(**validated_data)
        
        # 3. Create the Children Lines
        for line_data in lines_data:
            BudgetLine.objects.create(budget=budget, **line_data)
            
        return budget

class InvoiceLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = InvoiceLine
        fields = ['id', 'product', 'product_name', 'quantity', 'price_unit', 'analytical_account']

class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True)
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_type', 'partner', 'partner_name', 'date', 'state', 'payment_state', 'lines', 'total_amount']

    def get_total_amount(self, obj):
        return sum(line.quantity * line.price_unit for line in obj.lines.all())

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        invoice = Invoice.objects.create(**validated_data)
        
        for line_data in lines_data:
            account = line_data.pop('analytical_account', None) 
            
            if not account:
                product = line_data.get('product')
                rule = AutoAnalyticRule.objects.filter(
                    product_category__iexact=product.category
                ).order_by('-priority').first()
                
                if rule:
                    account = rule.target_account
            
            InvoiceLine.objects.create(invoice=invoice, analytical_account=account, **line_data)
        
        return invoice
    
class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    class Meta:
        model = PurchaseOrderLine
        fields = ['id', 'product', 'product_name', 'quantity', 'price_unit', 'analytical_account']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    lines = PurchaseOrderLineSerializer(many=True)
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'name', 'partner', 'partner_name', 'date_order', 'state', 'amount_total', 'lines']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        order = PurchaseOrder.objects.create(**validated_data)
        
        total = 0
        for line_data in lines_data:
            line = PurchaseOrderLine.objects.create(order=order, **line_data)
            total += line.quantity * line.price_unit
        
        order.amount_total = total
        order.save()
        return order
    
class SalesOrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    class Meta:
        model = SalesOrderLine
        fields = ['id', 'product', 'product_name', 'quantity', 'price_unit']

class SalesOrderSerializer(serializers.ModelSerializer):
    lines = SalesOrderLineSerializer(many=True)
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    
    class Meta:
        model = SalesOrder
        fields = ['id', 'name', 'partner', 'partner_name', 'date_order', 'state', 'amount_total', 'lines']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        order = SalesOrder.objects.create(**validated_data)
        
        total = 0
        for line_data in lines_data:
            line = SalesOrderLine.objects.create(order=order, **line_data)
            total += line.quantity * line.price_unit
            
        order.amount_total = total
        order.save()
        return order
    
class PaymentSerializer(serializers.ModelSerializer):
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    class Meta:
        model = Payment
        fields = '__all__'