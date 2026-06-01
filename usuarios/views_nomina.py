from rest_framework import viewsets, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers
from .models_nomina import Empleado, PagoServicio, PagoNomina
import datetime

class EmpleadoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True, default='')
    class Meta:
        model = Empleado
        fields = '__all__'

class PagoServicioSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre', read_only=True)
    orden_codigo    = serializers.CharField(source='orden.codigo', read_only=True, default='')
    class Meta:
        model = PagoServicio
        fields = '__all__'

class PagoNominaSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre', read_only=True)
    class Meta:
        model = PagoNomina
        fields = '__all__'

class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset         = Empleado.objects.select_related('usuario').all()
    serializer_class = EmpleadoSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['nombre', 'documento', 'cargo']

    @action(detail=True, methods=['get'])
    def resumen(self, request, pk=None):
        empleado = self.get_object()
        hoy = datetime.date.today()
        inicio_mes = hoy.replace(day=1)

        pagos_mes = PagoServicio.objects.filter(
            empleado=empleado, fecha__gte=inicio_mes
        )
        total_mes     = sum(float(p.monto_pago) for p in pagos_mes)
        pendiente_mes = sum(float(p.monto_pago) for p in pagos_mes if p.estado == 'pendiente')
        ordenes_mes   = pagos_mes.count()

        pagos_pendientes = PagoServicio.objects.filter(
            empleado=empleado, estado='pendiente'
        )
        total_pendiente = sum(float(p.monto_pago) for p in pagos_pendientes)

        return Response({
            'empleado': EmpleadoSerializer(empleado).data,
            'mes_actual': {
                'total': total_mes,
                'pendiente': pendiente_mes,
                'ordenes': ordenes_mes,
            },
            'total_pendiente': total_pendiente,
            'pagos_recientes': PagoServicioSerializer(
                PagoServicio.objects.filter(empleado=empleado).order_by('-fecha')[:10],
                many=True
            ).data
        })

    @action(detail=True, methods=['post'])
    def generar_nomina(self, request, pk=None):
        empleado = self.get_object()
        hoy = datetime.date.today()
        inicio = request.data.get('inicio', hoy.replace(day=1).isoformat())
        fin    = request.data.get('fin', hoy.isoformat())

        pagos = PagoServicio.objects.filter(
            empleado=empleado,
            fecha__gte=inicio,
            fecha__lte=fin,
            estado='pendiente'
        )
        total_servicios = sum(float(p.monto_pago) for p in pagos)
        salario_base    = float(empleado.salario_base) if empleado.tipo_pago in ['fijo','mixto'] else 0
        deducciones     = float(request.data.get('deducciones', 0))

        nomina = PagoNomina.objects.create(
            empleado=empleado,
            periodo_inicio=inicio,
            periodo_fin=fin,
            salario_base=salario_base,
            total_servicios=total_servicios,
            deducciones=deducciones,
        )

        # Marcar pagos como pagados
        pagos.update(estado='pagado', fecha_pago=hoy)

        return Response(PagoNominaSerializer(nomina).data)


class PagoServicioViewSet(viewsets.ModelViewSet):
    queryset         = PagoServicio.objects.select_related('empleado','orden').all()
    serializer_class = PagoServicioSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['empleado__nombre', 'descripcion']
    ordering_fields  = ['fecha', 'monto_pago']

    @action(detail=True, methods=['post'])
    def marcar_pagado(self, request, pk=None):
        pago = self.get_object()
        pago.estado     = 'pagado'
        pago.fecha_pago = datetime.date.today()
        pago.save()
        return Response(PagoServicioSerializer(pago).data)


class PagoNominaViewSet(viewsets.ModelViewSet):
    queryset         = PagoNomina.objects.select_related('empleado').all()
    serializer_class = PagoNominaSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['empleado__nombre']
    ordering_fields  = ['periodo_fin', 'total_pagar']

    @action(detail=True, methods=['post'])
    def marcar_pagado(self, request, pk=None):
        nomina = self.get_object()
        nomina.estado     = 'pagado'
        nomina.fecha_pago = datetime.date.today()
        nomina.save()
        return Response(PagoNominaSerializer(nomina).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resumen_nomina(request):
    hoy = datetime.date.today()
    inicio_mes = hoy.replace(day=1)

    empleados = Empleado.objects.filter(activo=True)
    resumen = []

    for e in empleados:
        pagos_mes = PagoServicio.objects.filter(empleado=e, fecha__gte=inicio_mes)
        total_mes = sum(float(p.monto_pago) for p in pagos_mes)
        pendiente = sum(float(p.monto_pago) for p in pagos_mes if p.estado == 'pendiente')
        resumen.append({
            'id': e.id,
            'nombre': e.nombre,
            'cargo': e.cargo,
            'tipo_pago': e.tipo_pago,
            'salario_base': float(e.salario_base),
            'total_mes': total_mes,
            'pendiente': pendiente,
            'ordenes_mes': pagos_mes.count(),
        })

    total_pendiente_global = sum(r['pendiente'] for r in resumen)
    total_mes_global = sum(r['total_mes'] for r in resumen)

    return Response({
        'empleados': resumen,
        'total_mes': total_mes_global,
        'total_pendiente': total_pendiente_global,
        'mes': hoy.strftime('%B %Y'),
    })
