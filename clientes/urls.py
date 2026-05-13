from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, VehiculoViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'vehiculos', VehiculoViewSet)

urlpatterns = router.urls