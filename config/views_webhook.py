from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import subprocess

@csrf_exempt
def deploy_webhook(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    subprocess.Popen(['/home/arturo/ecosistema-tecnologico/deploy.sh'])
    return JsonResponse({'status': 'Deploy iniciado'})
