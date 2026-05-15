from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Cita, ConfigTaller, DiaEspecial
from .serializers import CitaSerializer, ConfigTallerSerializer, DiaEspecialSerializer
from clientes.models import Cliente, Vehiculo

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer

class ConfigTallerViewSet(viewsets.ModelViewSet):
    queryset = ConfigTaller.objects.all()
    serializer_class = ConfigTallerSerializer

class DiaEspecialViewSet(viewsets.ModelViewSet):
    queryset = DiaEspecial.objects.all()
    serializer_class = DiaEspecialSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def buscar_cliente(request):
    documento = request.data.get('documento')
    try:
        cliente = Cliente.objects.get(documento=documento)
        return Response({'id': cliente.id, 'nombre': cliente.nombre, 'telefono': cliente.telefono})
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_cliente_publico(request):
    cliente = Cliente.objects.create(
        nombre=request.data.get('nombre'),
        documento=request.data.get('documento'),
        telefono=request.data.get('telefono'),
        correo=request.data.get('correo', ''),
    )
    return Response({'id': cliente.id, 'nombre': cliente.nombre}, status=201)

@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_vehiculo_publico(request):
    cliente_id = request.data.get('cliente_id')
    vehiculo = Vehiculo.objects.create(
        cliente_id=cliente_id,
        placa=request.data.get('placa'),
        marca=request.data.get('marca'),
        linea=request.data.get('linea'),
        modelo=request.data.get('modelo'),
        tipo=request.data.get('tipo', 'auto'),
    )
    return Response({'id': vehiculo.id, 'placa': vehiculo.placa}, status=201)

@api_view(['GET'])
@permission_classes([AllowAny])
def disponibilidad_mes(request):
    mes = request.query_params.get('mes')
    anio = request.query_params.get('anio')
    config = ConfigTaller.objects.first()
    
    diasEspeciales = DiaEspecial.objects.filter(fecha__month=mes, fecha__year=anio)
    return Response({
        'dias_especiales': DiaEspecialSerializer(diasEspeciales, many=True).data,
        'config': ConfigTallerSerializer(config).data if config else {}
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def horas_disponibles(request):
    fecha = request.query_params.get('fecha')
    config = ConfigTaller.objects.first()
    
    citas = Cita.objects.filter(fecha=fecha, estado__in=['pendiente', 'confirmada'])
    ocupadas = citas.count()
    disponibles = (config.max_citas_hora if config else 4) - ocupadas
    
    return Response({'disponibles': max(0, disponibles), 'ocupadas': ocupadas})

@api_view(['POST'])
@permission_classes([AllowAny])
def crear_cita_publica(request):
    cita = Cita.objects.create(
        cliente_id=request.data.get('cliente_id'),
        vehiculo_id=request.data.get('vehiculo_id'),
        fecha=request.data.get('fecha'),
        hora=request.data.get('hora'),
        tipo='normal',
        estado='pendiente',
        descripcion=request.data.get('descripcion', ''),
    )
    return Response(CitaSerializer(cita).data, status=201)

@api_view(['POST'])
@permission_classes([AllowAny])
def solicitar_cita_especial(request):
    cita = Cita.objects.create(
        cliente_id=request.data.get('cliente_id'),
        vehiculo_id=request.data.get('vehiculo_id'),
        fecha=request.data.get('fecha'),
        hora=request.data.get('hora'),
        tipo='especial',
        estado='pendiente',
        descripcion=request.data.get('descripcion', ''),
    )
    return Response(CitaSerializer(cita).data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generar_link_temporal(request, orden_id):
    from .models_portal import LinkTemporal
    from servicios.models import OrdenTrabajo
    
    try:
        orden = OrdenTrabajo.objects.get(pk=orden_id)
    except OrdenTrabajo.DoesNotExist:
        return Response({'error': 'Orden no encontrada'}, status=404)
    
    link = LinkTemporal.crear_link(orden, dias=15)
    
    return Response({
        'mensaje': 'Link generado exitosamente',
        'token': link.token,
        'url': '/portal/' + link.token,
        'caduca_en': link.fecha_expiracion,
        'dias': link.dias_restantes(),
    }, status=201)

@api_view(['GET'])
@permission_classes([AllowAny])
def acceder_portal_cliente(request, token):
    from .models_portal import LinkTemporal
    from servicios.serializers import OrdenTrabajoConDetallesSerializer
    
    try:
        link = LinkTemporal.objects.get(token=token)
    except LinkTemporal.DoesNotExist:
        return Response({'error': 'Link inválido o expirado'}, status=404)
    
    if not link.esta_vigente():
        return Response({'error': 'Este link ha expirado'}, status=401)
    
    orden = link.orden
    datos = OrdenTrabajoConDetallesSerializer(orden).data
    
    return Response({
        'cliente': datos.get('cliente'),
        'vehiculo': datos.get('vehiculo'),
        'orden': datos,
        'dias_restantes': link.dias_restantes(),
    })
