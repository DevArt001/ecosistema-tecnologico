from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from clientes.views import ClienteViewSet, VehiculoViewSet
from servicios.views import OrdenTrabajoViewSet
from inventario.views import CategoriaViewSet, ProveedorViewSet, ProductoViewSet, MovimientoViewSet
from contabilidad.views import FacturaViewSet, GastoViewSet


router = DefaultRouter()
router.register(r'clientes',     ClienteViewSet)
router.register(r'vehiculos',    VehiculoViewSet)
router.register(r'ordenes',      OrdenTrabajoViewSet)
router.register(r'categorias',   CategoriaViewSet)
router.register(r'proveedores',  ProveedorViewSet)
router.register(r'productos',    ProductoViewSet)
router.register(r'movimientos',  MovimientoViewSet)
router.register(r'facturas',  FacturaViewSet)
router.register(r'gastos',    GastoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]