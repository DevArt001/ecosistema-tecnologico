#!/bin/bash
set -e

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/arturo/ecosistema-tecnologico/backups"
ARCHIVO="taller_db_$FECHA.sql.gz"

echo "Iniciando backup: $ARCHIVO"

docker compose -f /home/arturo/ecosistema-tecnologico/docker-compose.yml \
  exec -T taller_db pg_dump -U taller_user taller_db | gzip > "$BACKUP_DIR/$ARCHIVO"

# Verificar que el archivo no está vacío
if [ -s "$BACKUP_DIR/$ARCHIVO" ]; then
  echo "Backup exitoso: $ARCHIVO ($(du -h $BACKUP_DIR/$ARCHIVO | cut -f1))"
else
  echo "ERROR: Backup vacío"
  rm "$BACKUP_DIR/$ARCHIVO"
  exit 1
fi

# Borrar backups de más de 7 días
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
echo "Backups antiguos eliminados"

# Mostrar backups actuales
echo "Backups disponibles:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "Ninguno"
