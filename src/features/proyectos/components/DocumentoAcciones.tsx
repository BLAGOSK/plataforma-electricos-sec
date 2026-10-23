import { useNavigate } from 'react-router-dom';
import { Download, Eye, FilePlus2, History, MoreVertical, Trash2 } from 'lucide-react';
import { descargarArchivo } from '@/services/archivos';
import { documentosService } from '@/services/documentosService';
import type { Documento } from '@/types/documento';
import { Dropdown, DropdownItem, useToast } from '@/components/ui';

interface Props {
  documento: Documento;
  soloLectura: boolean;
  onVer: () => void;
  onNuevaRevision: () => void;
  /** Ruta al historial, relativa a la pestaña actual */
  rutaHistorial: string;
}

export function DocumentoAcciones({ documento, soloLectura, onVer, onNuevaRevision, rutaHistorial }: Props) {
  const navigate = useNavigate();
  const toast = useToast();
  const vigente = documento.revisiones.at(-1)!;

  const eliminar = async () => {
    if (!confirm(`¿Eliminar "${documento.nombre}" y sus ${documento.revisiones.length} revisión(es)?`)) return;
    await documentosService.eliminar(documento.id);
    toast.info('Documento eliminado', documento.nombre);
  };

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button onClick={onVer} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Ver revisión vigente" aria-label="Ver">
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => descargarArchivo(vigente.archivo)}
        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        title="Descargar revisión vigente"
        aria-label="Descargar"
      >
        <Download className="h-4 w-4" />
      </button>
      <Dropdown
        trigger={({ alternar }) => (
          <button onClick={alternar} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Más acciones">
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      >
        {(cerrar) => (
          <div className="py-1">
            <DropdownItem icon={History} onClick={() => navigate(rutaHistorial)}>
              Historial de revisiones
            </DropdownItem>
            {!soloLectura && (
              <>
                <DropdownItem
                  icon={FilePlus2}
                  onClick={() => {
                    cerrar();
                    onNuevaRevision();
                  }}
                >
                  Subir nueva revisión
                </DropdownItem>
                <DropdownItem
                  icon={Trash2}
                  peligro
                  onClick={() => {
                    cerrar();
                    eliminar();
                  }}
                >
                  Eliminar documento
                </DropdownItem>
              </>
            )}
          </div>
        )}
      </Dropdown>
    </div>
  );
}
