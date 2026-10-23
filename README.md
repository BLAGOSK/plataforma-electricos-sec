# Plataforma Eléctricos SEC

Plataforma web para **instaladores eléctricos autorizados por la SEC (Chile)**: gestión de proyectos y su control documental por tipo de declaración TE, biblioteca normativa (pliegos técnicos RIC), asesorías con profesionales y herramientas de cálculo.

> **Fase 1 — Maqueta navegable.** No hay backend: los datos son simulados (`src/mocks`) y los servicios (`src/services`) exponen la misma interfaz asíncrona que tendrá la API real. Las acciones de la demo (aprobar usuarios, subir revisiones, agendar reuniones…) se guardan en el `localStorage` del navegador.
>
> El contenido normativo (tipos TE, pliegos RIC, guías de declaración) es **referencial y debe ser validado** contra las publicaciones oficiales de la SEC.

## Stack

- React 18 + TypeScript + Vite 5
- Tailwind CSS 3 · lucide-react
- React Router 6 (data router, rutas protegidas por rol)
- Nginx (servir la SPA) · Docker

## Requisitos

- Node.js 20 LTS o superior (probado con Node 24) y npm 10+
- Docker 24+ y Docker Compose v2 (solo para ejecución con contenedores)

## Instalación y ejecución local

```bash
npm install
cp .env.example .env      # opcional en la Fase 1
npm run dev               # http://localhost:5173
```

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Verificación de tipos (`tsc -b`) y build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | ESLint |

## Usuarios demo

En la pantalla de inicio de sesión hay **accesos rápidos** que completan las credenciales. Contraseña de todas las cuentas: `demo1234`.

| Perfil | Correo | RUT | Para probar |
|---|---|---|---|
| Eléctrico (aprobado) | `electrico@demo.cl` | 12.345.678-5 | Proyectos, aprendizaje, asesorías, 2 extensiones activas |
| Administrador | `admin@demo.cl` | 11.111.111-1 | Panel de administración completo |
| Eléctrico pendiente | `pendiente@demo.cl` | 15.678.901-1 | Pantalla de cuenta pendiente de validación |

Otros usuarios de ejemplo (rechazado, suspendido, pendientes) aparecen en **Administración → Usuarios**.

Para volver al estado inicial: menú de usuario → **Restablecer datos demo**.

## Ejecución con Docker

```bash
docker compose up -d --build     # http://localhost:8080
docker compose logs -f web
docker compose down
```

Variables opcionales (en `.env` o en el entorno):

| Variable | Por defecto | Uso |
|---|---|---|
| `PUERTO_WEB` | `8080` | Puerto publicado en el host |
| `VITE_API_URL` | `http://localhost:3000/api` | URL de la API (Fase 2). Se incrusta en el build |
| `VITE_USE_MOCKS` | `true` | Usar datos simulados |

La imagen es multietapa: compila con `node:20-alpine` y sirve `dist/` con `nginx:1.27-alpine`. `nginx.conf` incluye el *fallback* de SPA (`try_files … /index.html`), compresión gzip, caché larga para `/assets/` y un endpoint de salud en `/healthz`.

## Despliegue en la nube

Cualquier VM con Docker (AWS EC2/Lightsail, Google Compute Engine, Azure VM, DigitalOcean, etc.):

```bash
git clone <url-del-repositorio> && cd plataforma-electricos-sec
echo "PUERTO_WEB=80" > .env
docker compose up -d --build
```

Recomendaciones:

- Poner delante un proxy con TLS (Caddy, Traefik o Nginx + Let's Encrypt) o el balanceador del proveedor.
- Alternativa sin servidor: subir `dist/` a un hosting estático (S3 + CloudFront, Azure Static Web Apps, Netlify) configurando la reescritura de todas las rutas a `/index.html`.
- `VITE_*` se fijan **en tiempo de build**; para otro entorno, reconstruye la imagen con el `--build-arg` correspondiente.

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
