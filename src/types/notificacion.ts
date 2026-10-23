import type { ID, ISODate } from './common';

export type TipoNotificacion = 'info' | 'exito' | 'alerta';

export interface Notificacion {
  id: ID;
  usuarioId: ID;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: ISODate;
  leida: boolean;
  /** Ruta interna a la que lleva la notificación */
  enlace?: string;
}
