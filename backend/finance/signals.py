from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import InvoiceLine, AutoAnalyticRule, AnalyticItem, Invoice

@receiver(pre_save, sender=InvoiceLine)
def apply_auto_analytic_rule(sender, instance, **kwargs):
    if not instance.analytical_account:
        product = instance.product
        rule = AutoAnalyticRule.objects.filter(
            product_category=product.category
        ).order_by('-priority').first()
        
        if rule:
            instance.analytical_account = rule.target_account
            print(f"🤖 Auto-Assigned '{rule.target_account.name}' to {product.name}")

@receiver(post_save, sender=Invoice)
def update_ledger_on_confirm(sender, instance, created, **kwargs):
    """
    The 'Ledger Writer': When Invoice becomes 'posted', write to Analytic Items.
    Matches Requirement:
    """
    if instance.state == 'posted':
        if AnalyticItem.objects.filter(reference=f"INV-{instance.id}").exists():
            return

        print(f"💰 Posting Invoice {instance.id} to Ledger...")
        
        for line in instance.lines.all():
            if line.analytical_account:
                amount = line.quantity * line.price_unit
                if instance.invoice_type == 'in_invoice':
                    amount = -amount 
                
                AnalyticItem.objects.create(
                    name=f"Transaction: {line.product.name}",
                    account=line.analytical_account,
                    amount=amount,
                    date=instance.date,
                    reference=f"INV-{instance.id}"
                )