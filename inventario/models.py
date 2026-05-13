from django.db import models

class Categoria(models.Model):
    nombre      = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = 'Categorías'


class Proveedor(models.Model):
    nombre    = models.CharField(max_length=100)
    telefono  = models.CharField(max_length=15, blank=True)
    correo    = models.EmailField(blank=True)
    ciudad    = models.CharField(max_length=50, blank=True)
    activo    = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    # Identificación
    sku         = models.CharField(max_length=50, unique=True)
    nombre      = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    categoria   = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True)
    proveedor   = models.ForeignKey(Proveedor, on_delete=models.SET_NULL, null=True, blank=True)

    # Precios
    costo       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    precio_venta= models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Stock
    stock_actual  = models.IntegerField(default=0)
    stock_minimo  = models.IntegerField(default=5)
    stock_critico = models.IntegerField(default=2)

    # Estado
    activo        = models.BooleanField(default=True)
    fecha_registro= models.DateTimeField(auto_now_add=True)

    @property
    def margen(self):
        if self.costo > 0:
            return round((self.precio_venta - self.costo) / self.costo * 100, 2)
        return 0

    @property
    def estado_stock(self):
        if self.stock_actual <= self.stock_critico:
            return 'critico'
        elif self.stock_actual <= self.stock_minimo:
            return 'bajo'
        return 'normal'

    def __str__(self):
        return f"{self.sku} - {self.nombre}"

    class Meta:
        verbose_name_plural = 'Productos'


class MovimientoInventario(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste'),
    ]

    producto    = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='movimientos')
    tipo        = models.CharField(max_length=10, choices=TIPO_CHOICES)
    cantidad    = models.IntegerField()
    stock_antes = models.IntegerField()
    stock_despues= models.IntegerField()
    motivo      = models.CharField(max_length=200, blank=True)
    fecha       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} - {self.producto.nombre} ({self.cantidad})"

    class Meta:
        verbose_name = 'Movimiento de Inventario'
        verbose_name_plural = 'Movimientos de Inventario'
        ordering = ['-fecha']