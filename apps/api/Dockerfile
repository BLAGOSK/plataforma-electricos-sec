# syntax=docker/dockerfile:1
# Contexto de build: raíz del monorepo  →  docker build -f apps/api/Dockerfile .

# ---------- Etapa 1: dependencias y build ----------
FROM node:20-alpine AS build
# Prisma necesita OpenSSL en Alpine
RUN apk add --no-cache openssl
WORKDIR /repo

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci -w @electricos/shared -w @electricos/api --no-audit --no-fund

COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @electricos/shared && npm run build -w @electricos/api

# ---------- Etapa 2: ejecución ----------
FROM node:20-alpine AS runtime
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=build /repo/package.json ./
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared/package.json packages/shared/
COPY --from=build /repo/packages/shared/dist packages/shared/dist
COPY --from=build /repo/apps/api/package.json apps/api/
COPY --from=build /repo/apps/api/dist apps/api/dist
COPY --from=build /repo/apps/api/prisma apps/api/prisma
COPY --from=build /repo/apps/api/src/storage apps/api/src/storage
COPY --from=build /repo/apps/api/tsconfig.json apps/api/

WORKDIR /repo/apps/api
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

# Aplica migraciones pendientes y arranca la API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
