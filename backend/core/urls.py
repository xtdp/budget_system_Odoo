from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('login/', login_view),
    path('signup/', signup_view),
    path('', include(router.urls)),
]