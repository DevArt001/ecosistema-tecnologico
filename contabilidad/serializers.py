from rest_framework import serializers
from .models import Factura, Gasto, Cotizacion, LineaCotizacion, LineaFactura

class LineaFacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineaFactura
        fields = '__all__'

class FacturaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    lineas         = LineaFacturaSerializer(many=True, read_only=True)
    class Meta:
        model = Factura
        fields = '__all__'

class GastoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gasto
        fields = '__all__'

class LineaCotizacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineaCotizacion
        fields = '__all__'

class CotizacionSerializer(serializers.ModelSerializer):
    lineas = LineaCotizacionSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    cliente_telefono = serializers.CharField(source='cliente.telefono', read_only=True)
    cliente_email = serializers.CharField(source='cliente.correo', read_only=True)
    orden_codigo = serializers.CharField(source='orden.codigo', read_only=True)
    vehiculo_info = serializers.SerializerMethodField()

    def get_vehiculo_info(self, obj):
        v = obj.orden.vehiculo
        return f"{v.marca} {v.modelo} {v.placa}" if v else ""

    class Meta:
        model = Cotizacion
        fields = '__all__'
