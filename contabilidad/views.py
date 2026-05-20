from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Factura, Gasto, Cotizacion, LineaCotizacion
from .serializers import FacturaSerializer, GastoSerializer, CotizacionSerializer, LineaCotizacionSerializer
import io

class FacturaViewSet(viewsets.ModelViewSet):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['numero', 'cliente__nombre']
    ordering_fields = ['fecha_emision', 'total']

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        factura = self.get_object()
        html = generar_html_factura(factura)
        response = HttpResponse(html, content_type='text/html')
        response['Content-Disposition'] = f'inline; filename="factura_{factura.numero}.html"'
        return response

class GastoViewSet(viewsets.ModelViewSet):
    queryset = Gasto.objects.all()
    serializer_class = GastoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['descripcion', 'categoria']
    ordering_fields = ['fecha', 'monto']

class CotizacionViewSet(viewsets.ModelViewSet):
    queryset = Cotizacion.objects.all()
    serializer_class = CotizacionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['numero', 'cliente__nombre']
    ordering_fields = ['fecha_emision', 'total']

    @action(detail=True, methods=['post'])
    def agregar_linea(self, request, pk=None):
        cotizacion = self.get_object()
        serializer = LineaCotizacionSerializer(data={**request.data, 'cotizacion': cotizacion.id})
        if serializer.is_valid():
            serializer.save()
            cotizacion.calcular_totales()
            return Response(CotizacionSerializer(cotizacion).data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'], url_path='eliminar_linea/(?P<linea_id>[^/.]+)')
    def eliminar_linea(self, request, pk=None, linea_id=None):
        cotizacion = self.get_object()
        LineaCotizacion.objects.filter(id=linea_id, cotizacion=cotizacion).delete()
        cotizacion.calcular_totales()
        return Response(CotizacionSerializer(cotizacion).data)

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        cotizacion = self.get_object()
        factura = cotizacion.convertir_a_factura()
        return Response({'mensaje': 'Cotizacion aprobada', 'factura_id': factura.id})

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        cotizacion = self.get_object()
        html = generar_html_cotizacion(cotizacion)
        response = HttpResponse(html, content_type='text/html')
        response['Content-Disposition'] = f'inline; filename="cotizacion_{cotizacion.numero}.html"'
        return response

def generar_html_cotizacion(cot):
    lineas_html = ""
    for l in cot.lineas.all():
        tipo_badge = "🔧" if l.tipo == "servicio" else "🔩"
        lineas_html += f"""
        <tr>
            <td>{tipo_badge} {l.descripcion}</td>
            <td style="text-align:center">{l.tipo.capitalize()}</td>
            <td style="text-align:center">{l.cantidad}</td>
            <td style="text-align:right">${float(l.precio_unit):,.0f}</td>
            <td style="text-align:right"><strong>${float(l.subtotal):,.0f}</strong></td>
        </tr>"""

    v = cot.orden.vehiculo
    vehiculo_info = f"{v.marca} {v.modelo} - {v.placa}" if v else "N/A"

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cotización {cot.numero}</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #333; }}
  .page {{ max-width: 800px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
  .header {{ background: linear-gradient(135deg, #0D1117, #1a2a1a); color: white; padding: 40px; display: flex; justify-content: space-between; align-items: center; }}
  .logo-area h1 {{ font-size: 28px; font-weight: 800; color: #10B981; }}
  .logo-area p {{ font-size: 12px; color: #9CA3AF; margin-top: 4px; }}
  .cotizacion-num {{ text-align: right; }}
  .cotizacion-num .num {{ font-size: 24px; font-weight: 700; color: #10B981; }}
  .cotizacion-num .fecha {{ font-size: 12px; color: #9CA3AF; margin-top: 4px; }}
  .badge {{ display: inline-block; background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 8px; }}
  .info-section {{ display: grid; grid-template-columns: 1fr 1fr; gap: 0; }}
  .info-box {{ padding: 24px 32px; border-bottom: 1px solid #eee; }}
  .info-box:nth-child(odd) {{ border-right: 1px solid #eee; }}
  .info-box h3 {{ font-size: 11px; font-weight: 600; color: #10B981; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 12px; }}
  .info-box p {{ font-size: 13px; color: #555; margin-bottom: 4px; }}
  .info-box strong {{ color: #111; }}
  table {{ width: 100%; border-collapse: collapse; }}
  .table-header {{ background: #0D1117; color: white; }}
  .table-header th {{ padding: 12px 16px; font-size: 12px; font-weight: 600; text-align: left; }}
  .table-header th:not(:first-child) {{ text-align: center; }}
  .table-header th:last-child {{ text-align: right; }}
  tbody tr:nth-child(even) {{ background: #f9f9f9; }}
  tbody td {{ padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #eee; }}
  .totales {{ padding: 24px 32px; display: flex; justify-content: flex-end; }}
  .totales-box {{ width: 280px; }}
  .totales-row {{ display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #eee; }}
  .totales-row.total {{ font-size: 18px; font-weight: 700; color: #10B981; border-bottom: none; padding-top: 12px; }}
  .footer {{ background: #0D1117; color: #9CA3AF; padding: 24px 32px; display: flex; justify-content: space-between; font-size: 12px; }}
  .footer strong {{ color: #10B981; }}
  .vigencia {{ padding: 16px 32px; background: #FFF8E1; border-left: 4px solid #F59E0B; margin: 0 32px 24px; border-radius: 0 8px 8px 0; font-size: 13px; color: #92400E; }}
  .print-btn {{ display: block; text-align: center; padding: 12px; background: #10B981; color: white; font-size: 14px; font-weight: 600; cursor: pointer; border: none; width: 100%; }}
  @media print {{ .print-btn {{ display: none; }} body {{ background: white; }} .page {{ box-shadow: none; margin: 0; }} }}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-area">
      <h1>🔧 ARM Racing Performance</h1>
      <p>Potencia, confianza y calidad en cada servicio</p>
      <p style="margin-top:8px">📍 Carrera 54b #50-09 sur, Venecia, Bogotá</p>
      <p>📞 323 233 8894 | ✉️ armracingpeformance@gmail.com</p>
    </div>
    <div class="cotizacion-num">
      <div class="num">{cot.numero}</div>
      <div class="fecha">{cot.fecha_emision.strftime('%d/%m/%Y')}</div>
      <div class="badge">COTIZACIÓN</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-box">
      <h3>Cliente</h3>
      <p><strong>{cot.cliente.nombre}</strong></p>
      <p>📞 {cot.cliente.telefono or 'N/A'}</p>
      <p>✉️ {cot.cliente.correo or 'N/A'}</p>
      <p>🪪 CC/NIT: {cot.cliente.documento or 'N/A'}</p>
    </div>
    <div class="info-box">
      <h3>Vehículo</h3>
      <p><strong>{vehiculo_info}</strong></p>
      <p>Orden: <strong>{cot.orden.codigo}</strong></p>
      <p>Kilometraje: {v.kilometraje if v and hasattr(v, 'kilometraje') else 'N/A'} km</p>
    </div>
  </div>

  <table>
    <thead class="table-header">
      <tr>
        <th>Descripción</th>
        <th style="text-align:center">Tipo</th>
        <th style="text-align:center">Cantidad</th>
        <th style="text-align:right">Precio Unit.</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      {lineas_html}
    </tbody>
  </table>

  <div class="totales">
    <div class="totales-box">
      <div class="totales-row"><span>Subtotal</span><span>${float(cot.subtotal):,.0f}</span></div>
      <div class="totales-row"><span>IVA (19%)</span><span>${float(cot.iva):,.0f}</span></div>
      <div class="totales-row"><span>Descuento</span><span>-${float(cot.descuento):,.0f}</span></div>
      <div class="totales-row total"><span>TOTAL</span><span>${float(cot.total):,.0f}</span></div>
    </div>
  </div>

  <div class="vigencia">
    ⏰ Esta cotización tiene una vigencia de <strong>{cot.vigencia_dias} días</strong> a partir de la fecha de emisión.
    {f'<br>📝 {cot.notas}' if cot.notas else ''}
  </div>

  <div class="footer">
    <div>
      <strong>ARM Racing Performance</strong><br>
      Lun-Sáb 8:00 AM - 7:30 PM<br>
      instagram: @arm_racing.performance
    </div>
    <div style="text-align:right">
      <strong>Firma autorizada</strong><br><br>
      ____________________<br>
      <span style="font-size:11px">ARM Racing Performance</span>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
</div>
</body>
</html>"""


def generar_html_factura(fac):
    orden_info = f"{fac.orden.codigo}" if fac.orden else "N/A"
    v = fac.orden.vehiculo if fac.orden else None
    vehiculo_info = f"{v.marca} {v.modelo} - {v.placa}" if v else "N/A"

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Factura {fac.numero}</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #333; }}
  .page {{ max-width: 800px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
  .header {{ background: linear-gradient(135deg, #0D1117, #1a2a1a); color: white; padding: 40px; display: flex; justify-content: space-between; align-items: center; }}
  .logo-area h1 {{ font-size: 28px; font-weight: 800; color: #10B981; }}
  .logo-area p {{ font-size: 12px; color: #9CA3AF; margin-top: 4px; }}
  .factura-num {{ text-align: right; }}
  .factura-num .num {{ font-size: 24px; font-weight: 700; color: #10B981; }}
  .factura-num .fecha {{ font-size: 12px; color: #9CA3AF; margin-top: 4px; }}
  .badge {{ display: inline-block; background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 8px; }}
  .info-section {{ display: grid; grid-template-columns: 1fr 1fr; gap: 0; }}
  .info-box {{ padding: 24px 32px; border-bottom: 1px solid #eee; }}
  .info-box:nth-child(odd) {{ border-right: 1px solid #eee; }}
  .info-box h3 {{ font-size: 11px; font-weight: 600; color: #10B981; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 12px; }}
  .info-box p {{ font-size: 13px; color: #555; margin-bottom: 4px; }}
  .totales {{ padding: 24px 32px; display: flex; justify-content: flex-end; }}
  .totales-box {{ width: 280px; }}
  .totales-row {{ display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #eee; }}
  .totales-row.total {{ font-size: 18px; font-weight: 700; color: #10B981; border-bottom: none; padding-top: 12px; }}
  .pago-info {{ padding: 16px 32px; background: #E8F5E9; border-left: 4px solid #10B981; margin: 0 32px 24px; border-radius: 0 8px 8px 0; font-size: 13px; color: #1B5E20; }}
  .footer {{ background: #0D1117; color: #9CA3AF; padding: 24px 32px; display: flex; justify-content: space-between; font-size: 12px; }}
  .footer strong {{ color: #10B981; }}
  .print-btn {{ display: block; text-align: center; padding: 12px; background: #10B981; color: white; font-size: 14px; font-weight: 600; cursor: pointer; border: none; width: 100%; }}
  @media print {{ .print-btn {{ display: none; }} }}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-area">
      <h1>🔧 ARM Racing Performance</h1>
      <p>Potencia, confianza y calidad en cada servicio</p>
      <p style="margin-top:8px">📍 Carrera 54b #50-09 sur, Venecia, Bogotá</p>
      <p>📞 323 233 8894 | ✉️ armracingpeformance@gmail.com</p>
    </div>
    <div class="factura-num">
      <div class="num">{fac.numero}</div>
      <div class="fecha">{fac.fecha_emision.strftime('%d/%m/%Y')}</div>
      <div class="badge">FACTURA</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-box">
      <h3>Cliente</h3>
      <p><strong>{fac.cliente.nombre}</strong></p>
      <p>📞 {fac.cliente.telefono or 'N/A'}</p>
      <p>✉️ {fac.cliente.correo or 'N/A'}</p>
      <p>🪪 CC/NIT: {fac.cliente.documento or 'N/A'}</p>
    </div>
    <div class="info-box">
      <h3>Detalle</h3>
      <p>Orden: <strong>{orden_info}</strong></p>
      <p>Vehículo: <strong>{vehiculo_info}</strong></p>
      <p>Método de pago: <strong>{fac.metodo_pago}</strong></p>
      <p>Estado: <strong>{fac.estado.upper()}</strong></p>
    </div>
  </div>

  <div class="totales">
    <div class="totales-box">
      <div class="totales-row"><span>Subtotal</span><span>${{float(fac.subtotal):,.0f}}</span></div>
      <div class="totales-row"><span>Descuento</span><span>-${float(fac.descuento):,.0f}</span></div>
      <div class="totales-row total"><span>TOTAL</span><span>${{float(fac.total):,.0f}}</span></div>
    </div>
  </div>

  <div class="pago-info">
    💳 Método de pago: <strong>{fac.metodo_pago.upper()}</strong>
    {f'<br>📝 {fac.observaciones}' if fac.observaciones else ''}
  </div>

  <div class="footer">
    <div>
      <strong>ARM Racing Performance</strong><br>
      Lun-Sáb 8:00 AM - 7:30 PM<br>
      instagram: @arm_racing.performance
    </div>
    <div style="text-align:right">
      <strong>Firma autorizada</strong><br><br>
      ____________________<br>
      <span style="font-size:11px">ARM Racing Performance</span>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
</div>
</body>
</html>"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_financiero(request):
    # Parámetros opcionales de fecha
    anio = int(request.query_params.get('anio', datetime.now().year))
    mes  = request.query_params.get('mes')

    # Filtro base
    filtro_facturas = {'fecha_emision__year': anio, 'estado': 'pagada'}
    filtro_gastos   = {'fecha__year': anio}
    if mes:
        filtro_facturas['fecha_emision__month'] = mes
        filtro_gastos['fecha__month']           = mes

    # Ingresos
    ingresos = Factura.objects.filter(**filtro_facturas).aggregate(
        total=Sum('total'), cantidad=Count('id')
    )

    # Gastos
    gastos = Gasto.objects.filter(**filtro_gastos).aggregate(
        total=Sum('monto'), cantidad=Count('id')
    )

    # Ganancia neta
    total_ingresos = float(ingresos['total'] or 0)
    total_gastos   = float(gastos['total'] or 0)
    ganancia_neta  = total_ingresos - total_gastos

    # Ingresos por mes (para gráfica)
    ingresos_por_mes = Factura.objects.filter(
        fecha_emision__year=anio, estado='pagada'
    ).annotate(mes=TruncMonth('fecha_emision')).values('mes').annotate(
        total=Sum('total'), cantidad=Count('id')
    ).order_by('mes')

    # Gastos por mes
    gastos_por_mes = Gasto.objects.filter(
        fecha__year=anio
    ).annotate(mes=TruncMonth('fecha')).values('mes').annotate(
        total=Sum('monto'), cantidad=Count('id')
    ).order_by('mes')

    # Gastos por categoría
    gastos_por_categoria = Gasto.objects.filter(**filtro_gastos).values('categoria').annotate(
        total=Sum('monto'), cantidad=Count('id')
    ).order_by('-total')

    # Cotizaciones pendientes
    cotizaciones_pendientes = Cotizacion.objects.filter(
        estado__in=['borrador', 'enviada']
    ).aggregate(total=Sum('total'), cantidad=Count('id'))

    return Response({
        'resumen': {
            'ingresos':       total_ingresos,
            'gastos':         total_gastos,
            'ganancia_neta':  ganancia_neta,
            'margen':         round((ganancia_neta / total_ingresos * 100) if total_ingresos > 0 else 0, 1),
            'facturas_count': ingresos['cantidad'] or 0,
            'gastos_count':   gastos['cantidad'] or 0,
        },
        'cotizaciones_pendientes': {
            'total':    float(cotizaciones_pendientes['total'] or 0),
            'cantidad': cotizaciones_pendientes['cantidad'] or 0,
        },
        'ingresos_por_mes': [
            {'mes': i['mes'].strftime('%Y-%m'), 'total': float(i['total']), 'cantidad': i['cantidad']}
            for i in ingresos_por_mes
        ],
        'gastos_por_mes': [
            {'mes': g['mes'].strftime('%Y-%m'), 'total': float(g['total']), 'cantidad': g['cantidad']}
            for g in gastos_por_mes
        ],
        'gastos_por_categoria': [
            {'categoria': g['categoria'], 'total': float(g['total']), 'cantidad': g['cantidad']}
            for g in gastos_por_categoria
        ],
    })
