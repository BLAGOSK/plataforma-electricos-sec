# syntax=docker/dockerfile:1
# Contexto de build: raíz del monorepo  →  docker build -f apps/web/Dockerfile .

# ---------- Etapa 1: build de la SPA con Node ----------
FROM node:20-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN npm ci -w @electricos/web --no-audit --no-fund

COPY packages/shared packages/shared
COPY apps/web apps/web

# Variables de Vite: se incrustan en el bundle en tiempo de build
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build -w @electricos/web

# ---------- Etapa 2: servir archivos estáticos con Nginx ----------
FROM nginx:1.27-alpine AS runtime

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
