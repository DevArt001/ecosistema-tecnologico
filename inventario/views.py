from rest_framework import viewsets, filters
from django.core.cache import cache
from usuarios.audit import log as audit_log
from .models import Categoria, Proveedor, Producto, MovimientoInventario, OrdenCompra, LineaOrdenCompra, HistorialPrecioProveedor
from .serializers import CategoriaSerializer, ProveedorSerializer, ProductoSerializer, MovimientoSerializer, OrdenCompraSerializer, LineaOrdenCompraSerializer, HistorialPrecioSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset         = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset         = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['nombre', 'ciudad']

class ProductoViewSet(viewsets.ModelViewSet):
    queryset         = Producto.objects.select_related('categoria', 'proveedor').all()
    serializer_class = ProductoSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['sku', 'nombre']
    ordering_fields  = ['nombre', 'stock_actual', 'precio_venta']

    def perform_create(self, serializer):
        obj = serializer.save()
        audit_log(self.request.user, 'crear', 'inventario', f'Producto creado: {obj.nombre} SKU:{obj.sku}', self.request)

    def perform_update(self, serializer):
        obj = serializer.save()
        audit_log(self.request.user, 'editar', 'inventario', f'Producto editado: {obj.nombre}', self.request)

    def perform_destroy(self, instance):
        audit_log(self.request.user, 'eliminar', 'inventario', f'Producto eliminado: {instance.nombre}', self.request)
        instance.delete()

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset         = MovimientoInventario.objects.select_related('producto').all()
    serializer_class = MovimientoSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['producto__nombre']


from rest_framework.decorators import action
from rest_framework.response import Response
import datetime

class OrdenCompraViewSet(viewsets.ModelViewSet):
    queryset         = OrdenCompra.objects.select_related('proveedor').all()
    serializer_class = OrdenCompraSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['numero', 'proveedor__nombre']
    ordering_fields  = ['fecha_emision', 'total']

    @action(detail=True, methods=['post'])
    def agregar_linea(self, request, pk=None):
        orden = self.get_object()
        s = LineaOrdenCompraSerializer(data={**request.data, 'orden': orden.id})
        if s.is_valid():
            linea = s.save()
            # Actualizar total
            orden.subtotal = sum(l.subtotal for l in orden.lineas.all())
            orden.total    = orden.subtotal
            orden.save()
            # Guardar historial de precio
            HistorialPrecioProveedor.objects.create(
                proveedor=orden.proveedor,
                producto_id=request.data.get('producto'),
                precio=request.data.get('precio_unit', 0)
            )
            return Response(OrdenCompraSerializer(orden).data)
        return Response(s.errors, status=400)

    @action(detail=True, methods=['post'])
    def recibir(self, request, pk=None):
        orden = self.get_object()
        orden.estado         = 'recibida'
        orden.fecha_recibida = datetime.date.today()
        orden.save()
        # Actualizar stock de productos
        for linea in orden.lineas.all():
            prod = linea.producto
            stock_antes = prod.stock_actual
            prod.stock_actual += linea.cantidad
            prod.save()
            MovimientoInventario.objects.create(
                producto=prod, tipo='entrada',
                cantidad=linea.cantidad,
                stock_antes=stock_antes,
                stock_despues=prod.stock_actual,
                motivo=f'Orden de compra {orden.numero}'
            )
        return Response({'mensaje': f'Orden {orden.numero} recibida. Stock actualizado.'})

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        ordenes = OrdenCompra.objects.filter(estado__in=['enviada','confirmada'])
        return Response(OrdenCompraSerializer(ordenes, many=True).data)


class HistorialPrecioViewSet(viewsets.ModelViewSet):
    queryset         = HistorialPrecioProveedor.objects.select_related('proveedor','producto').all()
    serializer_class = HistorialPrecioSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['proveedor__nombre', 'producto__nombre']
