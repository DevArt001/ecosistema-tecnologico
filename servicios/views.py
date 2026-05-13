from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import OrdenTrabajo
from .serializers import OrdenTrabajoSerializer

class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset         = OrdenTrabajo.objects.all()
    serializer_class = OrdenTrabajoSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['codigo', 'cliente__nombre', 'vehiculo__placa']
    ordering_fields  = ['fecha_ingreso', 'estado', 'prioridad']