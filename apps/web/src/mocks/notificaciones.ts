import type { Notificacion } from '@/types/notificacion';

const haceHoras = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const notificacionesSeed: Notificacion[] = [
  {
    id: 'not-001',
    usuarioId: 'u-001',
    tipo: 'info',
    titulo: 'Nuevo mensaje de asesor',
    mensaje: 'Ing. Roberto Saavedra respondió tu consulta sobre el tablero general.',
    fecha: haceHoras(1),
    leida: false,
    enlace: '/asesorias/chat',
  },
  {
    id: 'not-002',
    usuarioId: 'u-001',
    tipo: 'alerta',
    titulo: 'Reunión mañana',
    mensaje: 'Tienes una videollamada de asesoría agendada para mañana a las 10:00.',
    fecha: haceHoras(5),
    leida: false,
    enlace: '/asesorias/reuniones',
  },
  {
    id: 'not-003',
    usuarioId: 'u-001',
    tipo: 'exito',
    titulo: 'Extensión activada',
    mensaje: 'La extensión "Cálculo de caída de tensión" fue aprobada.',
    fecha: haceHoras(48),
    leida: true,
    enlace: '/extensiones',
  },
  {
    id: 'not-004',
    usuarioId: 'u-002',
    tipo: 'alerta',
    titulo: 'Usuarios pendientes de validación',
    mensaje: 'Hay 2 cuentas nuevas esperando revisión de certificado SEC.',
    fecha: haceHoras(2),
    leida: false,
    enlace: '/admin/usuarios?estado=pendiente',
  },
  {
    id: 'not-005',
    usuarioId: 'u-002',
    tipo: 'info',
    titulo: 'Solicitudes de extensiones',
    mensaje: 'Hay solicitudes de activación de extensiones por resolver.',
    fecha: haceHoras(20),
    leida: false,
    enlace: '/admin/solicitudes-extensiones',
  },
];
