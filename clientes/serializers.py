from rest_framework import serializers
from .models import Cliente, Vehiculo, HistorialPuntos, Promocion

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Vehiculo
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    vehiculos = VehiculoSerializer(many=True, read_only=True)
    
    class Meta:
        model  = Cliente
        fields = '__all__'

class HistorialPuntosSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialPuntos
        fields = '__all__'

class PromocionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocion
        fields = '__all__'
