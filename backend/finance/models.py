from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from datetime import date

class ProductCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name
    class Meta: verbose_name_plural = "Product Categories"

class ContactTag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

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

    def __str__(self):
        return f"[{self.code}] {self.name}"

class Product(models.Model):
    STATE_CHOICES = [('draft', 'Draft'), ('confirmed', 'Confirmed'), ('archived', 'Archived')]
    name = models.CharField(max_length=255)
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, blank=True)
    sales_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Sales Price (Rs)")
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Purchase Price (Rs)")
    
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='draft')
    
    @property
    def price(self): return self.sales_price

    def __str__(self): return self.name

class Contact(models.Model):
    STATE_CHOICES = [('draft', 'Draft'), ('confirmed', 'Confirmed'), ('archived', 'Archived')]
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='contact_profile')
    address = models.TextField(blank=True, help_text="Street, City, State, Country, Pincode")
    street = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    province = models.CharField(max_length=100, blank=True) 
    country = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='draft')
    tags = models.ManyToManyField(ContactTag, blank=True)
    image = models.ImageField(upload_to='contacts/', blank=True, null=True)

    def __str__(self):
        return self.name

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

    def __str__(self):
        return self.name


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
    amount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    amount_residual = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    access_token = models.UUIDField(default=uuid.uuid4, editable=False)

    def __str__(self):
        return f"INV-{self.id} ({self.partner.name})"

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


class PurchaseOrder(models.Model):
    STATES = [('draft', 'Draft'), ('confirmed', 'Confirmed'), ('done', 'Locked'), ('cancelled', 'Cancelled')]
    
    name = models.CharField(max_length=50, unique=True, default='New')
    partner = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='purchases')
    date_order = models.DateField(default=date.today)
    state = models.CharField(max_length=20, choices=STATES, default='draft')
    amount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        if self.name == 'New':
            count = PurchaseOrder.objects.count() + 1
            self.name = f"PO/{date.today().year}/{str(count).zfill(3)}"
        super().save(*args, **kwargs)

class PurchaseOrderLine(models.Model):
    order = models.ForeignKey(PurchaseOrder, related_name='lines', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price_unit = models.DecimalField(max_digits=10, decimal_places=2)
    analytical_account = models.ForeignKey(AnalyticalAccount, on_delete=models.SET_NULL, null=True, blank=True)

class SalesOrder(models.Model):
    STATES = [('draft', 'Draft'), ('confirmed', 'Confirmed'), ('done', 'Locked'), ('cancelled', 'Cancelled')]
    
    name = models.CharField(max_length=50, unique=True, default='New') # e.g., SO/2026/001
    partner = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='sales')
    date_order = models.DateField(default=date.today)
    state = models.CharField(max_length=20, choices=STATES, default='draft')
    amount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        if self.name == 'New':
            count = SalesOrder.objects.count() + 1
            self.name = f"SO/{date.today().year}/{str(count).zfill(3)}"
        super().save(*args, **kwargs)

class SalesOrderLine(models.Model):
    order = models.ForeignKey(SalesOrder, related_name='lines', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price_unit = models.DecimalField(max_digits=10, decimal_places=2)


class Payment(models.Model):
    PAYMENT_TYPES = [('send', 'Send Money'), ('receive', 'Receive Money')]
    
    name = models.CharField(max_length=50, default='New')
    payment_type = models.CharField(max_length=10, choices=PAYMENT_TYPES, default='receive')
    partner = models.ForeignKey(Contact, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField(default=date.today)
    ref = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        if self.name == 'New':
            prefix = 'PAY' if self.payment_type == 'send' else 'RCPT'
            count = Payment.objects.count() + 1
            self.name = f"{prefix}/{date.today().year}/{str(count).zfill(3)}"
        super().save(*args, **kwargs)