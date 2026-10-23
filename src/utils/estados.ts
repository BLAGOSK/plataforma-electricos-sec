/**
 * Etiquetas y colores de los estados de cada dominio.
 * Fuente única para StatusBadge, filtros y selects.
 */
import type { BadgeColor } from '@/components/ui/Badge';
import type { EstadoExtension } from '@/types/extension';
import type { EstadoUsuario } from '@/types/usuario';

export interface InfoEstado {
  label: string;
  color: BadgeColor;
}

export const estadosUsuario: Record<EstadoUsuario, InfoEstado> = {
  pendiente: { label: 'Pendiente', color: 'yellow' },
  aprobado: { label: 'Aprobado', color: 'green' },
  rechazado: { label: 'Rechazado', color: 'red' },
  suspendido: { label: 'Suspendido', color: 'gray' },
};

export const estadosExtension: Record<EstadoExtension, InfoEstado> = {
  no_solicitada: { label: 'No solicitada', color: 'gray' },
  pendiente: { label: 'Pendiente', color: 'yellow' },
  activa: { label: 'Activa', color: 'green' },
  rechazada: { label: 'Rechazada', color: 'red' },
};

export const dominiosEstado = {
  usuario: estadosUsuario,
  extension: estadosExtension,
};

export type DominioEstado = keyof typeof dominiosEstado;
