/** Reglas de archivos compartidas por el formulario web y la validación de la API. */

export const EXTENSIONES_PERMITIDAS = ['pdf', 'dwg', 'dxf', 'jpg', 'jpeg', 'png', 'webp', 'xlsx'] as const;

/** Tipos MIME aceptados por extensión. DWG/DXF suelen llegar como octet-stream desde el navegador. */
export const MIME_POR_EXTENSION: Record<(typeof EXTENSIONES_PERMITIDAS)[number], string[]> = {
  pdf: ['application/pdf'],
  dwg: ['image/vnd.dwg', 'application/acad', 'application/x-dwg', 'application/octet-stream'],
  dxf: ['image/vnd.dxf', 'application/dxf', 'application/x-dxf', 'application/octet-stream'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'],
};

/** Formatos aceptados para el certificado SEC del registro. */
export const EXTENSIONES_CERTIFICADO = ['pdf', 'jpg', 'jpeg', 'png'] as const;

export function extensionDe(nombre: string): string {
  const i = nombre.lastIndexOf('.');
  return i >= 0 ? nombre.slice(i + 1).toLowerCase() : '';
}

/**
 * Sanea un nombre de archivo: sin rutas, sin caracteres de control ni reservados,
 * tildes convertidas a ASCII y largo acotado. Conserva la extensión.
 */
export function sanearNombreArchivo(nombre: string, largoMaximo = 120): string {
  const base = nombre.split(/[\\/]/).pop() ?? 'archivo';
  const ext = extensionDe(base);
  const sinExt = ext ? base.slice(0, -(ext.length + 1)) : base;
  const limpio =
    sinExt
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9._ -]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^[._]+/, '')
      .slice(0, largoMaximo - ext.length - 1) || 'archivo';
  return ext ? `${limpio}.${ext}` : limpio;
}

/** Valida extensión y tipo MIME. Devuelve un mensaje de error o null. */
export function errorTipoArchivo(nombre: string, mimeType: string, permitidas: readonly string[] = EXTENSIONES_PERMITIDAS): string | null {
  const ext = extensionDe(nombre);
  if (!permitidas.includes(ext)) return `Formato no permitido (.${ext || '?'}). Permitidos: ${permitidas.join(', ')}`;
  const mimes = MIME_POR_EXTENSION[ext as keyof typeof MIME_POR_EXTENSION] ?? [];
  if (mimeType && !mimes.includes(mimeType)) return `El tipo de archivo (${mimeType}) no corresponde a la extensión .${ext}`;
  return null;
}
