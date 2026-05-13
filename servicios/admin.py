from django.contrib import admin
from .models import OrdenTrabajo

@admin.register(OrdenTrabajo)
class OrdenTrabajoAdmin(admin.ModelAdmin):
    list_display  = ['codigo', 'cliente', 'vehiculo', 'estado', 'prioridad', 'tecnico', 'costo_final', 'fecha_ingreso']
    list_filter   = ['estado', 'prioridad']
    search_fields = ['codigo', 'cliente__nombre', 'vehiculo__placa']
    ordering      = ['-fecha_ingreso']