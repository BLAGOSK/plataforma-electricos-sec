import type { ID } from './common';
import type { CategoriaDocumento } from './documento';

export interface DocumentoRequerido {
  id: ID;
  nombre: string;
  categoria: CategoriaDocumento;
  obligatorio: boolean;
  descripcion?: string;
}

export interface PasoGuia {
  titulo: string;
  descripcion: string;
}

export interface MaterialApoyo {
  titulo: string;
  tipo: 'video' | 'documento' | 'enlace';
  /** Ruta interna o URL externa */
  to: string;
}

/** Tipo de declaración TE (TE1, TE2…). Catálogo configurable por el administrador. */
export interface TipoTE {
  id: ID;
  /** Ej: "TE1" */
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  /** true mientras el contenido no haya sido validado por un profesional */
  referencial: boolean;
  documentosRequeridos: DocumentoRequerido[];
  guia: PasoGuia[];
  requisitos: Array<{ id: ID; texto: string }>;
  /** IDs de pliegos técnicos RIC aplicables (ver Aprendizaje) */
  pliegosRic: ID[];
  materialApoyo: MaterialApoyo[];
}

export type TipoTEPayload = Omit<TipoTE, 'id'>;
