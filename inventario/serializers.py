from rest_framework import serializers
from .models import Categoria, Proveedor, Producto, MovimientoInventario, OrdenCompra, LineaOrdenCompra, HistorialPrecioProveedor

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Categoria
        fields = '__all__'

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Proveedor
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    margen      = serializers.ReadOnlyField()
    estado_stock= serializers.ReadOnlyField()
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model  = Producto
        fields = '__all__'

class MovimientoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model  = MovimientoInventario
        fields = '__all__'

class LineaOrdenCompraSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_sku    = serializers.CharField(source='producto.sku', read_only=True)
    class Meta:
        model = LineaOrdenCompra
        fields = '__all__'

class OrdenCompraSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    lineas           = LineaOrdenCompraSerializer(many=True, read_only=True)
    class Meta:
        model = OrdenCompra
        fields = '__all__'

class HistorialPrecioSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    producto_nombre  = serializers.CharField(source='producto.nombre', read_only=True)
    class Meta:
        model = HistorialPrecioProveedor
        fields = '__all__'
