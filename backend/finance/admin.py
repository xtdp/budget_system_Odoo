from django.contrib import admin
from django.db.models import Sum
from django.db import transaction
from datetime import date
from .models import *

# --- Inline Admin Classes ---

class BudgetLineInline(admin.TabularInline):
    model = BudgetLine
    extra = 1

class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 1

class PurchaseOrderLineInline(admin.TabularInline):
    model = PurchaseOrderLine
    extra = 1

class SalesOrderLineInline(admin.TabularInline):
    model = SalesOrderLine
    extra = 1

# --- Main Admin Classes ---

@admin.register(AnalyticalAccount)
class AnalyticalAccountAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'account_type', 'current_balance')
    search_fields = ('code', 'name')
    list_filter = ('account_type',)

    def current_balance(self, obj):
        total = AnalyticItem.objects.filter(account=obj).aggregate(Sum('amount'))['amount__sum']
        return total or 0.00
    current_balance.short_description = "Live Balance"

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'state', 'total_planned', 'total_actual')
    list_filter = ('state',)
    inlines = [BudgetLineInline]
    actions = ['revise_budget_action']

    def revise_budget_action(self, request, queryset):
        self.message_user(request, "Use the API to revise budgets properly.")
    revise_budget_action.short_description = "Revise Selected Budgets"

    def total_planned(self, obj):
        total = obj.lines.aggregate(Sum('planned_amount'))['planned_amount__sum']
        return total or 0.00
    
    def total_actual(self, obj):
        account_ids = obj.lines.values_list('analytical_account_id', flat=True)
        total = AnalyticItem.objects.filter(
            account_id__in=account_ids,
            date__gte=obj.start_date,
            date__lte=obj.end_date
        ).aggregate(Sum('amount'))['amount__sum']
        return total or 0.00
    total_actual.short_description = "✅ Actual Spent"

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'partner', 'invoice_type', 'date', 'state', 'payment_state', 'total_amount_display')
    list_filter = ('state', 'payment_state', 'invoice_type', 'date')
    search_fields = ('partner__name', 'id')
    inlines = [InvoiceLineInline]
    actions = ['register_payment_action']

    def total_amount_display(self, obj):
        return sum(line.quantity * line.price_unit for line in obj.lines.all())
    total_amount_display.short_description = 'Total Amount'

    # ✅ UPDATED: This now ONLY marks as paid (Doesn't touch Budget)
    def register_payment_action(self, request, queryset):
        count = 0
        for invoice in queryset:
            if invoice.state != 'posted' or invoice.payment_state == 'paid':
                continue
            
            with transaction.atomic():
                invoice.payment_state = 'paid'
                invoice.save()
                
                Payment.objects.create(
                    payment_type='send' if invoice.invoice_type == 'in_invoice' else 'receive',
                    partner=invoice.partner,
                    amount=sum(line.quantity * line.price_unit for line in invoice.lines.all()),
                    ref=f"Admin Payment for {invoice.id}",
                    date=date.today()
                )
                count += 1
                        
        self.message_user(request, f"Successfully marked {count} invoices as Paid.")
    
    register_payment_action.short_description = "💰 Register Payment"

@admin.register(AnalyticItem)
class AnalyticItemAdmin(admin.ModelAdmin):
    list_display = ('date', 'name', 'account', 'amount', 'reference')
    list_filter = ('account', 'date')
    search_fields = ('name', 'reference')
    readonly_fields = ('name', 'account', 'amount', 'reference', 'date')
    autocomplete_fields = ['account']

@admin.register(AutoAnalyticRule)
class AutoAnalyticRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_category', 'target_account', 'priority')
    ordering = ('-priority',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price')
    search_fields = ('name', 'category')
    list_filter = ('category',)

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone')
    search_fields = ('name', 'email')

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('name', 'partner', 'date_order', 'state', 'amount_total')
    list_filter = ('state', 'date_order')
    search_fields = ('name', 'partner__name')
    inlines = [PurchaseOrderLineInline]

@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ('name', 'partner', 'date_order', 'state', 'amount_total')
    list_filter = ('state', 'date_order')
    search_fields = ('name', 'partner__name')
    inlines = [SalesOrderLineInline]

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('name', 'payment_type', 'partner', 'amount', 'date', 'ref')
    list_filter = ('payment_type', 'date')
    search_fields = ('name', 'partner__name', 'ref')