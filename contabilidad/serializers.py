from rest_framework import serializers
from .models import Factura, Gasto

class FacturaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)

    class Meta:
        model  = Factura
        fields = '__all__'

class GastoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Gasto
        fields = '__all__'