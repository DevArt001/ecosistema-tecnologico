from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import Cliente, Vehiculo
from .serializers import ClienteSerializer, VehiculoSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset         = Cliente.objects.all()
    serializer_class = ClienteSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['nombre', 'documento', 'telefono']
    ordering_fields  = ['nombre', 'fecha_registro']

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset         = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['placa', 'marca', 'cliente__nombre']