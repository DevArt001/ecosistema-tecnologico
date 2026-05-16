from rest_framework.routers import DefaultRouter
from .views import FacturaViewSet, GastoViewSet, CotizacionViewSet

router = DefaultRouter()
router.register('facturas', FacturaViewSet)
router.register('gastos', GastoViewSet)
router.register('cotizaciones', CotizacionViewSet)

urlpatterns = router.urls
