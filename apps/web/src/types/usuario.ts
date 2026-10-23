import type { ArchivoAdjunto, ID, ISODate } from './common';

export type Rol = 'electrico' | 'admin';

export type EstadoUsuario = 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';

/** Clases de licencia de instalador eléctrico SEC. */
export type ClaseLicencia = 'A' | 'B' | 'C' | 'D';

export interface LicenciaSec {
  numero: string;
  clase: ClaseLicencia;
}

export interface Usuario {
  id: ID;
  nombre: string;
  rut: string;
  email: string;
  telefono?: string;
  comuna?: string;
  rol: Rol;
  estado: EstadoUsuario;
  licencia?: LicenciaSec;
  certificado?: ArchivoAdjunto;
  fechaRegistro: ISODate;
  /** Motivo del último cambio de estado (rechazo o suspensión). */
  motivoEstado?: string;
  fechaEstado?: ISODate;
}

export interface Sesion {
  usuario: Usuario;
  token: string;
}

export interface RegistroPayload {
  nombre: string;
  rut: string;
  email: string;
  password: string;
  licencia: LicenciaSec;
  certificado: File;
}

export interface PerfilPayload {
  nombre: string;
  email: string;
  telefono?: string;
  comuna?: string;
}

export interface PreferenciasNotificacion {
  emailProyectos: boolean;
  emailAsesorias: boolean;
  emailExtensiones: boolean;
  emailNovedades: boolean;
  appMensajes: boolean;
  appRecordatorios: boolean;
}
