from django.contrib import admin
from .models import Factura, Gasto

@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display  = ['numero', 'cliente', 'total', 'estado', 'metodo_pago', 'fecha_emision']
    list_filter   = ['estado', 'metodo_pago']
    search_fields = ['numero', 'cliente__nombre']
    ordering      = ['-fecha_emision']

@admin.register(Gasto)
class GastoAdmin(admin.ModelAdmin):
    list_display  = ['descripcion', 'categoria', 'monto', 'fecha']
    list_filter   = ['categoria']
    search_fields = ['descripcion']
    ordering      = ['-fecha']