import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from usuarios.models import PerfilUsuario, PERMISOS_POR_ROL

# Crear admin si no existe
if not User.objects.filter(username='admin').exists():
    u = User.objects.create_superuser('admin', 'admin@taller.com', 'cabra123')
    print(f'Admin creado: {u.username}')
else:
    u = User.objects.get(username='admin')
    print(f'Admin ya existe: {u.username}')

# Crear o actualizar perfil
p, _ = PerfilUsuario.objects.get_or_create(usuario=u)
p.rol = 'admin'
p.permisos = PERMISOS_POR_ROL['admin']
p.save()
print(f'Perfil: {p.rol} - {len(p.permisos)} permisos')
