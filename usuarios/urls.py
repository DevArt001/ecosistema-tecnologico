from django.urls import path, include
from . import views_2fa
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.UsuarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('modulos/', views.modulos_disponibles, name='modulos'),
    path('2fa/setup/',    views_2fa.setup_2fa,         name='2fa-setup'),
    path('2fa/verify/',   views_2fa.verify_2fa,        name='2fa-verify'),
    path('2fa/disable/',  views_2fa.disable_2fa,       name='2fa-disable'),
    path('2fa/status/',   views_2fa.status_2fa,        name='2fa-status'),
    path('2fa/validate/', views_2fa.validate_2fa_login, name='2fa-validate'),
]
