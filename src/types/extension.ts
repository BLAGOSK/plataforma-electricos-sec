import type { ID, ISODate } from './common';

export type ExtensionSlug = 'conductores' | 'caida-tension' | 'cortocircuito' | 'alumbrado';

/** Estado de una extensión para un usuario concreto. */
export type EstadoExtension = 'no_solicitada' | 'pendiente' | 'activa' | 'rechazada';

export interface Extension {
  id: ID;
  slug: ExtensionSlug;
  nombre: string;
  descripcionCorta: string;
  descripcion: string;
  caracteristicas: string[];
}

export interface SolicitudExtension {
  id: ID;
  usuarioId: ID;
  extensionId: ID;
  estado: Exclude<EstadoExtension, 'no_solicitada'>;
  comentario?: string;
  fechaSolicitud: ISODate;
  fechaResolucion?: ISODate;
  motivoRechazo?: string;
}

export interface ExtensionConEstado extends Extension {
  estado: EstadoExtension;
  solicitud?: SolicitudExtension;
}
