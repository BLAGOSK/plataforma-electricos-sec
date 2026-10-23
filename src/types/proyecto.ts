import type { ID, ISODate } from './common';

export type EstadoProyecto = 'borrador' | 'en_desarrollo' | 'listo_para_declarar' | 'declarado';

export interface ClienteProyecto {
  nombre: string;
  rut?: string;
  email?: string;
  telefono?: string;
}

export interface Proyecto {
  id: ID;
  /** Código legible, ej. "PRY-2026-014" */
  codigo: string;
  usuarioId: ID;
  nombre: string;
  descripcion?: string;
  cliente: ClienteProyecto;
  direccion: string;
  comuna: string;
  region: string;
  /** Potencia declarada en kW */
  potenciaKw: number;
  tipoTEId: ID;
  estado: EstadoProyecto;
  fechaCreacion: ISODate;
  fechaActualizacion: ISODate;
  /** Datos de la declaración ante la SEC (cuando estado = declarado) */
  folioSec?: string;
  fechaDeclaracion?: ISODate;
  /** IDs de requisitos de la guía de apoyo marcados como cumplidos */
  checklistApoyo: ID[];
}

/** Proyecto con datos derivados para listados. */
export interface ProyectoResumen extends Proyecto {
  tipoTECodigo: string;
  tipoTENombre: string;
  responsableNombre: string;
  docsRequeridos: number;
  docsCargados: number;
  totalDocumentos: number;
}

export interface FiltrosProyectos {
  q?: string;
  tipoTEId?: ID;
  estado?: EstadoProyecto;
}

export type ProyectoPayload = Pick<
  Proyecto,
  'nombre' | 'descripcion' | 'cliente' | 'direccion' | 'comuna' | 'region' | 'potenciaKw' | 'tipoTEId'
>;
