from rest_framework import viewsets, filters
from .models import Factura, Gasto
from .serializers import FacturaSerializer, GastoSerializer

class FacturaViewSet(viewsets.ModelViewSet):
    queryset         = Factura.objects.all()
    serializer_class = FacturaSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['numero', 'cliente__nombre']
    ordering_fields  = ['fecha_emision', 'total']

class GastoViewSet(viewsets.ModelViewSet):
    queryset         = Gasto.objects.all()
    serializer_class = GastoSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['descripcion', 'categoria']
    ordering_fields  = ['fecha', 'monto']