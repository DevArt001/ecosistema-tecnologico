from rest_framework import viewsets, filters, status
from .audit_models import AuditLog
from .audit import log as audit_log
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import PerfilUsuario, ROLES, MODULOS, PERMISOS_POR_ROL
from .serializers import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('perfil')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        obj = serializer.save()
        audit_log(self.request.user, 'crear', 'usuarios', f'Usuario creado: @{obj.username}', self.request)

    def get_queryset(self):
        # Solo admin puede ver todos los usuarios
        user = self.request.user
        if hasattr(user, 'perfil') and user.perfil.rol == 'admin':
            return User.objects.all().select_related('perfil')
        return User.objects.filter(id=user.id)

    @action(detail=True, methods=['patch'])
    def cambiar_permisos(self, request, pk=None):
        usuario = self.get_object()
        permisos = request.data.get('permisos', [])
        perfil = usuario.perfil
        perfil.permisos = permisos
        perfil.save()
        return Response({'mensaje': 'Permisos actualizados', 'permisos': permisos})

    @action(detail=True, methods=['patch'])
    def cambiar_rol(self, request, pk=None):
        usuario = self.get_object()
        rol = request.data.get('rol')
        if rol not in [r[0] for r in ROLES]:
            return Response({'error': 'Rol inválido'}, status=400)
        perfil = usuario.perfil
        perfil.rol = rol
        perfil.permisos = PERMISOS_POR_ROL.get(rol, ['dashboard'])
        perfil.save()
        return Response({'mensaje': 'Rol actualizado', 'rol': rol})

    @action(detail=False, methods=['get'])
    def me(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def modulos_disponibles(request):
    return Response({
        'roles': [{'value': r[0], 'label': r[1]} for r in ROLES],
        'modulos': [{'value': m[0], 'label': m[1]} for m in MODULOS],
        'permisos_por_rol': PERMISOS_POR_ROL,
    })


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = AuditLog.objects.select_related('usuario').all()[:500]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['modulo', 'accion', 'descripcion', 'usuario__username']
    ordering_fields = ['fecha']

    def get_serializer_class(self):
        from rest_framework import serializers
        class AuditSerializer(serializers.ModelSerializer):
            usuario_nombre = serializers.CharField(source='usuario.username', default='Sistema')
            class Meta:
                from .audit_models import AuditLog
                model = AuditLog
                fields = ['id', 'usuario_nombre', 'accion', 'modulo',
                         'descripcion', 'ip', 'fecha']
        return AuditSerializer
