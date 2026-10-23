import type { ArchivoAdjunto, ID, ISODate } from './common';

export type CategoriaDocumento =
  | 'planos'
  | 'memoria_calculo'
  | 'fotografias'
  | 'cuadros_carga'
  | 'certificados'
  | 'otros';

/** Nomenclatura de revisiones: Rev. A, B, C… o Rev. 0, 1, 2… */
export type EsquemaRevision = 'letras' | 'numeros';

export interface Revision {
  id: ID;
  /** "A", "B"… o "0", "1"… */
  numero: string;
  comentario: string;
  archivo: ArchivoAdjunto;
  fecha: ISODate;
  autorNombre: string;
}

export interface Documento {
  id: ID;
  proyectoId: ID;
  nombre: string;
  categoria: CategoriaDocumento;
  /** Documento requerido del tipo TE que este archivo satisface (si aplica). */
  requisitoId?: ID;
  esquemaRevision: EsquemaRevision;
  /** Ordenadas de la más antigua a la más reciente. La última es la vigente. */
  revisiones: Revision[];
  fechaCreacion: ISODate;
}

export interface NuevoDocumentoPayload {
  nombre: string;
  categoria: CategoriaDocumento;
  requisitoId?: ID;
  esquemaRevision: EsquemaRevision;
  numeroRevision: string;
  comentario: string;
  archivo: File;
}

export interface NuevaRevisionPayload {
  numero: string;
  comentario: string;
  archivo: File;
}
