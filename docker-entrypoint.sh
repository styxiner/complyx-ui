#!/bin/sh
set -e

# URL del backend — por defecto apunta al nombre de servicio del docker-compose
BACKEND_URL="${BACKEND_URL:-http://complyx-api:8080}"

echo "[entrypoint] Configurando proxy hacia backend: $BACKEND_URL"

# Sustituir el placeholder en la configuración de nginx
sed -i "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" \
    /etc/nginx/conf.d/complyx.conf

# Ejecutar el comando recibido (nginx)
exec "$@"