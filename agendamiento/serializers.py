from rest_framework import serializers
from .models import Cita, ConfigTaller, DiaEspecial
from clientes.models import Cliente, Vehiculo

class ConfigTallerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigTaller
        fields = '__all__'

class DiaEspecialSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiaEspecial
        fields = '__all__'

class CitaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre',   read_only=True)
    cliente_tel    = serializers.CharField(source='cliente.telefono', read_only=True)
    vehiculo_placa = serializers.CharField(source='vehiculo.placa',   read_only=True)
    vehiculo_marca = serializers.CharField(source='vehiculo.marca',   read_only=True)

    class Meta:
        model  = Cita
        fields = '__all__'

    def validate(self, data):
        fecha    = data.get('fecha')
        hora     = data.get('hora')
        tipo     = data.get('tipo', 'normal')
        instance = self.instance
        if fecha and hora and tipo == 'normal':
            qs = Cita.objects.filter(fecha=fecha, hora=hora, estado__in=['pendiente','confirmada'])
            if instance:
                qs = qs.exclude(pk=instance.pk)
            config    = ConfigTaller.objects.first()
            max_citas = config.max_citas_hora if config else 4
            if qs.count() >= max_citas:
                raise serializers.ValidationError(f"No hay cupos para el {fecha} a las {hora}.")
        return data

class ClientePublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Cliente
        fields = ['id','nombre','documento','telefono','whatsapp','correo','ciudad','tipo']

class VehiculoPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Vehiculo
        fields = ['id','placa','marca','linea','modelo','tipo','cliente']
