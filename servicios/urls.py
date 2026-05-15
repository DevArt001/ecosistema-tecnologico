from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'ordenes', views.OrdenTrabajoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ordenes/<int:orden_id>/proceso/', views.obtener_orden_con_proceso, name='obtener-proceso'),
    path('ordenes/<int:orden_id>/agregar-paso/', views.agregar_paso_proceso, name='agregar-paso'),
    path('ordenes/<int:orden_id>/agregar-foto/', views.agregar_foto_proceso, name='agregar-foto'),
]
