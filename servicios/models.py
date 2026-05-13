from django.db import models
from clientes.models import Cliente, Vehiculo

class OrdenTrabajo(models.Model):

    ESTADO_CHOICES = [
        ('recibido', 'Recibido'),
        ('diagnostico', 'En Diagnóstico'),
        ('aprobado', 'Aprobado por Cliente'),
        ('en_proceso', 'En Proceso'),
        ('esperando_repuestos', 'Esperando Repuestos'),
        ('en_pruebas', 'En Pruebas'),
        ('finalizado', 'Finalizado'),
        ('entregado', 'Entregado'),
    ]

    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('normal', 'Normal'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]

    # Relaciones
    cliente     = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='ordenes')
    vehiculo    = models.ForeignKey(Vehiculo, on_delete=models.CASCADE, related_name='ordenes')

    # Información de la orden
    codigo          = models.CharField(max_length=20, unique=True, blank=True)
    estado          = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='recibido')
    prioridad       = models.CharField(max_length=10, choices=PRIORIDAD_CHOICES, default='normal')
    descripcion     = models.TextField()
    diagnostico     = models.TextField(blank=True)
    trabajo_realizado = models.TextField(blank=True)

    # Costos
    costo_estimado  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    costo_final     = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Tiempos
    fecha_ingreso   = models.DateTimeField(auto_now_add=True)
    fecha_entrega   = models.DateTimeField(null=True, blank=True)

    # Técnico
    tecnico         = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        if not self.codigo:
            import datetime
            fecha = datetime.datetime.now().strftime('%Y%m%d')
            ultimo = OrdenTrabajo.objects.filter(codigo__startswith=f'OT-{fecha}').count()
            self.codigo = f'OT-{fecha}-{ultimo+1:03d}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.codigo} - {self.vehiculo.placa} ({self.estado})"

    class Meta:
        verbose_name = 'Orden de Trabajo'
        verbose_name_plural = 'Órdenes de Trabajo'
        ordering = ['-fecha_ingreso']