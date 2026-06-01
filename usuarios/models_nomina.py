from django.db import models
from django.contrib.auth.models import User

class Empleado(models.Model):
    TIPO_CHOICES = [
        ('tecnico',      'Técnico'),
        ('contabilidad', 'Contabilidad'),
        ('admin',        'Administrador'),
        ('otro',         'Otro'),
    ]
    TIPO_PAGO_CHOICES = [
        ('fijo',     'Salario fijo'),
        ('servicio', 'Por servicio'),
        ('mixto',    'Mixto'),
    ]

    usuario         = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='empleado')
    nombre          = models.CharField(max_length=100)
    documento       = models.CharField(max_length=20, unique=True)
    telefono        = models.CharField(max_length=15, blank=True)
    correo          = models.EmailField(blank=True)
    cargo           = models.CharField(max_length=50, blank=True)
    tipo            = models.CharField(max_length=20, choices=TIPO_CHOICES, default='tecnico')
    tipo_pago       = models.CharField(max_length=20, choices=TIPO_PAGO_CHOICES, default='servicio')
    salario_base    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    porcentaje_mano_obra = models.DecimalField(max_digits=5, decimal_places=2, default=50)
    activo          = models.BooleanField(default=True)
    fecha_ingreso   = models.DateField(null=True, blank=True)
    observaciones   = models.TextField(blank=True)

    def __str__(self):
        return f"{self.nombre} — {self.cargo}"

    class Meta:
        verbose_name = 'Empleado'
        verbose_name_plural = 'Empleados'
        ordering = ['nombre']


class PagoServicio(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagado',    'Pagado'),
    ]

    empleado    = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='pagos')
    orden       = models.ForeignKey('servicios.OrdenTrabajo', on_delete=models.CASCADE,
                                     related_name='pagos_tecnico', null=True, blank=True)
    descripcion = models.CharField(max_length=200)
    monto_orden = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    porcentaje  = models.DecimalField(max_digits=5, decimal_places=2, default=50)
    monto_pago  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estado      = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='pendiente')
    fecha       = models.DateField(auto_now_add=True)
    fecha_pago  = models.DateField(null=True, blank=True)
    notas       = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.monto_pago:
            from decimal import Decimal
            self.monto_pago = self.monto_orden * (self.porcentaje / Decimal('100'))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.empleado.nombre} — {self.descripcion} — ${self.monto_pago}"

    class Meta:
        verbose_name = 'Pago por servicio'
        verbose_name_plural = 'Pagos por servicio'
        ordering = ['-fecha']


class PagoNomina(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagado',    'Pagado'),
    ]

    empleado        = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='nomina')
    periodo_inicio  = models.DateField()
    periodo_fin     = models.DateField()
    salario_base    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_servicios = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deducciones     = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_pagar     = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estado          = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='pendiente')
    fecha_pago      = models.DateField(null=True, blank=True)
    notas           = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        self.total_pagar = self.salario_base + self.total_servicios - self.deducciones
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.empleado.nombre} — {self.periodo_inicio} a {self.periodo_fin}"

    class Meta:
        verbose_name = 'Pago de nómina'
        verbose_name_plural = 'Pagos de nómina'
        ordering = ['-periodo_fin']
