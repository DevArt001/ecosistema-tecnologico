from django.db import models
from .models import OrdenTrabajo

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
    
    orden = models.ForeignKey(OrdenTrabalo, on_delete=models.CASCADE, related_name='pasos_proceso')
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
