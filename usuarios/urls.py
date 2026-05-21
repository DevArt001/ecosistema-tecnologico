from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.UsuarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('modulos/', views.modulos_disponibles, name='modulos'),
]
