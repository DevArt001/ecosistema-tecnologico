from django.db import models
from clientes.models import Cliente
from servicios.models import OrdenTrabajo

class Factura(models.Model):

    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('anulada', 'Anulada'),
    ]

    METODO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('tarjeta', 'Tarjeta'),
        ('nequi', 'Nequi'),
        ('daviplata', 'Daviplata'),
    ]

    # Relaciones
    cliente     = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='facturas')
    orden       = models.OneToOneField(OrdenTrabajo, on_delete=models.CASCADE,
                                       related_name='factura', null=True, blank=True)

    # Información
    numero      = models.CharField(max_length=20, unique=True, blank=True)
    estado      = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='pendiente')
    metodo_pago = models.CharField(max_length=15, choices=METODO_CHOICES, default='efectivo')

    # Montos
    subtotal    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    descuento   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total       = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Fechas
    fecha_emision   = models.DateTimeField(auto_now_add=True)
    fecha_pago      = models.DateTimeField(null=True, blank=True)

    observaciones   = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.numero:
            import datetime
            fecha = datetime.datetime.now().strftime('%Y%m')
            ultimo = Factura.objects.filter(numero__startswith=f'FAC-{fecha}').count()
            self.numero = f'FAC-{fecha}-{ultimo+1:04d}'
        if not self.total:
            self.total = self.subtotal - self.descuento
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.numero} - {self.cliente.nombre} - ${self.total}"

    class Meta:
        verbose_name_plural = 'Facturas'
        ordering = ['-fecha_emision']


class Gasto(models.Model):

    CATEGORIA_CHOICES = [
        ('nomina', 'Nómina'),
        ('arriendo', 'Arriendo'),
        ('servicios', 'Servicios públicos'),
        ('repuestos', 'Repuestos'),
        ('herramientas', 'Herramientas'),
        ('marketing', 'Marketing'),
        ('otros', 'Otros'),
    ]

    descripcion = models.CharField(max_length=200)
    categoria   = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    monto       = models.DecimalField(max_digits=10, decimal_places=2)
    fecha       = models.DateField()
    comprobante = models.CharField(max_length=100, blank=True)
    observaciones = models.TextField(blank=True)

    def __str__(self):
        return f"{self.categoria} - ${self.monto} ({self.fecha})"

    class Meta:
        verbose_name_plural = 'Gastos'
        ordering = ['-fecha']