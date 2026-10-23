# Plataforma Eléctricos SEC

Plataforma web para **instaladores eléctricos autorizados por la SEC (Chile)**: gestión de proyectos y su control documental por tipo de declaración TE, biblioteca normativa (pliegos técnicos RIC), asesorías con profesionales y herramientas de cálculo.

> **Fase 2 en curso — backend real.** El repositorio es un monorepo: `apps/web` (frontend), `apps/api` (NestJS + PostgreSQL + Prisma + almacenamiento S3) y `packages/shared` (tipos y validaciones compartidas). Mientras avanzan las etapas, el frontend sigue usando datos simulados (`apps/web/src/mocks`); los módulos se irán conectando a la API.
>
> El contenido normativo (tipos TE, pliegos RIC, guías de declaración) es **referencial y debe ser validado** contra las publicaciones oficiales de la SEC.

## Stack

- **Web:** React 18 + TypeScript + Vite 5 · Tailwind CSS 3 · React Router 6
- **API:** NestJS 11 · Prisma 6 · PostgreSQL 16 · almacenamiento compatible con S3 (MinIO en local) · Swagger
- **Infraestructura:** Docker Compose (Postgres, MinIO, Mailpit), Nginx

## Requisitos

- Node.js 20.11+ (probado con Node 24) y npm 10+
- Docker 24+ y Docker Compose v2

## Desarrollo local

```bash
npm install
cp apps/api/.env.example apps/api/.env     # completa JWT_ACCESS_SECRET, SEED_ADMIN_PASSWORD y SEED_DEMO_PASSWORD
cp apps/web/.env.example apps/web/.env

npm run infra:up       # Postgres :5432 · MinIO :9000 (consola :9001) · Mailpit :8025
npm run db:deploy      # aplica las migraciones
npm run db:seed        # admin inicial + catálogo de ejemplo + datos demo
npm run dev            # API http://localhost:3000/api (Swagger /api/docs) · Web http://localhost:5173
```

| Script (raíz) | Descripción |
|---|---|
| `npm run dev` | shared (watch) + API (watch) + web (Vite) en paralelo |
| `npm run build` | Build de shared, API y web |
| `npm run lint` / `npm test` | Lint y pruebas de todos los workspaces |
| `npm run infra:up` / `infra:down` | Levanta o detiene Postgres, MinIO y Mailpit |
| `npm run db:migrate` | Crea y aplica una nueva migración (desarrollo) |
| `npm run db:deploy` | Aplica migraciones pendientes |
| `npm run db:seed` | Ejecuta el seed (idempotente) |
| `npm run db:reset` | **Borra** la base, reaplica migraciones y ejecuta el seed |
| `npm run db:studio` | Prisma Studio |

