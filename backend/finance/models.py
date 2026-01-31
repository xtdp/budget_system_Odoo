from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class AnalyticalAccount(models.Model):
    ACCOUNT_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
        ('asset', 'Assets'),
        ('liability', 'Liabilities'),
    ]
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, default='expense')

class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    

class Contact(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='contact_profile')
    

class AnalyticItem(models.Model):
    name = models.CharField(max_length=255)
    account = models.ForeignKey(AnalyticalAccount, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField(default=timezone.now)
    reference = models.CharField(max_length=100)

class Budget(models.Model):
    STATE_CHOICES = [('draft', 'Draft'), ('confirmed', 'Confirmed'), ('revised', 'Revised'), ('cancelled', 'Cancelled')]
    
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='draft')
    revision_number = models.IntegerField(default=0)
    parent_budget = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)


class BudgetLine(models.Model):
    budget = models.ForeignKey(Budget, related_name='lines', on_delete=models.CASCADE)
    analytical_account = models.ForeignKey(AnalyticalAccount, on_delete=models.CASCADE)
    planned_amount = models.DecimalField(max_digits=12, decimal_places=2)

class Invoice(models.Model):
    TYPE_CHOICES = [('out_invoice', 'Customer Invoice'), ('in_invoice', 'Vendor Bill')]
    STATE_CHOICES = [('draft', 'Draft'), ('posted', 'Posted'), ('cancelled', 'Cancelled')]
    PAYMENT_STATE = [('not_paid', 'Not Paid'), ('partial', 'Partially Paid'), ('paid', 'Paid')]

    invoice_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    partner = models.ForeignKey(Contact, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='draft')
    payment_state = models.CharField(max_length=20, choices=PAYMENT_STATE, default='not_paid')
    access_token = models.UUIDField(default=uuid.uuid4, editable=False)

class InvoiceLine(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='lines', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price_unit = models.DecimalField(max_digits=10, decimal_places=2)
    analytical_account = models.ForeignKey(AnalyticalAccount, null=True, blank=True, on_delete=models.SET_NULL)

class AutoAnalyticRule(models.Model):
    name = models.CharField(max_length=255)
    product_category = models.CharField(max_length=100, blank=True, null=True)
    target_account = models.ForeignKey(AnalyticalAccount, on_delete=models.CASCADE)
    priority = models.IntegerField(default=10)