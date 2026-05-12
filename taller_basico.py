# Primer módulo del ERP del taller

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
