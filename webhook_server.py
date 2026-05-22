from flask import Flask, request, jsonify
import subprocess
import hmac
import hashlib
import os

app = Flask(__name__)
SECRET = os.environ.get('WEBHOOK_SECRET', 'arm_racing_deploy_2026')

@app.route('/deploy', methods=['POST'])
def deploy():
    sig = request.headers.get('X-Hub-Signature-256', '')
    body = request.get_data()
    expected = 'sha256=' + hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        return jsonify({'error': 'Unauthorized'}), 401
    subprocess.Popen(['/home/arturo/ecosistema-tecnologico/deploy.sh'])
    return jsonify({'status': 'Deploy iniciado'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)
