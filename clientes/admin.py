from django.contrib import admin
from .models import Cliente

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display  = ['nombre', 'documento', 'telefono', 'tipo', 'activo', 'fecha_registro']
    list_filter   = ['tipo', 'activo', 'ciudad']
    search_fields = ['nombre', 'documento', 'telefono']
    ordering      = ['-fecha_registro']