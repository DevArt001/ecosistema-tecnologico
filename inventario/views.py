from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import Categoria, Proveedor, Producto, MovimientoInventario
from .serializers import CategoriaSerializer, ProveedorSerializer, ProductoSerializer, MovimientoSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset         = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset         = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['nombre', 'ciudad']

class ProductoViewSet(viewsets.ModelViewSet):
    queryset         = Producto.objects.all()
    serializer_class = ProductoSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['sku', 'nombre']
    ordering_fields  = ['nombre', 'stock_actual', 'precio_venta']

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset         = MovimientoInventario.objects.all()
    serializer_class = MovimientoSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['producto__nombre']