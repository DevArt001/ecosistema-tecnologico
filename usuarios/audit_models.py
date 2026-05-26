from django.db import models
from django.contrib.auth.models import User

class AuditLog(models.Model):
    ACCIONES = [
        ('crear',    'Crear'),
        ('editar',   'Editar'),
        ('eliminar', 'Eliminar'),
        ('ver',      'Ver'),
        ('login',    'Login'),
        ('logout',   'Logout'),
        ('export',   'Exportar'),
    ]
    usuario     = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    accion      = models.CharField(max_length=10, choices=ACCIONES)
    modulo      = models.CharField(max_length=50)
    descripcion = models.TextField()
    ip          = models.GenericIPAddressField(null=True, blank=True)
    fecha       = models.DateTimeField(auto_now_add=True)
    datos       = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Log de Auditoria'

    def __str__(self):
        return f"{self.usuario} — {self.accion} {self.modulo} — {self.fecha}"
