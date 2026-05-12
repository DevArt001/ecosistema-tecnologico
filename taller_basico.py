# Módulo base del ERP del taller

class Cliente:
    def __init__(self, nombre, telefono, placa):
        self.nombre = nombre
        self.telefono = telefono
        self.placa = placa
        self.servicios = []

    def agregar_servicio(self, servicio, costo):
        self.servicios.append({"servicio": servicio, "costo": costo})
        print(f"✓ Servicio agregado: {servicio} - ${costo:,}")

    def historial(self):
        print(f"\n--- Historial de {self.nombre} ({self.placa}) ---")
        total = 0
        for s in self.servicios:
            print(f"  {s['servicio']}: ${s['costo']:,}")
            total += s['costo']
        print(f"  Total gastado: ${total:,}")


# Crear clientes
c1 = Cliente("Juan Pérez", "3001234567", "ABC123")
c2 = Cliente("María López", "3109876543", "XYZ789")

# Registrar servicios
c1.agregar_servicio("Cambio de aceite", 45000)
c1.agregar_servicio("Frenos delanteros", 85000)
c2.agregar_servicio("Sincronización", 65000)

# Ver historial
c1.historial()
c2.historial()# Primer módulo del ERP del taller

cliente = {
    "nombre": "Juan Pérez",
    "telefono": "3001234567",
    "moto": "Honda CB190",
    "placa": "ABC123"
}

clientes = [cliente]

def registrar_servicio(cliente, servicio, costo):
    print(f"Cliente: {cliente['nombre']}")
    print(f"Moto: {cliente['moto']}")
    print(f"Servicio: {servicio}")
    print(f"Costo: ${costo:,}")
    return {"cliente": cliente, "servicio": servicio, "costo": costo}

orden = registrar_servicio(cliente, "Cambio de aceite", 45000)
print("\nOrden registrada:")
print(orden)
