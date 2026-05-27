import qrcode
import qrcode.image.svg
from io import BytesIO
import base64
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def setup_2fa(request):
    user = request.user
    # Eliminar dispositivos anteriores
    TOTPDevice.objects.filter(user=user, confirmed=False).delete()
    
    # Crear nuevo dispositivo
    device = TOTPDevice.objects.create(
        user=user,
        name=f"TallerOS - {user.username}",
        confirmed=False
    )
    
    # Generar URL para QR
    otpauth_url = device.config_url
    
    # Generar imagen QR en base64
    qr = qrcode.make(otpauth_url)
    buffer = BytesIO()
    qr.save(buffer, format='PNG')
    qr_b64 = base64.b64encode(buffer.getvalue()).decode()
    
    return Response({
        'qr_code': f'data:image/png;base64,{qr_b64}',
        'secret': device.bin_key.hex(),
        'otpauth_url': otpauth_url,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa(request):
    user = request.user
    code = request.data.get('code', '')
    
    device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
    if not device:
        return Response({'error': 'No hay dispositivo pendiente de verificacion'}, status=400)
    
    if device.verify_token(code):
        device.confirmed = True
        device.save()
        # Log
        from .audit import log as audit_log
        audit_log(user, 'editar', 'usuarios', f'2FA activado para @{user.username}', request)
        return Response({'mensaje': '2FA activado correctamente'})
    
    return Response({'error': 'Codigo incorrecto'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    user = request.user
    TOTPDevice.objects.filter(user=user).delete()
    from .audit import log as audit_log
    audit_log(user, 'editar', 'usuarios', f'2FA desactivado para @{user.username}', request)
    return Response({'mensaje': '2FA desactivado'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def status_2fa(request):
    user = request.user
    tiene_2fa = TOTPDevice.objects.filter(user=user, confirmed=True).exists()
    return Response({'tiene_2fa': tiene_2fa, 'username': user.username})

@api_view(['POST'])
def validate_2fa_login(request):
    """Validar codigo 2FA durante el login"""
    from django.contrib.auth.models import User
    username = request.data.get('username')
    code = request.data.get('code')
    
    try:
        user = User.objects.get(username=username)
        device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        if device and device.verify_token(code):
            return Response({'valido': True})
        return Response({'valido': False, 'error': 'Codigo invalido'}, status=400)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)
