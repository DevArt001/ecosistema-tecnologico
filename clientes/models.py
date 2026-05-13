from django.db import models

class Cliente(models.Model):
    
    TIPO_CHOICES = [
        ('regular', 'Regular'),
        ('frecuente', 'Frecuente'),
        ('premium', 'Premium'),
        ('inactivo', 'Inactivo'),
    ]
    
    # Datos personales
    nombre      = models.CharField(max_length=100)
    documento   = models.CharField(max_length=20, unique=True)
    telefono    = models.CharField(max_length=15)
    whatsapp    = models.CharField(max_length=15, blank=True)
    correo      = models.EmailField(blank=True)
    ciudad      = models.CharField(max_length=50, blank=True)
    
    # Clasificación
    tipo        = models.CharField(max_length=20, choices=TIPO_CHOICES, default='regular')
    activo      = models.BooleanField(default=True)
    puntos      = models.IntegerField(default=0)
    
    # Registro
    fecha_registro  = models.DateTimeField(auto_now_add=True)
    observaciones   = models.TextField(blank=True)

    def __str__(self):
        return f"{self.nombre} - {self.documento}"

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['-fecha_registro']

class Vehiculo(models.Model):

    TIPO_CHOICES = [
        ('moto', 'Motocicleta'),
        ('carro', 'Automóvil'),
        ('bicicleta', 'Bicicleta Eléctrica'),
    ]

    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('en_servicio', 'En Servicio'),
        ('inactivo', 'Inactivo'),
    ]

    # Relación con cliente
    cliente     = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='vehiculos')

    # Datos del vehículo
    placa       = models.CharField(max_length=10, unique=True)
    marca       = models.CharField(max_length=50)
    linea       = models.CharField(max_length=50)
    modelo      = models.IntegerField()
    cilindraje  = models.IntegerField(blank=True, null=True)
    color       = models.CharField(max_length=30, blank=True)
    kilometraje = models.IntegerField(default=0)
    tipo        = models.CharField(max_length=20, choices=TIPO_CHOICES, default='moto')
    estado      = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')

    # Registro
    fecha_ingreso   = models.DateTimeField(auto_now_add=True)
    observaciones   = models.TextField(blank=True)

    def __str__(self):
        return f"{self.placa} - {self.marca} {self.linea} ({self.cliente.nombre})"

    class Meta:
        verbose_name = 'Vehículo'
        verbose_name_plural = 'Vehículos'