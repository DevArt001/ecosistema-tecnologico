from rest_framework import serializers
from .models import OrdenTrabajo

class OrdenTrabajoSerializer(serializers.ModelSerializer):
    cliente_nombre  = serializers.CharField(source='cliente.nombre', read_only=True)
    vehiculo_placa  = serializers.CharField(source='vehiculo.placa', read_only=True)

    class Meta:
        model  = OrdenTrabajo
        fields = '__all__'