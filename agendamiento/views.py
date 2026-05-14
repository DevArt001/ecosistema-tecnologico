from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
import datetime
from django.db.models import Count
from .models import Cita, ConfigTaller, DiaEspecial
from .serializers import CitaSerializer, ConfigTallerSerializer, DiaEspecialSerializer, ClientePublicoSerializer, VehiculoPublicoSerializer
from clientes.models import Cliente, Vehiculo

class CitaViewSet(viewsets.ModelViewSet):
    queryset           = Cita.objects.all()
    serializer_class   = CitaSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        qs   = Cita.objects.all()
        fecha = self.request.query_params.get('fecha')
        mes   = self.request.query_params.get('mes')
        anio  = self.request.query_params.get('anio')
        if fecha: qs = qs.filter(fecha=fecha)
        if mes and anio: qs = qs.filter(fecha__month=mes, fecha__year=anio)
        return qs

class ConfigTallerViewSet(viewsets.ModelViewSet):
    queryset           = ConfigTaller.objects.all()
    serializer_class   = ConfigTallerSerializer
    permission_classes = [IsAuthenticated]

class DiaEspecialViewSet(viewsets.ModelViewSet):
    queryset           = DiaEspecial.objects.all()
    serializer_class   = DiaEspecialSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
@permission_classes([AllowAny])
def buscar_cliente(request):
    documento = request.data.get('documento','').strip()
    if not documento:
        return Response({'error':'Ingresa tu numero de documento'}, status=400)
    try:
        cliente   = Cliente.objects.get(documento=documento)
        vehiculos = Vehiculo.objects.filter(cliente=cliente)
        return Response({'existe':True,'cliente':ClientePublicoSerializer(cliente).data,'vehiculos':VehiculoPublicoSerializer(vehiculos,many=True).data})
    except Cliente.DoesNotExist:
        return Response({'existe':False})

@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_cliente_publico(request):
    s = ClientePublicoSerializer(data=request.data)
    if s.is_valid():
        c = s.save()
        return Response({'cliente':ClientePublicoSerializer(c).data}, status=201)
    return Response(s.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_vehiculo_publico(request):
    s = VehiculoPublicoSerializer(data=request.data)
    if s.is_valid():
        v = s.save()
        return Response({'vehiculo':VehiculoPublicoSerializer(v).data}, status=201)
    return Response(s.errors, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def disponibilidad_mes(request):
    mes  = int(request.query_params.get('mes',  timezone.now().month))
    anio = int(request.query_params.get('anio', timezone.now().year))
    config    = ConfigTaller.objects.first()
    max_citas = config.max_citas_hora if config else 4
    dias_especiales = DiaEspecial.objects.filter(fecha__month=mes, fecha__year=anio)
    bloqueados = set(str(d.fecha) for d in dias_especiales if d.tipo in ['festivo','bloqueado'])
    citas_mes  = Cita.objects.filter(fecha__month=mes,fecha__year=anio,estado__in=['pendiente','confirmada']).values('fecha','hora').annotate(total=Count('id'))
    ocupacion  = {}
    for c in citas_mes:
        key = str(c['fecha'])
        if key not in ocupacion: ocupacion[key] = {}
        hora_str = str(c['hora']) if isinstance(c['hora'], datetime.time) else c['hora']
        ocupacion[key][hora_str] = c['total']
    return Response({'mes':mes,'anio':anio,'max_citas_hora':max_citas,'bloqueados':list(bloqueados),'ocupacion':ocupacion,'config':ConfigTallerSerializer(config).data if config else None,'dias_especiales':DiaEspecialSerializer(dias_especiales,many=True).data})

@api_view(['GET'])
@permission_classes([AllowAny])
def horas_disponibles(request):
    fecha_str = request.query_params.get('fecha')
    if not fecha_str: return Response({'error':'Fecha requerida'}, status=400)
    fecha  = datetime.date.fromisoformat(fecha_str)
    config = ConfigTaller.objects.first()
    es_sabado = fecha.weekday() == 5
    if es_sabado and config:
        apertura = config.sabado_apertura
        cierre   = config.sabado_cierre
    elif config:
        apertura = config.hora_apertura
        cierre   = config.hora_cierre
    else:
        apertura = datetime.time(8,0)
        cierre   = datetime.time(18,0)
    max_citas = config.max_citas_hora if config else 4
    horas = []
    h = datetime.datetime.combine(fecha, apertura)
    fin = datetime.datetime.combine(fecha, cierre)
    while h < fin:
        ht = h.time()
        ocupadas = Cita.objects.filter(fecha=fecha,hora=ht,estado__in=['pendiente','confirmada']).count()
        horas.append({'hora':ht.strftime('%H:%M'),'disponibles':max_citas-ocupadas,'ocupadas':ocupadas})
        h += datetime.timedelta(hours=1)
    return Response({'fecha':fecha_str,'horas':horas})

@api_view(['POST'])
@permission_classes([AllowAny])
def crear_cita_publica(request):
    s = CitaSerializer(data=request.data)
    if s.is_valid():
        cita = s.save()
        return Response({'mensaje':'Cita agendada exitosamente!','cita':CitaSerializer(cita).data}, status=201)
    return Response(s.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def solicitar_cita_especial(request):
    data = request.data.copy()
    data['tipo']   = 'especial'
    data['estado'] = 'pendiente'
    s = CitaSerializer(data=data)
    if s.is_valid():
        cita = s.save()
        return Response({'mensaje':'Solicitud enviada. El taller la revisara y te confirmara.','cita':CitaSerializer(cita).data}, status=201)
    return Response(s.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def convertir_en_orden(request, cita_id):
    try:
        cita = Cita.objects.get(pk=cita_id)
    except Cita.DoesNotExist:
        return Response({'error': 'Cita no encontrada'}, status=404)

    if cita.orden:
        return Response({'error': 'Esta cita ya tiene una orden generada', 'orden_id': cita.orden.id}, status=400)

    from servicios.models import OrdenTrabajo
    orden = OrdenTrabajo.objects.create(
        cliente=cita.cliente,
        vehiculo=cita.vehiculo,
        descripcion=cita.descripcion or 'Orden generada desde cita agendada',
        tecnico=cita.tecnico,
        estado='recibido',
        prioridad='normal',
    )
    cita.orden  = orden
    cita.estado = 'completada'
    cita.save()

    return Response({
        'mensaje': 'Orden de trabajo creada exitosamente',
        'orden_id': orden.id,
        'orden_codigo': orden.codigo,
    }, status=201)
