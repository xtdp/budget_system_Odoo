from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import InvoiceLine, AutoAnalyticRule

@receiver(pre_save, sender=InvoiceLine)
def apply_auto_analytic_rule(sender, instance, **kwargs):
    if not instance.analytical_account:
        product = instance.product
        
        rule = AutoAnalyticRule.objects.filter(
            product_category__iexact=product.category
        ).order_by('-priority').first()
        
        if rule:
            instance.analytical_account = rule.target_account
            print(f"🤖 AUTO-ASSIGNED: '{rule.target_account.name}' to product '{product.name}'")
        else:
            print(f"⚠️ NO RULE FOUND for category '{product.category}'")