import type { ReactNode } from 'react';
import type { Params } from 'react-router-dom';

/** Metadatos de cada ruta (react-router `handle`). */
export interface RouteHandle {
  /** Texto de la miga de pan, o función que la construye a partir de los parámetros (ej. nombre de un proyecto). */
  crumb?: string | ((params: Params<string>) => ReactNode);
}
