import { Download, FileImage, FileSpreadsheet, FileText, File as FileIcon, X, type LucideIcon } from 'lucide-react';
import type { ArchivoAdjunto } from '@/types/common';
import { archivoDisponible, descargarArchivo, esImagen, esPdf } from '@/services/archivos';
import { cn } from '@/utils/cn';
import { formatBytes } from '@/utils/format';

// eslint-disable-next-line react-refresh/only-export-components
export function iconoArchivo(tipoMime: string, nombre = ''): LucideIcon {
  if (esImagen(tipoMime)) return FileImage;
  if (esPdf(tipoMime)) return FileText;
  if (/\.(xlsx?|csv)$/i.test(nombre) || tipoMime.includes('sheet') || tipoMime.includes('excel')) return FileSpreadsheet;
  return FileIcon;
}

/** Vista previa grande de un archivo (imagen o PDF). */
export function FilePreview({ archivo, className }: { archivo: ArchivoAdjunto; className?: string }) {
  if (!archivoDisponible(archivo)) {
    return (
      <div className={cn('flex h-64 flex-col items-center justify-center rounded-lg bg-slate-100 p-6 text-center', className)}>
        <FileIcon className="mb-2 h-10 w-10 text-slate-400" />
        <p className="text-sm font-medium text-slate-600">Vista previa no disponible</p>
        <p className="mt-1 text-xs text-slate-500">
          Archivo simulado de una sesión anterior (en esta fase no hay almacenamiento real).
        </p>
      </div>
    );
  }
  // Los SVG de ejemplo se tratan como imagen aunque el tipo declarado sea otro.
  if (esImagen(archivo.tipoMime) || archivo.url.endsWith('.svg')) {
    return (
      <div className={cn('flex items-center justify-center overflow-hidden rounded-lg bg-slate-100', className)}>
        <img src={archivo.url} alt={archivo.nombre} className="max-h-[480px] w-auto object-contain" />
      </div>
    );
  }
  if (esPdf(archivo.tipoMime)) {
    return <iframe src={archivo.url} title={archivo.nombre} className={cn('h-[480px] w-full rounded-lg border border-slate-200', className)} />;
  }
  const Icon = iconoArchivo(archivo.tipoMime, archivo.nombre);
  return (
    <div className={cn('flex h-48 flex-col items-center justify-center rounded-lg bg-slate-100', className)}>
      <Icon className="mb-2 h-10 w-10 text-slate-400" />
      <p className="text-sm text-slate-600">Sin vista previa para este formato</p>
    </div>
  );
}

interface ArchivoItemProps {
  archivo: Pick<ArchivoAdjunto, 'nombre' | 'tipoMime' | 'tamano'> & Partial<Pick<ArchivoAdjunto, 'url' | 'id'>>;
  /** Miniatura local (para archivos recién seleccionados) */
  miniatura?: string;
  onQuitar?: () => void;
  onDescargar?: boolean;
  className?: string;
}

/** Fila compacta con ícono/miniatura, nombre y tamaño. */
export function ArchivoItem({ archivo, miniatura, onQuitar, onDescargar, className }: ArchivoItemProps) {
  const Icon = iconoArchivo(archivo.tipoMime, archivo.nombre);
  return (
    <div className={cn('flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5', className)}>
      {miniatura && esImagen(archivo.tipoMime) ? (
        <img src={miniatura} alt="" className="h-10 w-10 rounded object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{archivo.nombre}</p>
        <p className="text-xs text-slate-500">{formatBytes(archivo.tamano)}</p>
      </div>
      {onDescargar && archivo.url && archivo.id && (
        <button
          type="button"
          onClick={() => descargarArchivo(archivo as ArchivoAdjunto)}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Descargar"
        >
          <Download className="h-4 w-4" />
        </button>
      )}
      {onQuitar && (
        <button
          type="button"
          onClick={onQuitar}
          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Quitar archivo"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
