from django.core.mail import send_mail, EmailMessage
from django.conf import settings
import threading

def enviar_async(func, *args, **kwargs):
    threading.Thread(target=func, args=args, kwargs=kwargs).start()

def email_cotizacion(cotizacion):
    if not cotizacion.cliente.correo:
        return
    try:
        asunto = f"Cotizacion {cotizacion.numero} - ARM Racing Performance"
        mensaje = f"""
Estimado/a {cotizacion.cliente.nombre},

Adjunto encontrara la cotizacion {cotizacion.numero} por un valor de ${cotizacion.total:,.0f} COP.

Para aprobar la cotizacion o si tiene alguna pregunta, no dude en contactarnos.

Vigencia: {cotizacion.vigencia_dias} dias

ARM Racing Performance
Tel: 323 233 8894
Web: https://app.armracing.com
        """
        send_mail(asunto, mensaje, settings.DEFAULT_FROM_EMAIL, [cotizacion.cliente.correo])
    except Exception as e:
        print(f"Error enviando email cotizacion: {e}")

def email_factura(factura):
    if not factura.cliente.correo:
        return
    try:
        asunto = f"Factura {factura.numero} - ARM Racing Performance"
        mensaje = f"""
Estimado/a {factura.cliente.nombre},

Su factura {factura.numero} ha sido generada por un valor de ${factura.total:,.0f} COP.

Estado: {factura.estado}
Metodo de pago: {factura.metodo_pago}

Gracias por confiar en ARM Racing Performance.

ARM Racing Performance
Tel: 323 233 8894
Web: https://app.armracing.com
        """
        send_mail(asunto, mensaje, settings.DEFAULT_FROM_EMAIL, [factura.cliente.correo])
    except Exception as e:
        print(f"Error enviando email factura: {e}")

def email_orden_creada(orden):
    if not orden.cliente.correo:
        return
    try:
        asunto = f"Orden de trabajo {orden.codigo} recibida - ARM Racing Performance"
        mensaje = f"""
Estimado/a {orden.cliente.nombre},

Hemos recibido su vehiculo {orden.vehiculo.placa} - {orden.vehiculo.marca} {orden.vehiculo.linea}.

Codigo de orden: {orden.codigo}
Estado: Recibido

Puede hacer seguimiento de su vehiculo en:
https://app.armracing.com/portal

ARM Racing Performance
Tel: 323 233 8894
        """
        send_mail(asunto, mensaje, settings.DEFAULT_FROM_EMAIL, [orden.cliente.correo])
    except Exception as e:
        print(f"Error enviando email orden: {e}")

def email_moto_lista(orden):
    if not orden.cliente.correo:
        return
    try:
        asunto = f"Su moto esta lista - ARM Racing Performance"
        mensaje = f"""
Estimado/a {orden.cliente.nombre},

Su vehiculo {orden.vehiculo.placa} - {orden.vehiculo.marca} {orden.vehiculo.linea} esta listo para entrega.

Codigo de orden: {orden.codigo}
Costo final: ${orden.costo_final:,.0f} COP

Por favor comuniquese con nosotros para coordinar la entrega.

ARM Racing Performance
Tel: 323 233 8894
        """
        send_mail(asunto, mensaje, settings.DEFAULT_FROM_EMAIL, [orden.cliente.correo])
    except Exception as e:
        print(f"Error enviando email moto lista: {e}")

def email_cita_confirmada(cita):
    if not cita.cliente.correo:
        return
    try:
        asunto = f"Cita confirmada - ARM Racing Performance"
        mensaje = f"""
Estimado/a {cita.cliente.nombre},

Su cita ha sido confirmada.

Fecha: {cita.fecha}
Hora: {cita.hora}
Vehiculo: {cita.vehiculo.placa if cita.vehiculo else 'Por definir'}

Recuerde llegar 5 minutos antes.

ARM Racing Performance
Carrera 54b #50-09 sur, Venecia, Bogota
Tel: 323 233 8894
        """
        send_mail(asunto, mensaje, settings.DEFAULT_FROM_EMAIL, [cita.cliente.correo])
    except Exception as e:
        print(f"Error enviando email cita: {e}")
