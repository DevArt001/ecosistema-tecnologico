from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

from usuarios.audit import log as audit_log

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def busqueda_global(request):
    q = request.query_params.get('q', '').strip()
    if len(q) < 2:
        return Response({'resultados': []})

    resultados = []

    # Clientes
    from clientes.models import Cliente
    clientes = Cliente.objects.filter(
        nombre__icontains=q
    ) | Cliente.objects.filter(
        documento__icontains=q
    ) | Cliente.objects.filter(
        telefono__icontains=q
    )
    for c in clientes[:5]:
        resultados.append({
            'tipo': 'cliente', 'icon': '👤',
            'titulo': c.nombre,
            'sub': f'CC {c.documento} · {c.telefono}',
            'url': '/clientes',
            'id': c.id
        })

    # Vehículos
    from clientes.models import Vehiculo
    vehiculos = Vehiculo.objects.filter(
        placa__icontains=q
    ) | Vehiculo.objects.filter(
        marca__icontains=q
    ) | Vehiculo.objects.filter(
        linea__icontains=q
    )
    for v in vehiculos[:5]:
        resultados.append({
            'tipo': 'vehiculo', 'icon': '🏍',
            'titulo': f'{v.marca} {v.linea} — {v.placa}',
            'sub': f'Cliente: {v.cliente.nombre}',
            'url': '/vehiculos',
            'id': v.id
        })

    # Órdenes
    from servicios.models import OrdenTrabajo
    ordenes = OrdenTrabajo.objects.filter(
        codigo__icontains=q
    ) | OrdenTrabajo.objects.filter(
        cliente__nombre__icontains=q
    ) | OrdenTrabajo.objects.filter(
        vehiculo__placa__icontains=q
    )
    for o in ordenes[:5]:
        resultados.append({
            'tipo': 'orden', 'icon': '🔧',
            'titulo': f'Orden {o.codigo}',
            'sub': f'{o.cliente.nombre} · {o.vehiculo.placa} · {o.estado}',
            'url': '/ordenes',
            'id': o.id
        })

    # Facturas
    from contabilidad.models import Factura
    facturas = Factura.objects.filter(
        numero__icontains=q
    ) | Factura.objects.filter(
        cliente__nombre__icontains=q
    )
    for f in facturas[:5]:
        resultados.append({
            'tipo': 'factura', 'icon': '💰',
            'titulo': f'Factura {f.numero}',
            'sub': f'{f.cliente.nombre} · ${float(f.total):,.0f} · {f.estado}',
            'url': '/facturas',
            'id': f.id
        })

    # Productos
    from inventario.models import Producto
    productos = Producto.objects.filter(
        nombre__icontains=q
    ) | Producto.objects.filter(
        sku__icontains=q
    )
    for p in productos[:3]:
        resultados.append({
            'tipo': 'producto', 'icon': '📦',
            'titulo': p.nombre,
            'sub': f'SKU: {p.sku} · Stock: {p.stock_actual}',
            'url': '/inventario',
            'id': p.id
        })

    return Response({'resultados': resultados[:15], 'total': len(resultados)})
