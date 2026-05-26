from django.shortcuts import render
from rest_framework import viewsets, filters
from usuarios.audit import log as audit_log
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cliente, Vehiculo, HistorialPuntos, Promocion
from .serializers import ClienteSerializer, VehiculoSerializer, HistorialPuntosSerializer, PromocionSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset         = Cliente.objects.all()
    serializer_class = ClienteSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['nombre', 'documento', 'telefono']
    ordering_fields  = ['nombre', 'fecha_registro']

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset         = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['placa', 'marca', 'cliente__nombre']

class PromocionViewSet(viewsets.ModelViewSet):
    queryset = Promocion.objects.filter(activa=True)
    serializer_class = PromocionSerializer

class FidelizacionView(viewsets.ViewSet):

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        from django.utils import timezone
        from datetime import timedelta
        from servicios.models import OrdenTrabajo

        hoy = timezone.now()
        hace3meses = hoy - timedelta(days=90)

        clientes = Cliente.objects.all()
        data = []

        for c in clientes:
            ultima_orden = OrdenTrabajo.objects.filter(cliente=c).order_by('-fecha_ingreso').first()
            total_ordenes = OrdenTrabajo.objects.filter(cliente=c).count()
            inactivo = False
            dias_sin_visita = None

            if ultima_orden:
                dias_sin_visita = (hoy - ultima_orden.fecha_ingreso).days
                inactivo = ultima_orden.fecha_ingreso < hace3meses
            else:
                inactivo = True

            # Calcular proxima promo
            proxima_promo = Promocion.objects.filter(
                activa=True, puntos_req__gt=c.puntos
            ).order_by('puntos_req').first()

            data.append({
                'id': c.id,
                'nombre': c.nombre,
                'telefono': c.telefono,
                'puntos': c.puntos,
                'total_ordenes': total_ordenes,
                'inactivo': inactivo,
                'dias_sin_visita': dias_sin_visita,
                'proxima_promo': {
                    'nombre': proxima_promo.nombre,
                    'puntos_req': proxima_promo.puntos_req,
                    'puntos_faltan': proxima_promo.puntos_req - c.puntos,
                    'imagen': proxima_promo.imagen,
                } if proxima_promo else None,
            })

        return Response(data)

    @action(detail=False, methods=['post'])
    def agregar_puntos(self, request):
        cliente_id = request.data.get('cliente_id')
        puntos = int(request.data.get('puntos', 0))
        descripcion = request.data.get('descripcion', 'Puntos agregados')

        cliente = Cliente.objects.get(id=cliente_id)
        cliente.puntos += puntos
        cliente.save()

        HistorialPuntos.objects.create(
            cliente=cliente,
            tipo='ganado',
            puntos=puntos,
            descripcion=descripcion
        )
        return Response({'puntos_total': cliente.puntos})

    @action(detail=False, methods=['post'])
    def canjear(self, request):
        cliente_id = request.data.get('cliente_id')
        promo_id = request.data.get('promo_id')

        cliente = Cliente.objects.get(id=cliente_id)
        promo = Promocion.objects.get(id=promo_id)

        if cliente.puntos < promo.puntos_req:
            return Response({'error': 'Puntos insuficientes'}, status=400)

        cliente.puntos -= promo.puntos_req
        cliente.save()

        HistorialPuntos.objects.create(
            cliente=cliente,
            tipo='canjeado',
            puntos=-promo.puntos_req,
            descripcion=f'Canje: {promo.nombre}'
        )
        return Response({'puntos_total': cliente.puntos, 'promo': promo.nombre})

    @action(detail=False, methods=['get'])
    def clientes_inactivos(self, request):
        from django.utils import timezone
        from datetime import timedelta
        from servicios.models import OrdenTrabajo

        hoy = timezone.now()
        hace3meses = hoy - timedelta(days=90)

        clientes_inactivos = []
        for c in Cliente.objects.all():
            ultima = OrdenTrabajo.objects.filter(cliente=c).order_by('-fecha_ingreso').first()
            if not ultima or ultima.fecha_ingreso < hace3meses:
                dias = (hoy - ultima.fecha_ingreso).days if ultima else None
                clientes_inactivos.append({
                    'id': c.id,
                    'nombre': c.nombre,
                    'telefono': c.telefono,
                    'dias_sin_visita': dias,
                    'puntos': c.puntos,
                })

        return Response(clientes_inactivos)
