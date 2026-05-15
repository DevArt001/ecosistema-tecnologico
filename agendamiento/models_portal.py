from django.db import models
from django.utils import timezone
import secrets
from datetime import timedelta
from servicios.models import OrdenTrabajo

class LinkTemporal(models.Model):
    orden = models.OneToOneField(OrdenTrabajo, on_delete=models.CASCADE, related_name='link_temporal')
    token = models.CharField(max_length=64, unique=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_expiracion = models.DateTimeField()
    
    class Meta:
        verbose_name = 'Link Temporal'
        
    def __str__(self):
        return f'{self.orden.codigo} - Caduca: {self.fecha_expiracion}'
    
    @staticmethod
    def crear_link(orden, dias=15):
        token = secrets.token_urlsafe(48)
        fecha_exp = timezone.now() + timedelta(days=dias)
        link, created = LinkTemporal.objects.get_or_create(
            orden=orden,
            defaults={'token': token, 'fecha_expiracion': fecha_exp}
        )
        return link
    
    def esta_vigente(self):
        return timezone.now() < self.fecha_expiracion
    
    def dias_restantes(self):
        if not self.esta_vigente():
            return 0
        delta = self.fecha_expiracion - timezone.now()
        return delta.days
