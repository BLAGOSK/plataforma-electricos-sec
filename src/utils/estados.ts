/**
 * Etiquetas y colores de los estados de cada dominio.
 * Fuente única para StatusBadge, filtros y selects.
 */
import type { BadgeColor } from '@/components/ui/Badge';
import type { EstadoExtension } from '@/types/extension';
import type { EstadoProyecto } from '@/types/proyecto';
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

export const estadosProyecto: Record<EstadoProyecto, InfoEstado> = {
  borrador: { label: 'Borrador', color: 'gray' },
  en_desarrollo: { label: 'En desarrollo', color: 'blue' },
  listo_para_declarar: { label: 'Listo para declarar', color: 'yellow' },
  declarado: { label: 'Declarado', color: 'green' },
};

/** Orden del flujo de un proyecto. */
export const flujoProyecto: EstadoProyecto[] = ['borrador', 'en_desarrollo', 'listo_para_declarar', 'declarado'];

export const dominiosEstado = {
  usuario: estadosUsuario,
  extension: estadosExtension,
  proyecto: estadosProyecto,
};

export type DominioEstado = keyof typeof dominiosEstado;
