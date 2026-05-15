from django.db import models
from clientes.models import Cliente, Vehiculo

class OrdenTrabajo(models.Model):
    ESTADOS = [
        ('recibido', 'Recibido'),
        ('diagnostico', 'Diagnóstico'),
        ('aprobado', 'Aprobado'),
        ('en_proceso', 'En proceso'),
        ('esperando_repuestos', 'Esperando repuestos'),
        ('en_pruebas', 'En pruebas'),
        ('finalizado', 'Finalizado'),
        ('entregado', 'Entregado'),
    ]
    
    PRIORIDADES = [
        ('baja', 'Baja'),
        ('normal', 'Normal'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]
    
    codigo = models.CharField(max_length=50, unique=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.PROTECT)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='recibido')
    prioridad = models.CharField(max_length=20, choices=PRIORIDADES, default='normal')
    descripcion = models.TextField(blank=True)
    trabajo_realizado = models.TextField(blank=True)
    costo_final = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fecha_ingreso = models.DateTimeField(auto_now_add=True)
    fecha_salida = models.DateTimeField(null=True, blank=True)
    tecnico = models.CharField(max_length=100, blank=True)
    notas_internas = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Orden de Trabajo'
        ordering = ['-fecha_ingreso']
    
    def __str__(self):
        return f'{self.codigo} - {self.cliente.nombre}'

class FotoProcesoOrden(models.Model):
    orden = models.ForeignKey(OrdenTrabajo, on_delete=models.CASCADE, related_name='fotos_proceso')
    foto = models.ImageField(upload_to='ordenes/%Y/%m/%d/')
    descripcion = models.CharField(max_length=255, blank=True)
    paso_numero = models.IntegerField(default=1)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Foto del Proceso'
        ordering = ['paso_numero']
    
    def __str__(self):
        return f'{self.orden.codigo} - Foto {self.paso_numero}'

class PasoProcesoOrden(models.Model):
    ESTADOS_PASO = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En proceso'),
        ('completado', 'Completado'),
    ]
    
    orden = models.ForeignKey(OrdenTrabajo, on_delete=models.CASCADE, related_name='pasos_proceso')
    numero = models.IntegerField()
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField()
    estado = models.CharField(max_length=20, choices=ESTADOS_PASO, default='pendiente')
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    tiempo_minutos = models.IntegerField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Paso del Proceso'
        ordering = ['numero']
    
    def __str__(self):
        return f'{self.orden.codigo} - Paso {self.numero}: {self.titulo}'
