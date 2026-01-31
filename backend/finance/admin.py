from django.contrib import admin
from .models import *

class BudgetLineInline(admin.TabularInline):
    model = BudgetLine
    extra = 1

class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 1


@admin.register(AnalyticalAccount)
class AnalyticalAccountAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'account_type')
    search_fields = ('code', 'name')
    list_filter = ('account_type',)

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'state', 'revision_number', 'parent_budget')
    list_filter = ('state',)
    inlines = [BudgetLineInline]
    actions = ['revise_budget_action']

    def revise_budget_action(self, request, queryset):
        self.message_user(request, "Use the API to revise budgets properly.")
    revise_budget_action.short_description = "Revise Selected Budgets"

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'partner', 'invoice_type', 'date', 'state', 'payment_state')
    list_filter = ('state', 'payment_state', 'invoice_type')
    inlines = [InvoiceLineInline]

@admin.register(AnalyticItem)
class AnalyticItemAdmin(admin.ModelAdmin):
    list_display = ('date', 'name', 'account', 'amount', 'reference')
    list_filter = ('account', 'date')
    readonly_fields = ('name', 'account', 'amount', 'reference', 'date')

@admin.register(AutoAnalyticRule)
class AutoAnalyticRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_category', 'target_account', 'priority')
    ordering = ('-priority',)

admin.site.register(Product)
admin.site.register(Contact)