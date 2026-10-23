# Hoja de ruta

## Fase 1 — Maqueta navegable ✅

Frontend completo con datos simulados: autenticación por rol, proyectos con control documental, aprendizaje, asesorías (chat, agenda, videollamada maqueta), extensiones maqueta y administración. Despliegue con Docker + Nginx.

**Pendiente de validar con usuarios y expertos:** contenido de tipos TE, guías de declaración y biblioteca RIC (marcado como referencial).

---

## Fase 2 — Backend y base de datos

- API REST (Node.js con NestJS o Fastify, o equivalente) documentada con OpenAPI; un módulo por cada servicio actual (`authService`, `proyectosService`, `documentosService`, `tiposTEService`, `aprendizajeService`, `asesoriasService`, `chatService`, `extensionesService`, `adminService`, `notificacionesService`).
- PostgreSQL con migraciones (Prisma/TypeORM/Drizzle). Entidades a partir de `src/types`.
- Reemplazar la implementación de cada servicio del frontend por llamadas `http()` manteniendo sus firmas; desactivar `VITE_USE_MOCKS`.
- Validaciones de negocio en el servidor (RUT, revisiones únicas, motivo obligatorio, disponibilidad de bloques).
- Notificaciones persistentes y envío de correo (preferencias por usuario).
- Bitácora de auditoría para acciones de administración.

## Fase 3 — Autenticación real

- Registro con verificación de correo y recuperación de contraseña.
- Contraseñas con hash (Argon2/bcrypt); sesiones con JWT de corta duración + refresh token en cookie `HttpOnly`.
- Autorización por rol en la API (eléctrico, admin; evaluar rol "asesor").
- Bloqueo por intentos fallidos, 2FA opcional para administradores.
- Integración opcional con ClaveÚnica o verificación de licencia contra registros SEC, si existe un mecanismo oficial.

## Fase 4 — Almacenamiento de archivos

- Almacenamiento de objetos (S3, GCS, Azure Blob o MinIO) con URLs firmadas de subida y descarga.
- Límites de tamaño y tipo, escaneo antivirus, miniaturas de imágenes y vista previa de PDF.
- Versionado de revisiones inmutable (no se sobrescribe una revisión emitida).
- Exportación del expediente del proyecto (ZIP con la revisión vigente de cada documento).

## Fase 5 — Chat y videollamada en tiempo real

- Mensajería en tiempo real con WebSockets (Socket.IO) o un servicio gestionado; estados de entrega y lectura, indicador de escritura real.
- Adjuntos en el chat usando el almacenamiento de la Fase 4.
- Videollamada con WebRTC mediante un proveedor (LiveKit, Daily, Twilio, Jitsi auto-hospedado): sala de espera, compartir pantalla y grabación opcional con consentimiento.
- Agenda real del asesor (bloques editables, recordatorios por correo, exportación a calendario `.ics`).
- Flujo de pago de asesorías (opcional).

## Fase 6 — Lógica real de las extensiones

- Implementar los cálculos como módulos puros con **pruebas unitarias** y casos validados por ingenieros:
  1. Dimensionamiento de conductores (capacidad de corriente, factores de corrección por temperatura y agrupamiento según la normativa vigente).
  2. Caída de tensión (monofásica/trifásica, por tramos).
  3. Corriente de cortocircuito (impedancias de red, transformador y conductores; verificación de poder de corte).
  4. Cálculo de alumbrado (método de lúmenes y/o cálculo punto por punto, curvas fotométricas IES/LDT, malla de cálculo e isolíneas).
- Guardar los resultados en el proyecto y generar la memoria de cálculo en PDF.
- Tablas normativas administrables por el administrador, con versionado.

## Transversal

- Pruebas: unitarias (Vitest + Testing Library) y E2E (Playwright) de los flujos críticos.
- CI/CD: lint, build, pruebas y publicación de la imagen Docker en cada *merge*.
- Observabilidad: logs estructurados, métricas y monitoreo de errores (Sentry).
- Accesibilidad WCAG 2.1 AA y rendimiento (carga diferida de rutas).
- Cumplimiento de la Ley 19.628 de protección de datos personales.
