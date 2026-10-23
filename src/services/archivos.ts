/**
 * Carga de archivos simulada: no hay almacenamiento real. Se crea una URL
 * local (blob) válida solo durante la sesión del navegador.
 */
import type { ArchivoAdjunto } from '@/types/common';
import { nuevoId } from '@/mocks/db';

const urlsDeSesion = new Set<string>();

export function archivoDesdeFile(file: File): ArchivoAdjunto {
  const url = URL.createObjectURL(file);
  urlsDeSesion.add(url);
  return {
    id: nuevoId('arc'),
    nombre: file.name,
    tipoMime: file.type || 'application/octet-stream',
    tamano: file.size,
    url,
  };
}

/** Un blob de una sesión anterior ya no existe: no se puede previsualizar ni descargar. */
export function archivoDisponible(archivo: Pick<ArchivoAdjunto, 'url'>): boolean {
  return !archivo.url.startsWith('blob:') || urlsDeSesion.has(archivo.url);
}

export function esImagen(tipoMime: string): boolean {
  return tipoMime.startsWith('image/');
}

export function esPdf(tipoMime: string): boolean {
  return tipoMime === 'application/pdf';
}

/** Descarga simulada: abre/descarga el archivo de ejemplo asociado. */
export function descargarArchivo(archivo: ArchivoAdjunto): void {
  if (!archivoDisponible(archivo)) return;
  const a = document.createElement('a');
  a.href = archivo.url;
  a.download = archivo.nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
