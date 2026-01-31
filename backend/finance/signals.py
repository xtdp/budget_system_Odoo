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