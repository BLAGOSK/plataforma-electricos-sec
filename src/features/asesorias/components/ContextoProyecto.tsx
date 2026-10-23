import { FolderKanban, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { proyectosService } from '@/services/proyectosService';

/** Lee ?proyecto=id: la asesoría se solicita desde un proyecto. */
// eslint-disable-next-line react-refresh/only-export-components
export function useProyectoContexto() {
  const [params, setParams] = useSearchParams();
  const proyectoId = params.get('proyecto') ?? '';
  const { data: proyecto } = useAsync(() => (proyectoId ? proyectosService.obtener(proyectoId).catch(() => null) : Promise.resolve(null)), [proyectoId]);
  const quitar = () => {
    const p = new URLSearchParams(params);
    p.delete('proyecto');
    setParams(p, { replace: true });
  };
  return { proyectoId, proyecto: proyecto ?? null, quitar, sufijo: proyectoId ? `?proyecto=${proyectoId}` : '' };
}

export function BannerProyecto({ nombre, codigo, onQuitar }: { nombre: string; codigo: string; onQuitar?: () => void }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
      <FolderKanban className="h-4 w-4 shrink-0" />
      <p className="flex-1">
        Buscando asesoría para el proyecto <strong>{nombre}</strong> ({codigo})
      </p>
      {onQuitar && (
        <button onClick={onQuitar} className="rounded p-1 hover:bg-brand-100" aria-label="Quitar proyecto">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
