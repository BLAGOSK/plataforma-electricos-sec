import type { ArchivoAdjunto, ID, ISODate } from './common';

export type CategoriaNormativa = 'pliego_ric' | 'reglamento' | 'norma' | 'instructivo' | 'guia';

/** Pliego técnico RIC u otro documento normativo de la biblioteca. */
export interface DocumentoNormativo {
  id: ID;
  /** Ej: "RIC N°04" */
  codigo: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaNormativa;
  version: string;
  /** Fecha de publicación/vigencia de la versión */
  fecha: ISODate;
  /** Tipos TE relacionados */
  tiposTE: ID[];
  archivo: ArchivoAdjunto;
  referencial: boolean;
  fechaActualizacion: ISODate;
}

export type CategoriaVideo = 'tutorial' | 'normativa' | 'webinar' | 'caso_practico';

export interface Video {
  id: ID;
  titulo: string;
  descripcion: string;
  categoria: CategoriaVideo;
  duracionSeg: number;
  /** URL de inserción (YouTube/Vimeo). Si no existe, se usa un reproductor simulado. */
  embedUrl?: string;
  autor: string;
  fechaPublicacion: ISODate;
  tiposTE: ID[];
  /** Material descargable asociado */
  materiales: ArchivoAdjunto[];
}

export interface FiltrosAprendizaje {
  q?: string;
  tipoTEId?: ID;
  categoria?: string;
}

export type DocumentoNormativoPayload = Omit<DocumentoNormativo, 'id' | 'archivo' | 'fechaActualizacion'>;
export type VideoPayload = Omit<Video, 'id' | 'materiales'>;
