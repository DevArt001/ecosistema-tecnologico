from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, ProveedorViewSet, ProductoViewSet, MovimientoViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'proveedores', ProveedorViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'movimientos', MovimientoViewSet)

urlpatterns = router.urls