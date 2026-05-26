from usuarios.audit_models import AuditLog

def log(usuario, accion, modulo, descripcion, request=None, datos=None):
    ip = None
    if request:
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        ip = x_forwarded_for.split(",")[0] if x_forwarded_for else request.META.get("REMOTE_ADDR")
    AuditLog.objects.create(
        usuario=usuario,
        accion=accion,
        modulo=modulo,
        descripcion=descripcion,
        ip=ip,
        datos=datos
    )
