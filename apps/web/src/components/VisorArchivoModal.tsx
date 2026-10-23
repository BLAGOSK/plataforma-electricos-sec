import { Download } from 'lucide-react';
import type { ArchivoAdjunto } from '@/types/common';
import { archivoDisponible, descargarArchivo } from '@/services/archivos';
import { formatBytes } from '@/utils/format';
import { FilePreview } from './FilePreview';
import { Button, Modal } from './ui';

interface Props {
  archivo: ArchivoAdjunto | null;
  titulo?: string;
  onClose: () => void;
}

/** Modal de vista previa con opción de descarga. */
export function VisorArchivoModal({ archivo, titulo, onClose }: Props) {
  if (!archivo) return null;
  return (
    <Modal
      abierto
      onClose={onClose}
      size="xl"
      titulo={titulo ?? archivo.nombre}
      descripcion={`${archivo.nombre} · ${formatBytes(archivo.tamano)}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button icon={Download} onClick={() => descargarArchivo(archivo)} disabled={!archivoDisponible(archivo)}>
            Descargar
          </Button>
        </>
      }
    >
      <FilePreview archivo={archivo} className="min-h-[60vh]" />
    </Modal>
  );
}
