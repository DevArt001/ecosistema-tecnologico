from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from datetime import datetime
from .models import Factura, Gasto, Cotizacion, LineaCotizacion, LineaFactura
from django.db import models as django_models
from .serializers import FacturaSerializer, GastoSerializer, CotizacionSerializer, LineaCotizacionSerializer, LineaFacturaSerializer

class FacturaViewSet(viewsets.ModelViewSet):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['numero', 'cliente__nombre']
    ordering_fields = ['fecha_emision', 'total']

    @action(detail=True, methods=['post'])
    def agregar_linea(self, request, pk=None):
        factura = self.get_object()
        serializer = LineaFacturaSerializer(data={**request.data, 'factura': factura.id})
        if serializer.is_valid():
            serializer.save()
            factura.calcular_totales()
            return Response(FacturaSerializer(factura).data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'], url_path='eliminar_linea/(?P<linea_id>[^/.]+)')
    def eliminar_linea(self, request, pk=None, linea_id=None):
        factura = self.get_object()
        LineaFactura.objects.filter(id=linea_id, factura=factura).delete()
        factura.calcular_totales()
        return Response(FacturaSerializer(factura).data)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth.models import User
        token = request.query_params.get('token')
        if token:
            try:
                access = AccessToken(token)
                user = User.objects.get(id=access['user_id'])
                request.user = user
            except Exception:
                pass
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
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth.models import User
        token = request.query_params.get('token')
        if token:
            try:
                access = AccessToken(token)
                user = User.objects.get(id=access['user_id'])
                request.user = user
            except Exception:
                pass
        cotizacion = self.get_object()
        html = generar_html_cotizacion(cotizacion)
        response = HttpResponse(html, content_type='text/html')
        response['Content-Disposition'] = f'inline; filename="cotizacion_{cotizacion.numero}.html"'
        return response


def generar_html_cotizacion(cot):
    lineas_html = ""
    for l in cot.lineas.all():
        icono = "🔧" if l.tipo == "servicio" else "🔩"
        lineas_html += f"""
        <tr>
            <td><span class="tipo-badge {l.tipo}">{icono} {l.tipo.capitalize()}</span></td>
            <td class="desc">{l.descripcion}</td>
            <td class="center">{l.cantidad}</td>
            <td class="right">${float(l.precio_unit):,.0f}</td>
            <td class="right bold green">${float(l.subtotal):,.0f}</td>
        </tr>"""

    v = cot.orden.vehiculo if cot.orden else None
    vehiculo_info = f"{v.marca} {v.modelo} ({v.modelo}) — {v.placa}" if v else "N/A"
    km_info = f"{v.kilometraje:,} km" if v and hasattr(v, 'kilometraje') and v.kilometraje else "N/A"

    iva_row = ""
    if cot.aplica_iva and float(cot.iva) > 0:
        base = float(cot.subtotal) / 1.19
        iva_row = f"""
        <tr class="subtotal-row">
            <td>Base gravable</td>
            <td class="right">${base:,.0f}</td>
        </tr>
        <tr class="subtotal-row">
            <td>IVA incluido (19%)</td>
            <td class="right">${float(cot.iva):,.0f}</td>
        </tr>"""

    descuento_row = ""
    if float(cot.descuento) > 0:
        descuento_row = f'<tr class="subtotal-row"><td>Descuento</td><td class="right red">-${float(cot.descuento):,.0f}</td></tr>'

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"><meta name="color-scheme" content="light only"><style>:root{{color-scheme:light only}}</style>
<title>Cotización {cot.numero}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{{margin:0;padding:0;box-sizing:border-box}}
  body{{font-family:'Inter',sans-serif;background:#f5f7fa;color:#1a1a2e;-webkit-print-color-adjust:exact;color-scheme:light}}
  .page{{max-width:820px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,.08)}}
  .header{{background:#ffffff;padding:32px 40px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #10B981}}
  .brand h1{{font-size:24px;font-weight:800;color:#10B981;letter-spacing:-.5px}}
  .brand p{{font-size:11.5px;color:#64748b;margin-top:3px}}
  .brand .contact{{margin-top:10px;display:flex;flex-direction:column;gap:3px}}
  .brand .contact span{{font-size:11px;color:#64748b}}
  .doc-info{{text-align:right}}
  .doc-num{{font-size:24px;font-weight:800;color:#10B981;font-family:monospace}}
  .doc-date{{font-size:12px;color:#64748b;margin-top:4px}}
  .badge{{display:inline-block;background:#10B981;color:white;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.08em;margin-top:10px;text-transform:uppercase}}
  .info-grid{{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #e2e8f0}}
  .info-box{{padding:20px 32px}}
  .info-box:first-child{{border-right:1px solid #e2e8f0}}
  .info-box h3{{font-size:10px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px}}
  .info-box .name{{font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:6px}}
  .info-box p{{font-size:12.5px;color:#64748b;margin-bottom:3px}}
  .info-box .highlight{{color:#1a1a2e;font-weight:600}}
  table{{width:100%;border-collapse:collapse}}
  .table-head{{background:#f8fafc}}
  .table-head th{{padding:11px 16px;font-size:11px;font-weight:700;color:#64748b;text-align:left;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #e2e8f0}}
  .table-head th.right{{text-align:right}}
  .table-head th.center{{text-align:center}}
  tbody tr{{border-bottom:1px solid #f1f5f9}}
  tbody tr:nth-child(even){{background:#fafbff}}
  tbody td{{padding:11px 16px;font-size:13px;color:#374151}}
  td.center{{text-align:center}}
  td.right{{text-align:right}}
  td.bold{{font-weight:700}}
  td.green{{color:#059669;font-weight:600}}
  td.red{{color:#dc2626}}
  td.desc{{font-weight:500;color:#1a1a2e}}
  .tipo-badge{{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}}
  .tipo-badge.servicio{{background:#dcfce7;color:#166534}}
  .tipo-badge.repuesto{{background:#dbeafe;color:#1e40af}}
  .totales-section{{display:flex;justify-content:flex-end;padding:20px 32px 0}}
  .totales-table{{width:260px;border-collapse:collapse}}
  .subtotal-row td{{padding:7px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9}}
  .subtotal-row td.right{{text-align:right}}
  .total-row td{{padding:14px 0 4px;font-size:20px;font-weight:800;color:#10B981}}
  .total-row td.right{{text-align:right}}
  .vigencia{{margin:20px 32px;padding:14px 18px;background:#f0fdf4;border-left:4px solid #10B981;border-radius:0 8px 8px 0;font-size:12.5px;color:#166534}}
  .pago-box{{margin:20px 32px;padding:14px 18px;background:#f0fdf4;border-left:4px solid #10B981;border-radius:0 8px 8px 0;font-size:12.5px;color:#166534}}
  .footer{{background:#f8fafc;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;margin-top:20px;border-top:1px solid #e2e8f0}}
  .footer-left{{color:#64748b;font-size:11.5px;line-height:1.6}}
  .footer-left strong{{color:#10B981}}
  .footer-right{{text-align:right;color:#64748b;font-size:11.5px}}
  .footer-right .firma-line{{border-top:1px solid #cbd5e1;padding-top:6px;margin-top:24px;color:#94a3b8}}
  .print-btn{{display:block;width:100%;padding:14px;background:#10B981;color:white;font-size:14px;font-weight:700;border:none;cursor:pointer;letter-spacing:.03em}}
  @media print{{.print-btn{{display:none}}body{{background:white}}.page{{box-shadow:none;margin:0;border-radius:0}}}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      <h1>🔧 ARM Racing Performance</h1>
      <p>Potencia, confianza y calidad en cada servicio</p>
      <div class="contact">
        <span>📍 Carrera 54b #50-09 sur, Venecia, Bogotá</span>
        <span>📞 323 233 8894 &nbsp;|&nbsp; ✉️ armracingpeformance@gmail.com</span>
        <span>📸 @arm_racing.performance</span>
      </div>
    </div>
    <div class="doc-info">
      <div class="doc-num">{cot.numero}</div>
      <div class="doc-date">{cot.fecha_emision.strftime('%d de %B de %Y')}</div>
      <div class="badge">Cotización</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Cliente</h3>
      <div class="name">{cot.cliente.nombre}</div>
      <p>📞 <span class="highlight">{cot.cliente.telefono or 'N/A'}</span></p>
      <p>✉️ {cot.cliente.correo or 'N/A'}</p>
      <p>🪪 CC/NIT: <span class="highlight">{cot.cliente.documento or 'N/A'}</span></p>
    </div>
    <div class="info-box">
      <h3>Vehículo & Orden</h3>
      <div class="name">{vehiculo_info}</div>
      <p>📋 Orden: <span class="highlight">{cot.orden.codigo if cot.orden else 'N/A'}</span></p>
      <p>🛣️ Kilometraje: <span class="highlight">{km_info}</span></p>
      <p>📅 Vigencia: <span class="highlight">{cot.vigencia_dias} días</span></p>
    </div>
  </div>

  <table>
    <thead class="table-head">
      <tr>
        <th>Tipo</th>
        <th>Descripción</th>
        <th class="center">Cant.</th>
        <th class="right">Precio Unit.</th>
        <th class="right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      {lineas_html if lineas_html else '<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8">Sin ítems</td></tr>'}
    </tbody>
  </table>

  <div class="totales-section">
    <table class="totales-table">
      {iva_row}
      {descuento_row}
      <tr class="total-row">
        <td>TOTAL</td>
        <td class="right">${float(cot.total):,.0f}</td>
      </tr>
    </table>
  </div>

  <div class="vigencia">
    ⏰ Esta cotización tiene una vigencia de <strong>{cot.vigencia_dias} días</strong> a partir del {cot.fecha_emision.strftime('%d/%m/%Y')}.
    {f'<br>📝 <em>{cot.notas}</em>' if cot.notas else ''}
  </div>

  <div class="footer">
    <div class="footer-left">
      <strong>ARM Racing Performance</strong><br>
      Lun — Sáb: 8:00 AM – 7:30 PM<br>
      NIT: por registrar
    </div>
    <div class="footer-right">
      <div style="color:#475569;font-size:11px">Autorizado por</div>
      <div class="firma-line">ARM Racing Performance</div>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
</div>
</body>
</html>"""


def generar_html_factura(fac):
    orden_info = fac.orden.codigo if fac.orden else "N/A"
    v = fac.orden.vehiculo if fac.orden else None
    vehiculo_info = f"{v.marca} {v.modelo} — {v.placa}" if v else "N/A"

    lineas_html = ""
    for l in fac.lineas.all():
        icono = "🔧" if l.tipo == "servicio" else "🔩"
        lineas_html += f"""
        <tr>
            <td><span class="tipo-badge {l.tipo}">{icono} {l.tipo.capitalize()}</span></td>
            <td class="desc">{l.descripcion}</td>
            <td class="center">{l.cantidad}</td>
            <td class="right">${float(l.precio_unit):,.0f}</td>
            <td class="right bold green">${float(l.subtotal):,.0f}</td>
        </tr>"""

    iva_row = ""
    if fac.aplica_iva and float(fac.iva) > 0:
        base = float(fac.subtotal) / 1.19
        iva_row = f"""
        <tr class="subtotal-row">
            <td>Base gravable</td>
            <td class="right">${base:,.0f}</td>
        </tr>
        <tr class="subtotal-row">
            <td>IVA incluido (19%)</td>
            <td class="right">${float(fac.iva):,.0f}</td>
        </tr>"""

    descuento_row = ""
    if float(fac.descuento) > 0:
        descuento_row = f'<tr class="subtotal-row"><td>Descuento</td><td class="right red">-${float(fac.descuento):,.0f}</td></tr>'

    estado_color = {'pendiente': '#f59e0b', 'pagada': '#10B981', 'anulada': '#ef4444'}
    color = estado_color.get(fac.estado, '#94a3b8')

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"><meta name="color-scheme" content="light only"><style>:root{{color-scheme:light only}}</style>
<title>Factura {fac.numero}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{{margin:0;padding:0;box-sizing:border-box}}
  body{{font-family:'Inter',sans-serif;background:#f5f7fa;color:#1a1a2e;-webkit-print-color-adjust:exact;color-scheme:light}}
  .page{{max-width:820px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,.08)}}
  .header{{background:#ffffff;padding:32px 40px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #10B981}}
  .brand h1{{font-size:24px;font-weight:800;color:#10B981;letter-spacing:-.5px}}
  .brand p{{font-size:11.5px;color:#64748b;margin-top:3px}}
  .brand .contact{{margin-top:10px;display:flex;flex-direction:column;gap:3px}}
  .brand .contact span{{font-size:11px;color:#64748b}}
  .doc-info{{text-align:right}}
  .doc-num{{font-size:24px;font-weight:800;color:#10B981;font-family:monospace}}
  .doc-date{{font-size:12px;color:#64748b;margin-top:4px}}
  .badge{{display:inline-block;background:#10B981;color:white;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.08em;margin-top:10px;text-transform:uppercase}}
  .info-grid{{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #e2e8f0}}
  .info-box{{padding:20px 32px}}
  .info-box:first-child{{border-right:1px solid #e2e8f0}}
  .info-box h3{{font-size:10px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px}}
  .info-box .name{{font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:6px}}
  .info-box p{{font-size:12.5px;color:#64748b;margin-bottom:3px}}
  .info-box .highlight{{color:#1a1a2e;font-weight:600}}
  table{{width:100%;border-collapse:collapse}}
  .table-head{{background:#f8fafc}}
  .table-head th{{padding:11px 16px;font-size:11px;font-weight:700;color:#64748b;text-align:left;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #e2e8f0}}
  .table-head th.right{{text-align:right}}
  .table-head th.center{{text-align:center}}
  tbody tr{{border-bottom:1px solid #f1f5f9}}
  tbody tr:nth-child(even){{background:#fafbff}}
  tbody td{{padding:11px 16px;font-size:13px;color:#374151}}
  td.center{{text-align:center}}
  td.right{{text-align:right}}
  td.bold{{font-weight:700}}
  td.green{{color:#059669;font-weight:600}}
  td.red{{color:#dc2626}}
  td.desc{{font-weight:500;color:#1a1a2e}}
  .tipo-badge{{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}}
  .tipo-badge.servicio{{background:#dcfce7;color:#166534}}
  .tipo-badge.repuesto{{background:#dbeafe;color:#1e40af}}
  .totales-section{{display:flex;justify-content:flex-end;padding:20px 32px 0}}
  .totales-table{{width:260px;border-collapse:collapse}}
  .subtotal-row td{{padding:7px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9}}
  .subtotal-row td.right{{text-align:right}}
  .total-row td{{padding:14px 0 4px;font-size:20px;font-weight:800;color:#10B981}}
  .total-row td.right{{text-align:right}}
  .vigencia{{margin:20px 32px;padding:14px 18px;background:#f0fdf4;border-left:4px solid #10B981;border-radius:0 8px 8px 0;font-size:12.5px;color:#166534}}
  .pago-box{{margin:20px 32px;padding:14px 18px;background:#f0fdf4;border-left:4px solid #10B981;border-radius:0 8px 8px 0;font-size:12.5px;color:#166534}}
  .footer{{background:#f8fafc;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;margin-top:20px;border-top:1px solid #e2e8f0}}
  .footer-left{{color:#64748b;font-size:11.5px;line-height:1.6}}
  .footer-left strong{{color:#10B981}}
  .footer-right{{text-align:right;color:#64748b;font-size:11.5px}}
  .footer-right .firma-line{{border-top:1px solid #cbd5e1;padding-top:6px;margin-top:24px;color:#94a3b8}}
  .print-btn{{display:block;width:100%;padding:14px;background:#10B981;color:white;font-size:14px;font-weight:700;border:none;cursor:pointer;letter-spacing:.03em}}
  @media print{{.print-btn{{display:none}}body{{background:white}}.page{{box-shadow:none;margin:0;border-radius:0}}}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      <h1>🔧 ARM Racing Performance</h1>
      <p>Potencia, confianza y calidad en cada servicio</p>
      <div class="contact">
        <span>📍 Carrera 54b #50-09 sur, Venecia, Bogotá</span>
        <span>📞 323 233 8894 &nbsp;|&nbsp; ✉️ armracingpeformance@gmail.com</span>
        <span>📸 @arm_racing.performance</span>
      </div>
    </div>
    <div class="doc-info">
      <div class="doc-num">{fac.numero}</div>
      <div class="doc-date">{fac.fecha_emision.strftime('%d de %B de %Y')}</div>
      <div class="badge" style="background:{color}22;color:{color};border:1px solid {color}">
        Factura — {fac.estado.upper()}
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Cliente</h3>
      <div class="name">{fac.cliente.nombre}</div>
      <p>📞 <span class="highlight">{fac.cliente.telefono or 'N/A'}</span></p>
      <p>✉️ {fac.cliente.correo or 'N/A'}</p>
      <p>🪪 CC/NIT: <span class="highlight">{fac.cliente.documento or 'N/A'}</span></p>
    </div>
    <div class="info-box">
      <h3>Detalle del servicio</h3>
      <div class="name">{vehiculo_info}</div>
      <p>📋 Orden: <span class="highlight">{orden_info}</span></p>
      <p>💳 Pago: <span class="highlight">{fac.metodo_pago.upper()}</span></p>
      {f'<p>📝 {fac.observaciones}</p>' if fac.observaciones else ''}
    </div>
  </div>

  <table>
    <thead class="table-head">
      <tr>
        <th>Tipo</th>
        <th>Descripción</th>
        <th class="center">Cant.</th>
        <th class="right">Precio Unit.</th>
        <th class="right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      {lineas_html if lineas_html else '<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8">Sin ítems detallados</td></tr>'}
    </tbody>
  </table>

  <div class="totales-section">
    <table class="totales-table">
      {iva_row}
      {descuento_row}
      <tr class="total-row">
        <td>TOTAL</td>
        <td class="right">${float(fac.total):,.0f}</td>
      </tr>
    </table>
  </div>

  <div class="pago-box">
    💳 Pago recibido en: <strong>{fac.metodo_pago.upper()}</strong>
    &nbsp;|&nbsp; Estado: <strong>{fac.estado.upper()}</strong>
  </div>

  <div class="footer">
    <div class="footer-left">
      <strong>ARM Racing Performance</strong><br>
      Lun — Sáb: 8:00 AM – 7:30 PM<br>
      NIT: por registrar
    </div>
    <div class="footer-right">
      <div style="color:#475569;font-size:11px">Autorizado por</div>
      <div class="firma-line">ARM Racing Performance</div>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
</div>
</body>
</html>"""


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_financiero(request):
    anio = int(request.query_params.get('anio', datetime.now().year))
    mes  = request.query_params.get('mes')

    filtro_facturas = {'fecha_emision__year': anio, 'estado': 'pagada'}
    filtro_gastos   = {'fecha__year': anio}
    if mes:
        filtro_facturas['fecha_emision__month'] = mes
        filtro_gastos['fecha__month']           = mes

    ingresos = Factura.objects.filter(**filtro_facturas).aggregate(total=Sum('total'), cantidad=Count('id'))
    gastos   = Gasto.objects.filter(**filtro_gastos).aggregate(total=Sum('monto'), cantidad=Count('id'))

    # Costo de repuestos en facturas pagadas
    from django.db.models import F
    costo_repuestos = LineaFactura.objects.filter(
        factura__in=Factura.objects.filter(**filtro_facturas),
        tipo='repuesto'
    ).aggregate(
        total=Sum(django_models.ExpressionWrapper(
            F('precio_costo') * F('cantidad'),
            output_field=django_models.DecimalField()
        ))
    )['total'] or 0

    total_ingresos    = float(ingresos['total'] or 0)
    total_gastos      = float(gastos['total'] or 0)
    total_costo_rep   = float(costo_repuestos)
    ganancia_neta     = total_ingresos - total_gastos - total_costo_rep

    ingresos_por_mes = Factura.objects.filter(fecha_emision__year=anio, estado='pagada').annotate(
        mes=TruncMonth('fecha_emision')).values('mes').annotate(total=Sum('total'), cantidad=Count('id')).order_by('mes')

    gastos_por_mes = Gasto.objects.filter(fecha__year=anio).annotate(
        mes=TruncMonth('fecha')).values('mes').annotate(total=Sum('monto'), cantidad=Count('id')).order_by('mes')

    gastos_por_categoria = Gasto.objects.filter(**filtro_gastos).values('categoria').annotate(
        total=Sum('monto'), cantidad=Count('id')).order_by('-total')

    cotizaciones_pendientes = Cotizacion.objects.filter(estado__in=['borrador','enviada']).aggregate(
        total=Sum('total'), cantidad=Count('id'))

    return Response({
        'resumen': {
            'ingresos':        total_ingresos,
            'gastos':          total_gastos,
            'costo_repuestos': total_costo_rep,
            'ganancia_neta':   ganancia_neta,
            'margen':          round((ganancia_neta / total_ingresos * 100) if total_ingresos > 0 else 0, 1),
            'facturas_count':  ingresos['cantidad'] or 0,
            'gastos_count':    gastos['cantidad'] or 0,
        },
        'cotizaciones_pendientes': {
            'total': float(cotizaciones_pendientes['total'] or 0),
            'cantidad': cotizaciones_pendientes['cantidad'] or 0,
        },
        'ingresos_por_mes': [
            {'mes': i['mes'].strftime('%Y-%m'), 'total': float(i['total']), 'cantidad': i['cantidad']}
            for i in ingresos_por_mes],
        'gastos_por_mes': [
            {'mes': g['mes'].strftime('%Y-%m'), 'total': float(g['total']), 'cantidad': g['cantidad']}
            for g in gastos_por_mes],
        'gastos_por_categoria': [
            {'categoria': g['categoria'], 'total': float(g['total']), 'cantidad': g['cantidad']}
            for g in gastos_por_categoria],
    })
