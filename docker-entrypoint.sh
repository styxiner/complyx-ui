#!/bin/sh
set -e

BACKEND_URL="${BACKEND_URL:-http://complyx-api:8080}"

echo "[entrypoint] Configurando proxy hacia backend: $BACKEND_URL"

# Usar el resolver de Docker (127.0.0.11) para resolución dinámica de nombres
# Esto permite que nginx arranque aunque el backend no esté listo aún
sed -i "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" \
    /etc/nginx/conf.d/complyx.conf

# Añadir el resolver de Docker antes del bloque server
sed -i "1s|^|resolver 127.0.0.11 valid=10s ipv6=off;\n\n|" \
    /etc/nginx/conf.d/complyx.conf

echo "[entrypoint] Configuración nginx:"
cat /etc/nginx/conf.d/complyx.conf

exec "$@"