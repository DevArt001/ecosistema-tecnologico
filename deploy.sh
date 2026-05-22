#!/bin/bash
cd /home/arturo/ecosistema-tecnologico
git pull origin main
docker compose build taller_backend taller_frontend
docker compose up -d
echo "Deploy completado: $(date)" >> /tmp/deploy.log
