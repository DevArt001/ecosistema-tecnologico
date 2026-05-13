from django.contrib import admin
from .models import Cliente, Vehiculo 

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display  = ['nombre', 'documento', 'telefono', 'tipo', 'activo', 'fecha_registro']
    list_filter   = ['tipo', 'activo', 'ciudad']
    search_fields = ['nombre', 'documento', 'telefono']
    ordering      = ['-fecha_registro']

@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display  = ['placa', 'marca', 'linea', 'modelo', 'cliente', 'estado', 'kilometraje']
    list_filter   = ['tipo', 'estado', 'marca']
    search_fields = ['placa', 'marca', 'cliente__nombre']