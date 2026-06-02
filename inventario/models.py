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

    class Meta:
        ordering = ["nombre"]


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

class OrdenCompra(models.Model):
    ESTADO_CHOICES = [
        ('borrador',   'Borrador'),
        ('enviada',    'Enviada'),
        ('confirmada', 'Confirmada'),
        ('recibida',   'Recibida'),
        ('cancelada',  'Cancelada'),
    ]

    numero      = models.CharField(max_length=20, unique=True, blank=True)
    proveedor   = models.ForeignKey(Proveedor, on_delete=models.PROTECT, related_name='ordenes_compra')
    estado      = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='borrador')
    subtotal    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notas       = models.TextField(blank=True)
    fecha_emision   = models.DateTimeField(auto_now_add=True)
    fecha_esperada  = models.DateField(null=True, blank=True)
    fecha_recibida  = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.numero:
            import datetime
            fecha = datetime.datetime.now().strftime("%Y%m")
            ultimo = OrdenCompra.objects.filter(numero__startswith=f"OC-{fecha}").count()
            self.numero = f"OC-{fecha}-{ultimo+1:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.numero} - {self.proveedor.nombre}"

    class Meta:
        verbose_name = "Orden de Compra"
        verbose_name_plural = "Ordenes de Compra"
        ordering = ["-fecha_emision"]


class LineaOrdenCompra(models.Model):
    orden       = models.ForeignKey(OrdenCompra, on_delete=models.CASCADE, related_name="lineas")
    producto    = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad    = models.IntegerField(default=1)
    precio_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal    = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_unit
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.orden.numero} - {self.producto.nombre} x{self.cantidad}"

    class Meta:
        ordering = ["id"]


class HistorialPrecioProveedor(models.Model):
    proveedor   = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name="historial_precios")
    producto    = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="historial_precios")
    precio      = models.DecimalField(max_digits=10, decimal_places=2)
    fecha       = models.DateField(auto_now_add=True)
    notas       = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-fecha"]

    def __str__(self):
        return f"{self.proveedor.nombre} - {self.producto.nombre} ${self.precio}"
