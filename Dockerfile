# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:26-alpine AS builder

WORKDIR /app

# Copiar manifiestos primero para aprovechar caché de capas
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copiar fuentes y compilar
COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM nginx:1.31.0-alpine AS runtime

# Eliminar configuración por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración nginx propia
COPY nginx.conf /etc/nginx/conf.d/complyx.conf

# Copiar artefactos de build
# Angular 19 genera en dist/<project-name>/browser
COPY --from=builder /app/dist/complyx-ui/browser /usr/share/nginx/html

# Script de arranque que sustituye la URL del backend antes de iniciar nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]