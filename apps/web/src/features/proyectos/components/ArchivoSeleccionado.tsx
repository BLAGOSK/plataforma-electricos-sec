import { useEffect, useMemo } from 'react';
import { ArchivoItem, FilePreview } from '@/components/FilePreview';
import { esImagen, esPdf } from '@/services/archivos';

/** Muestra un File recién seleccionado con miniatura y vista previa (imagen/PDF). */
export function ArchivoSeleccionado({ archivo, onQuitar }: { archivo: File; onQuitar: () => void }) {
  const url = useMemo(() => URL.createObjectURL(archivo), [archivo]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  const conVista = esImagen(archivo.type) || esPdf(archivo.type);

  return (
    <div className="space-y-3">
      <ArchivoItem archivo={{ nombre: archivo.name, tipoMime: archivo.type, tamano: archivo.size }} miniatura={url} onQuitar={onQuitar} />
      {conVista && (
        <FilePreview archivo={{ id: 'local', nombre: archivo.name, tipoMime: archivo.type, tamano: archivo.size, url }} className="h-64" />
      )}
    </div>
  );
}
