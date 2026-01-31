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
    actual_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = BudgetLine
        fields = ['id', 'analytical_account', 'planned_amount', 'actual_amount']

class BudgetSerializer(serializers.ModelSerializer):
    lines = BudgetLineSerializer(many=True, read_only=True)
    
    class Meta:
        model = Budget
        fields = '__all__'

class InvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLine
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True)
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    total_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = Invoice
        fields = '__all__'

    def create(self, validated_data):
        """
        Custom Create to handle Auto-Analytical Models
        """
        lines_data = validated_data.pop('lines')
        invoice = Invoice.objects.create(**validated_data)
        
        for line_data in lines_data:
            account = line_data.get('analytical_account')
            
            if not account:
                product = line_data.get('product')
                rule = AutoAnalyticRule.objects.filter(
                    product_category=product.category
                ).order_by('-priority').first()
                
                if rule:
                    account = rule.target_account
            
            InvoiceLine.objects.create(invoice=invoice, analytical_account=account, **line_data)
        
        return invoice