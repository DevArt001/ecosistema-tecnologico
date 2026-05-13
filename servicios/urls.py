from rest_framework.routers import DefaultRouter
from .views import OrdenTrabajoViewSet

router = DefaultRouter()
router.register(r'ordenes', OrdenTrabajoViewSet)

urlpatterns = router.urls