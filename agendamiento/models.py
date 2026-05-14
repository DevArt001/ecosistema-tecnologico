from django.db import models
from clientes.models import Cliente, Vehiculo

class ConfigTaller(models.Model):
    nombre          = models.CharField(max_length=100, default="Mi Taller")
    hora_apertura   = models.TimeField(default="08:00")
    hora_cierre     = models.TimeField(default="18:00")
    max_citas_hora  = models.IntegerField(default=4)
    sabado_activo   = models.BooleanField(default=True)
    sabado_apertura = models.TimeField(default="08:00")
    sabado_cierre   = models.TimeField(default="13:00")
    whatsapp_numero = models.CharField(max_length=20, blank=True)
    mensaje_confirmacion = models.TextField(default="Hola {nombre}! Tu cita fue confirmada para el {fecha} a las {hora}.")

    class Meta:
        verbose_name = "Configuracion del Taller"

    def __str__(self):
        return self.nombre


class DiaEspecial(models.Model):
    TIPO_CHOICES = [
        ('festivo',   'Festivo nacional'),
        ('bloqueado', 'Dia bloqueado'),
        ('especial',  'Horario especial'),
    ]
    fecha       = models.DateField(unique=True)
    tipo        = models.CharField(max_length=20, choices=TIPO_CHOICES)
    descripcion = models.CharField(max_length=200, blank=True)
    apertura    = models.TimeField(null=True, blank=True)
    cierre      = models.TimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Dia Especial"
        ordering = ['fecha']

    def __str__(self):
        return f"{self.fecha} - {self.tipo}"


class Cita(models.Model):
    ESTADO_CHOICES = [
        ('pendiente',   'Pendiente'),
        ('confirmada',  'Confirmada'),
        ('completada',  'Completada'),
        ('cancelada',   'Cancelada'),
        ('no_cumplida', 'No cumplida'),
    ]
    TIPO_CHOICES = [
        ('normal',   'Normal'),
        ('especial', 'Especial fuera de horario'),
    ]
    cliente     = models.ForeignKey(Cliente,  on_delete=models.CASCADE, related_name='citas')
    vehiculo    = models.ForeignKey(Vehiculo, on_delete=models.CASCADE, related_name='citas')
    fecha       = models.DateField()
    hora        = models.TimeField()
    tipo        = models.CharField(max_length=20, choices=TIPO_CHOICES,   default='normal')
    estado      = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    descripcion = models.TextField(blank=True)
    tecnico     = models.CharField(max_length=100, blank=True)
    notas_taller= models.TextField(blank=True)
    orden       = models.OneToOneField('servicios.OrdenTrabajo', null=True, blank=True, on_delete=models.SET_NULL, related_name='cita_origen')
    creado_en   = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cita"
        ordering = ['fecha', 'hora']

    def __str__(self):
        return f"{self.fecha} {self.hora} - {self.cliente.nombre} - {self.vehiculo.placa}"
