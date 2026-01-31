from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'contacts', ContactViewSet)
router.register(r'products', ProductViewSet)
router.register(r'accounts', AnalyticalAccountViewSet)
router.register(r'budgets', BudgetViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'rules', AutoAnalyticRuleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]