API y web también en contenedores: `docker compose --profile apps up -d --build` (web en http://localhost:8080).

> MinIO dejó de publicar imágenes oficiales en Docker Hub; el entorno de desarrollo usa la build comunitaria `pgsty/minio`. En producción se recomienda un servicio S3 gestionado (AWS S3, Cloudflare R2, etc.).

## Usuarios demo

**Frontend (mientras los módulos no estén conectados a la API):** en la pantalla de inicio de sesión hay **accesos rápidos** que completan las credenciales. Contraseña de todas las cuentas: `demo1234`.

**Base de datos (seed de la API):** las mismas cuentas existen en Postgres. El admin usa `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` y los usuarios demo `SEED_DEMO_PASSWORD`, todos definidos en `apps/api/.env`.

| Perfil | Correo | RUT | Para probar |
|---|---|---|---|
| Eléctrico (aprobado) | `electrico@demo.cl` | 12.345.678-5 | Proyectos, aprendizaje, asesorías, 2 extensiones activas |
| Administrador | `admin@demo.cl` | 11.111.111-1 | Panel de administración completo |
| Eléctrico pendiente | `pendiente@demo.cl` | 15.678.901-1 | Pantalla de cuenta pendiente de validación |

Otros usuarios de ejemplo (rechazado, suspendido, pendientes) aparecen en **Administración → Usuarios**.

Para volver al estado inicial: menú de usuario → **Restablecer datos demo**.

## Despliegue

El despliegue productivo (`docker-compose.prod.yml` con Nginx como reverse proxy, migraciones automáticas y respaldos) se documenta al cerrar la Fase 2 (etapa e).

> Si la maqueta de la Fase 1 está publicada en un hosting estático (Vercel, Netlify…), cambia su *root directory* a `apps/web` y el comando de build a `npm run build -w @electricos/web` (con instalación desde la raíz del repositorio).

## Mapa de rutas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/login` | Inicio de sesión (RUT o correo) con acceso demo por rol | Pública |
| `/registro` | Registro con validación de RUT, fortaleza de contraseña, licencia y certificado SEC | Pública |
| `/pendiente-validacion` | Estado de la cuenta (pendiente / rechazada / suspendida) | Sesión |
| `/` | Inicio con resumen de actividad | Eléctrico, Admin |
| `/proyectos` | Listado con filtros por estado, tipo TE y búsqueda | Eléctrico, Admin |
| `/proyectos/nuevo` | Asistente de creación (datos → tipo TE → resumen) | Eléctrico, Admin |
| `/proyectos/:id/resumen` | Resumen y estado | Eléctrico, Admin |
| `/proyectos/:id/documentos` | Documentos por categoría y checklist del tipo TE | Eléctrico, Admin |
| `/proyectos/:id/documentos/:docId` | Historial de revisiones de un documento | Eléctrico, Admin |
| `/proyectos/:id/control-documental` | Registro de control documental | Eléctrico, Admin |
| `/proyectos/:id/apoyo` | Guía de declaración, checklist, pliegos RIC y material | Eléctrico, Admin |
| `/aprendizaje` | Biblioteca normativa (filtros `?te=` y `?cat=`) | Eléctrico, Admin |
| `/aprendizaje/pliegos/:id` | Visor de documento normativo | Eléctrico, Admin |
| `/aprendizaje/videos` · `/aprendizaje/videos/:id` | Videos y material de apoyo | Eléctrico, Admin |
| `/asesorias` | Directorio de asesores (acepta `?proyecto=`) | Eléctrico, Admin |
| `/asesorias/asesores/:id` | Perfil del asesor con reseñas | Eléctrico, Admin |
| `/asesorias/asesores/:id/solicitar` | Solicitud de asesoría | Eléctrico, Admin |
| `/asesorias/asesores/:id/agendar` | Calendario de bloques disponibles | Eléctrico, Admin |
| `/asesorias/reuniones` | Mis reuniones (próximas e historial) | Eléctrico, Admin |
| `/asesorias/reuniones/:id/calificar` | Calificar asesoría | Eléctrico, Admin |
| `/asesorias/chat` · `/asesorias/chat/:conversacionId` | Chat con asesores | Eléctrico, Admin |
| `/asesorias/videollamada/:reunionId` | Sala de videollamada (maqueta) | Eléctrico, Admin |
| `/extensiones` | Catálogo y solicitud de activación | Eléctrico, Admin |
| `/extensiones/:slug` | Herramienta (`conductores`, `caida-tension`, `cortocircuito`, `alumbrado`); acepta `?proyecto=` | Con extensión activa |
| `/configuracion/perfil` · `/password` · `/notificaciones` | Configuración de la cuenta | Eléctrico, Admin |
| `/admin` | Panel de administración | Admin |
| `/admin/usuarios` · `/admin/usuarios/:id` | Validación y gestión de usuarios | Admin |
| `/admin/tipos-te` | Catálogo de tipos TE | Admin |
| `/admin/contenidos` | Documentos normativos y videos | Admin |
| `/admin/asesores` | Directorio de asesores | Admin |
| `/admin/solicitudes-extensiones` | Aprobación de extensiones | Admin |

## Estructura

```
src/
├── components/      UI reutilizable (components/ui) y componentes compartidos
├── features/        Un directorio por funcionalidad (pages/ + components/)
│   ├── auth · dashboard · proyectos · aprendizaje · asesorias
│   └── extensiones · configuracion · admin
├── hooks/           Hooks genéricos (useAsync, useDebounce, useTiposTE…)
├── layouts/         AppLayout, AuthLayout, Sidebar, Header, Breadcrumbs
├── mocks/           Datos semilla y base simulada (db.ts)
├── router/          Rutas, protección por sesión y por rol
├── services/        Capa de datos con la interfaz de la futura API
├── types/           Modelos de dominio
└── utils/           Formato es-CL, estados, texto, etc.
```

Convenciones para próximas fases: ver [CLAUDE.md](CLAUDE.md). Hoja de ruta: [docs/ROADMAP.md](docs/ROADMAP.md).
