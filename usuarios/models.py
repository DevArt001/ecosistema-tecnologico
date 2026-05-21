from django.db import models
from django.contrib.auth.models import User

ROLES = [
    ('admin',        'Administrador'),
    ('contabilidad', 'Contabilidad'),
    ('tecnico',      'Técnico'),
]

MODULOS = [
    ('dashboard',    'Dashboard'),
    ('clientes',     'Clientes'),
    ('vehiculos',    'Vehículos'),
    ('ordenes',      'Órdenes'),
    ('inventario',   'Inventario'),
    ('cotizaciones', 'Cotizaciones'),
    ('facturas',     'Facturas'),
    ('agendamiento', 'Agendamiento'),
    ('reportes',     'Reportes'),
    ('gastos',       'Gastos'),
]

PERMISOS_POR_ROL = {
    'admin': [m[0] for m in MODULOS],
    'contabilidad': ['dashboard', 'cotizaciones', 'facturas', 'reportes', 'gastos'],
    'tecnico': ['dashboard', 'ordenes'],
}

class PerfilUsuario(models.Model):
    usuario     = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol         = models.CharField(max_length=20, choices=ROLES, default='tecnico')
    permisos    = models.JSONField(default=list)
    telefono    = models.CharField(max_length=20, blank=True)
    activo      = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.permisos:
            self.permisos = PERMISOS_POR_ROL.get(self.rol, ['dashboard'])
        super().save(*args, **kwargs)

    def tiene_permiso(self, modulo):
        if self.rol == 'admin':
            return True
        return modulo in self.permisos

    def __str__(self):
        return f"{self.usuario.username} — {self.rol}"

    class Meta:
        verbose_name = 'Perfil de usuario'
        verbose_name_plural = 'Perfiles de usuario'
