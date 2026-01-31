from rest_framework import serializers
from .models import *
from core.models import User

# --- Helper Serializers ---

class AnalyticalAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticalAccount
        fields = '__all__'

class AutoAnalyticRuleSerializer(serializers.ModelSerializer):
    target_account_name = serializers.CharField(source='target_account.name', read_only=True)
    class Meta:
        model = AutoAnalyticRule
        fields = '__all__'

# --- MASTER DATA SERIALIZERS ---

class ProductSerializer(serializers.ModelSerializer):
    # 🟢 1. Accept Category as a String (for Create on the Fly)
    category = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Product
        fields = '__all__'

    def create(self, validated_data):
        # A. Extract the category name string
        cat_name = validated_data.pop('category', None)
        
        # B. Create the Product (without category first)
        product = Product.objects.create(**validated_data)

        # C. Handle "Create & Save" for Category
        if cat_name:
            # Get or Create the Category Object
            category_obj, created = ProductCategory.objects.get_or_create(name=cat_name)
            product.category = category_obj
            product.save()
        
        return product

    def update(self, instance, validated_data):
        cat_name = validated_data.pop('category', None)
        
        # Standard Update
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        # Update Category if provided
        if cat_name is not None:
            if cat_name:
                category_obj, _ = ProductCategory.objects.get_or_create(name=cat_name)
                instance.category = category_obj
            else:
                instance.category = None
        
        instance.save()
        return instance

    def to_representation(self, instance):
        # D. Return the Category Name (String) to Frontend
        data = super().to_representation(instance)
        data['category'] = instance.category.name if instance.category else ""
        return data

class ContactSerializer(serializers.ModelSerializer):
    # 🟢 2. Handle Tags (Create on the Fly)
    tags_str = serializers.CharField(write_only=True, required=False, allow_blank=True)
    tags = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Contact
        fields = '__all__'

    def create(self, validated_data):
        tags_input = validated_data.pop('tags_str', '')
        contact = Contact.objects.create(**validated_data)

        if tags_input:
            tag_names = [t.strip() for t in tags_input.split(',') if t.strip()]
            for name in tag_names:
                tag, created = ContactTag.objects.get_or_create(name=name)
                contact.tags.add(tag)
        
        return contact

# --- TRANSACTION SERIALIZERS ---

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
        lines_data = validated_data.pop('lines')
        budget = Budget.objects.create(**validated_data)
        for line_data in lines_data:
            BudgetLine.objects.create(budget=budget, **line_data)
        return budget
    
    def update(self, instance, validated_data):
        # 1. Update Parent Fields (Name, Dates, State)
        instance.name = validated_data.get('name', instance.name)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.state = validated_data.get('state', instance.state)
        instance.save()

        # 2. Handle Nested Lines
        # If 'lines' data is provided, we replace the old lines with the new ones.
        if 'lines' in validated_data:
            lines_data = validated_data.pop('lines')
            
            # Strategy: Delete all old lines and re-create them.
            # This ensures any lines removed in the UI are removed from DB,
            # and any modified amounts are saved correctly.
            instance.lines.all().delete()
            
            for line_data in lines_data:
                BudgetLine.objects.create(budget=instance, **line_data)

        return instance

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
        fields = '__all__'

    def get_total_amount(self, obj):
        return sum(line.quantity * line.price_unit for line in obj.lines.all())

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        invoice = Invoice.objects.create(**validated_data)
        
        for line_data in lines_data:
            account = line_data.pop('analytical_account', None) 
            
            # 🟢 3. Fix Auto-Analytic Logic for ForeignKey Categories
            if not account:
                product = line_data.get('product')
                
                # Safe lookup: Check if product has a category, then get its name
                category_name = product.category.name if product.category else ""
                
                rule = AutoAnalyticRule.objects.filter(
                    product_category__iexact=category_name
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