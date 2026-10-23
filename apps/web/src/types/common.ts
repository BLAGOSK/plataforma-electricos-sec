/** Identificador opaco (en la API real será UUID). */
export type ID = string;

/** Fecha en formato ISO 8601 (ej. "2026-10-23T13:00:00.000Z"). */
export type ISODate = string;

/** Archivo adjunto. En la Fase 1 la URL es un archivo de ejemplo en /public o un blob local de la sesión. */
export interface ArchivoAdjunto {
  id: ID;
  nombre: string;
  tipoMime: string;
  /** Tamaño en bytes */
  tamano: number;
  url: string;
}

export interface Opcion<T extends string = string> {
  value: T;
  label: string;
}
