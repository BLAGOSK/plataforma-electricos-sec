import { Search, X } from 'lucide-react';
import type { TipoTE } from '@/types/tipoTE';
import { cn } from '@/utils/cn';
import { Button, Select } from '@/components/ui';

interface Props {
  busqueda: string;
  onBusqueda: (v: string) => void;
  tipoTEId: string;
  onTipoTE: (v: string) => void;
  categoria: string;
  onCategoria: (v: string) => void;
  categorias: Array<{ value: string; label: string }>;
  tipos: TipoTE[];
  onLimpiar: () => void;
  placeholder: string;
}

export function FiltrosAprendizaje(p: Props) {
  const hayFiltros = !!(p.busqueda || p.tipoTEId || p.categoria);
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={p.busqueda}
            onChange={(e) => p.onBusqueda(e.target.value)}
            placeholder={p.placeholder}
            className="form-control pl-9"
            aria-label="Buscar"
          />
        </div>
        <Select
          containerClassName="sm:w-72"
          value={p.tipoTEId}
          onChange={(e) => p.onTipoTE(e.target.value)}
          placeholder="Todos los tipos TE"
          opciones={p.tipos.map((t) => ({ value: t.id, label: `${t.codigo} — ${t.nombre}` }))}
          aria-label="Filtrar por tipo TE"
        />
        {hayFiltros && (
          <Button variant="ghost" icon={X} onClick={p.onLimpiar}>
            Limpiar
          </Button>
        )}
      </div>
      <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
        {[{ value: '', label: 'Todas las categorías' }, ...p.categorias].map((c) => (
          <button
            key={c.value || 'todas'}
            onClick={() => p.onCategoria(c.value)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
              p.categoria === c.value ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
