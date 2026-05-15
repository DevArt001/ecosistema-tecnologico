from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'citas',          views.CitaViewSet)
router.register(r'config-taller',  views.ConfigTallerViewSet)
router.register(r'dias-especiales',views.DiaEspecialViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('publico/buscar-cliente/',     views.buscar_cliente,            name='buscar-cliente'),
    path('publico/registrar-cliente/',  views.registrar_cliente_publico, name='registrar-cliente'),
    path('publico/registrar-vehiculo/', views.registrar_vehiculo_publico,name='registrar-vehiculo'),
    path('publico/disponibilidad/',     views.disponibilidad_mes,        name='disponibilidad'),
    path('publico/horas-disponibles/',  views.horas_disponibles,         name='horas-disponibles'),
    path('publico/crear-cita/',         views.crear_cita_publica,        name='crear-cita'),
    path('publico/cita-especial/',      views.solicitar_cita_especial,   name='cita-especial'),
    path('ordenes/<int:orden_id>/generar-link/', views.generar_link_temporal, name='generar-link'),
    path('portal/<str:token>/', views.acceder_portal_cliente, name='acceder-portal'),
]
