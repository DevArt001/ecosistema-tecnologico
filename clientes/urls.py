from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, VehiculoViewSet, PromocionViewSet, FidelizacionView

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'vehiculos', VehiculoViewSet)
router.register(r'promociones', PromocionViewSet)
router.register(r'fidelizacion', FidelizacionView, basename='fidelizacion')

urlpatterns = router.urls