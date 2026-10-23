# CLAUDE.md — Convenciones del proyecto

Plataforma web para instaladores eléctricos SEC (Chile). Fase actual: **Fase 2 — backend real** (ver `docs/ROADMAP.md`). Monorepo con npm workspaces: `apps/web`, `apps/api`, `packages/shared`.

## Comandos (desde la raíz)

- `npm run infra:up` — Postgres, MinIO y Mailpit en Docker
- `npm run dev` — shared + API (:3000) + web (:5173) en paralelo
- `npm run build` · `npm run lint` · `npm test` — **deben pasar sin errores antes de cada commit**
- `npm run db:migrate` (nueva migración) · `db:deploy` · `db:seed` · `db:reset`
- Las convenciones del frontend de abajo aplican a `apps/web`; las del backend se documentan al cerrar la etapa b).

## Arquitectura

- **Capas:** `pages/components` → `services` → (`mocks/db.ts` hoy | API HTTP mañana). Las páginas **nunca** importan de `src/mocks` salvo datos de referencia estáticos (`mocks/geografia.ts`) y los accesos demo del login.
- **Servicios** (`src/services/*Service.ts`): objetos con métodos `async` que devuelven copias (`clonar`) y lanzan `ServiceError` con mensajes en español para el usuario. Al migrar a la API se reemplaza la implementación interna por `http()` (`services/http.ts`) sin cambiar firmas.
- **Cambios reactivos:** cada mutación llama a `emitirCambio(tema)`; las vistas dependientes usan `useVersion(tema)` como dependencia de `useAsync`. Temas: `usuarios`, `extensiones`, `notificaciones`, `proyectos`, `contenidos`, `asesorias`, `chat`.
- **Datos:** `useAsync(fn, deps)` para cargar; no hay librería de estado global. La sesión vive en `AuthContext` (`useAuth`, `useUsuario`).
- **Rutas:** definidas solo en `src/router/routes.tsx` (data router). Cada ruta con miga de pan declara `handle: { crumb }`; para nombres dinámicos usar `AsyncCrumb` con `key` del parámetro. Protección: `ProtectedRoute` (sesión + cuenta aprobada), `RoleRoute roles={['admin']}`.
- **Archivos:** carga simulada con `archivoDesdeFile()` (URL `blob:` válida solo en la sesión). `archivoDisponible()` indica si se puede previsualizar o descargar.

## Estructura y nombres

- Funcionalidades en `src/features/<feature>/{pages,components}`; constantes de la feature en `constantes.ts`.
- Páginas: `XxxPage.tsx`; modales: `XxxModal.tsx`; un componente exportado por archivo, PascalCase.
- Tipos de dominio en `src/types/<dominio>.ts`. Payloads de creación/edición: `XxxPayload`.
- **Idioma:** código de dominio, variables, rutas y textos en **español** (`proyecto`, `revisiones`, `/asesorias/reuniones`). Palabras reservadas y APIs de librerías en inglés.
- Estados: claves en `snake_case` (`listo_para_declarar`); etiquetas y colores únicamente en `utils/estados.ts` y se muestran con `<StatusBadge dominio=… estado=… />`.
- IDs con prefijo (`pry-`, `doc-`, `rev-`, `as-`, `reu-`…).
- Alias de importación `@/` → `src/`. Orden: React/librerías → `@/features` → `@/hooks` → `@/services` → `@/types` → `@/utils` → `@/components` → relativos.

## Estilo de UI

- Tailwind con paleta `brand` (azul técnico) y `accent` (ámbar "energía"); tipografía Inter.
- Usar siempre los componentes de `@/components/ui` (`Button`, `Input`, `Select`, `Card`, `Modal`, `Tabs`, `Badge`, `Table`, `EmptyState`, `useToast`…) antes de crear estilos nuevos.
- Todas las páginas internas: `PageHeader` + breadcrumbs automáticos; estados de carga (`Cargando`) y vacíos (`EmptyState`).
- Responsive obligatorio: tablas en `Table` (scroll horizontal) o tarjetas en móvil; probar a 375 px.
- Formato chileno con `utils/format.ts` (`formatFecha`, `formatCLP`, `formatNumero`). RUT con `features/auth/utils/rut.ts` (validación módulo 11).
- Contenido normativo de ejemplo: marcar con `ReferencialBadge` / `ReferencialAviso`.
- Accesibilidad: `label` en controles, `aria-label` en botones de solo ícono, foco visible.

## Reglas para las próximas fases

- No romper la interfaz pública de los servicios; si cambia, actualizar todos los consumidores en el mismo commit.
- Toda lógica de negocio que hoy simula el servicio (validaciones, notificaciones, cálculo de disponibilidad, promedio de reseñas) debe migrar al backend.
- Las herramientas de `features/extensiones/herramientas` muestran **resultados de ejemplo**; los cálculos reales deben implementarse en el backend o en un módulo puro con pruebas unitarias.
- Mensajes de commit en español con prefijo convencional: `feat(proyectos): …`, `fix: …`, `docs: …`.
