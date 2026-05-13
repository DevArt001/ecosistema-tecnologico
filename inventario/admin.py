from django.contrib import admin
from .models import Categoria, Proveedor, Producto, MovimientoInventario

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'descripcion']
    search_fields = ['nombre']

@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'telefono', 'correo', 'ciudad', 'activo']
    list_filter  = ['activo']
    search_fields = ['nombre']

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display  = ['sku', 'nombre', 'categoria', 'stock_actual', 'stock_minimo', 'costo', 'precio_venta', 'activo']
    list_filter   = ['categoria', 'activo']
    search_fields = ['sku', 'nombre']

@admin.register(MovimientoInventario)
class MovimientoAdmin(admin.ModelAdmin):
    list_display  = ['producto', 'tipo', 'cantidad', 'stock_antes', 'stock_despues', 'fecha']
    list_filter   = ['tipo']
    search_fields = ['producto__nombre']