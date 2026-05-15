from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import OrdenTrabajo, FotoProcesoOrden, PasoProcesoOrden
from .serializers import (
    OrdenTrabajoSerializer, 
    OrdenTrabajoConDetallesSerializer,
    FotoProcesoSerializer,
    PasoProcesoSerializer
)

class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset         = OrdenTrabajo.objects.all()
    serializer_class = OrdenTrabajoSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['codigo', 'cliente__nombre', 'vehiculo__placa']
    ordering_fields  = ['fecha_ingreso', 'estado', 'prioridad']

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_orden_con_proceso(request, orden_id):
    try:
        orden = OrdenTrabajo.objects.get(pk=orden_id)
    except OrdenTrabajo.DoesNotExist:
        return Response({'error': 'Orden no encontrada'}, status=404)
    
    pasos = orden.pasos_proceso.all()
    fotos = orden.fotos_proceso.all()
    
    return Response({
        'orden': OrdenTrabajoSerializer(orden).data,
        'pasos': PasoProcesoSerializer(pasos, many=True).data,
        'fotos': FotoProcesoSerializer(fotos, many=True).data,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def agregar_paso_proceso(request, orden_id):
    try:
        orden = OrdenTrabajo.objects.get(pk=orden_id)
    except OrdenTrabajo.DoesNotExist:
        return Response({'error': 'Orden no encontrada'}, status=404)
    
    data = request.data
    paso = PasoProcesoOrden.objects.create(
        orden=orden,
        numero=data.get('numero', orden.pasos_proceso.count() + 1),
        titulo=data.get('titulo'),
        descripcion=data.get('descripcion'),
        estado=data.get('estado', 'pendiente'),
    )
    
    return Response(PasoProcesoSerializer(paso).data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def agregar_foto_proceso(request, orden_id):
    try:
        orden = OrdenTrabajo.objects.get(pk=orden_id)
    except OrdenTrabajo.DoesNotExist:
        return Response({'error': 'Orden no encontrada'}, status=404)
    
    foto = FotoProcesoOrden.objects.create(
        orden=orden,
        foto=request.FILES.get('foto'),
        descripcion=request.data.get('descripcion', ''),
        paso_numero=request.data.get('paso_numero', 1),
    )
    
    return Response(FotoProcesoSerializer(foto).data, status=201)
