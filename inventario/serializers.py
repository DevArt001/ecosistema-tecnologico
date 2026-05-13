from rest_framework import serializers
from .models import Categoria, Proveedor, Producto, MovimientoInventario

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