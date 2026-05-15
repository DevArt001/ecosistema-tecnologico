from rest_framework import serializers
from .models import OrdenTrabajo, FotoProcesoOrden, PasoProcesoOrden

class FotoProcesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoProcesoOrden
        fields = ['id', 'foto', 'descripcion', 'paso_numero', 'fecha_subida']

class PasoProcesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasoProcesoOrden
        fields = ['id', 'numero', 'titulo', 'descripcion', 'estado', 'tiempo_minutos']

class OrdenTrabajoSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    vehiculo_placa = serializers.CharField(source='vehiculo.placa', read_only=True)
    
    class Meta:
        model = OrdenTrabajo
        fields = '__all__'

class OrdenTrabajoConDetallesSerializer(serializers.ModelSerializer):
    pasos = PasoProcesoSerializer(source='pasos_proceso', many=True, read_only=True)
    fotos = FotoProcesoSerializer(source='fotos_proceso', many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    vehiculo_placa = serializers.CharField(source='vehiculo.placa', read_only=True)
    
    class Meta:
        model = OrdenTrabajo
        fields = ['id', 'codigo', 'cliente', 'cliente_nombre', 'vehiculo', 'vehiculo_placa',
                  'estado', 'descripcion', 'trabajo_realizado', 'costo_final', 'fecha_ingreso', 'pasos', 'fotos']
