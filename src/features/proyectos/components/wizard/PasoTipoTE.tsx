import { CheckCircle2, FileText } from 'lucide-react';
import type { TipoTE } from '@/types/tipoTE';
import { cn } from '@/utils/cn';
import { ReferencialAviso } from '@/components/ReferencialAviso';

interface Props {
  tipos: TipoTE[];
  seleccionado: string;
  onSeleccionar: (id: string) => void;
  error?: string;
}

export function PasoTipoTE({ tipos, seleccionado, onSeleccionar, error }: Props) {
  const actual = tipos.find((t) => t.id === seleccionado);
  return (
    <div className="space-y-4">
      <ReferencialAviso>
        El catálogo de tipos TE es configurable por el administrador. Los datos de ejemplo deben validarse con la normativa SEC vigente.
      </ReferencialAviso>

      <div role="radiogroup" aria-label="Tipo de declaración TE" className="grid gap-3 sm:grid-cols-2">
        {tipos.map((t) => {
          const activo = t.id === seleccionado;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onSeleccionar(t.id)}
              className={cn(
                'relative rounded-xl border-2 p-4 text-left transition-colors',
                activo ? 'border-brand-600 bg-brand-50/50' : 'border-slate-200 bg-white hover:border-brand-300',
              )}
            >
              {activo && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-brand-600" />}
              <span className="inline-flex rounded-md bg-brand-700 px-2 py-0.5 text-sm font-bold text-white">{t.codigo}</span>
              <p className="mt-2 pr-6 font-semibold text-slate-900">{t.nombre}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{t.descripcion}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500">
                <FileText className="h-3.5 w-3.5" />
                {t.documentosRequeridos.filter((d) => d.obligatorio).length} documentos obligatorios
              </p>
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {actual && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Documentos requeridos para {actual.codigo}</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {actual.documentosRequeridos.map((d) => (
              <li key={d.id} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', d.obligatorio ? 'text-brand-600' : 'text-slate-300')} />
                <span>
                  {d.nombre}
                  {!d.obligatorio && <span className="text-xs text-slate-400"> (opcional)</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
