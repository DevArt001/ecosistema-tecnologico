from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from config import views_webhook
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from config.views import CustomTokenObtainPairView
from clientes.views import ClienteViewSet, VehiculoViewSet, PromocionViewSet, FidelizacionView
from usuarios.views import AuditLogViewSet
from servicios.views import OrdenTrabajoViewSet
from inventario.views import CategoriaViewSet, ProveedorViewSet, ProductoViewSet, MovimientoViewSet
from contabilidad.views import FacturaViewSet, GastoViewSet, CotizacionViewSet

router = DefaultRouter()
router.register(r'clientes',     ClienteViewSet)
router.register(r'vehiculos',    VehiculoViewSet)
router.register(r'ordenes',      OrdenTrabajoViewSet)
router.register(r'categorias',   CategoriaViewSet)
router.register(r'proveedores',  ProveedorViewSet)
router.register(r'productos',    ProductoViewSet)
router.register(r'movimientos',  MovimientoViewSet)
router.register(r'facturas',     FacturaViewSet)
router.register(r'gastos',       GastoViewSet)
router.register(r'cotizaciones', CotizacionViewSet)
router.register(r'promociones',   PromocionViewSet)
router.register(r'fidelizacion',  FidelizacionView, basename='fidelizacion')
router.register(r'auditlog',       AuditLogViewSet,   basename='auditlog')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('webhook/deploy', views_webhook.deploy_webhook),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/', include(router.urls)),
    path('api/servicios/', include('servicios.urls')),
    path('api/agendamiento/', include('agendamiento.urls')),
    path('api/reportes/', include('contabilidad.urls')),
    path('api/usuarios/', include('usuarios.urls')),
    path('api/auth/login/',   CustomTokenObtainPairView.as_view(),  name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(),           name='token_refresh'),
]
