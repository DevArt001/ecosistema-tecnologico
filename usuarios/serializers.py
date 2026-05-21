from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PerfilUsuario, ROLES, MODULOS

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['rol', 'permisos', 'telefono', 'activo']

class UsuarioSerializer(serializers.ModelSerializer):
    perfil      = PerfilSerializer(read_only=True)
    rol         = serializers.CharField(write_only=True, required=False)
    telefono    = serializers.CharField(write_only=True, required=False)
    password    = serializers.CharField(write_only=True, required=False)

    class Meta:
        model  = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'password', 'is_active', 'perfil', 'rol', 'telefono']

    def create(self, validated_data):
        rol      = validated_data.pop('rol', 'tecnico')
        telefono = validated_data.pop('telefono', '')
        password = validated_data.pop('password', None)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()

        PerfilUsuario.objects.create(usuario=user, rol=rol, telefono=telefono)
        return user

    def update(self, instance, validated_data):
        rol      = validated_data.pop('rol', None)
        telefono = validated_data.pop('telefono', None)
        password = validated_data.pop('password', None)

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()

        perfil = instance.perfil
        if rol:
            perfil.rol = rol
        if telefono is not None:
            perfil.telefono = telefono
        perfil.save()
        return instance
