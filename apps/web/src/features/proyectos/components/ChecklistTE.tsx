import { CheckCircle2, Circle, Upload } from 'lucide-react';
import type { Documento } from '@/types/documento';
import type { DocumentoRequerido, TipoTE } from '@/types/tipoTE';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui';
import { ReferencialBadge } from '@/components/ReferencialAviso';
import { ProgresoDocumental } from './ProgresoDocumental';

interface Props {
  tipoTE: TipoTE;
  documentos: Documento[];
  onCargar?: (req: DocumentoRequerido) => void;
  compacto?: boolean;
}

/** Checklist de documentos requeridos según el tipo TE del proyecto. */
export function ChecklistTE({ tipoTE, documentos, onCargar, compacto }: Props) {
  const obligatorios = tipoTE.documentosRequeridos.filter((r) => r.obligatorio);
  const cumple = (r: DocumentoRequerido) => documentos.find((d) => d.requisitoId === r.id);
  const cargados = obligatorios.filter(cumple).length;

  return (
    <div>
      {!compacto && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">Checklist {tipoTE.codigo}</p>
            {tipoTE.referencial && <ReferencialBadge />}
          </div>
          <ProgresoDocumental cargados={cargados} requeridos={obligatorios.length} className="w-56" />
        </div>
      )}
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {tipoTE.documentosRequeridos.map((r) => {
          const doc = cumple(r);
          return (
            <li key={r.id} className="flex items-center gap-3 px-3 py-2.5">
              {doc ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <Circle className="h-5 w-5 shrink-0 text-slate-300" />}
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', doc ? 'text-slate-700' : 'font-medium text-slate-900')}>
                  {r.nombre}
                  {!r.obligatorio && <span className="ml-1.5 text-xs font-normal text-slate-400">(opcional)</span>}
                </p>
                {doc ? (
                  <p className="truncate text-xs text-emerald-700">
                    {doc.nombre} · Rev. {doc.revisiones.at(-1)?.numero}
                  </p>
                ) : (
                  r.descripcion && !compacto && <p className="text-xs text-slate-500">{r.descripcion}</p>
                )}
              </div>
              {!doc && onCargar ? (
                <button
                  onClick={() => onCargar(r)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                >
                  <Upload className="h-3.5 w-3.5" /> Cargar
                </button>
              ) : (
                !doc && r.obligatorio && <Badge color="yellow">Pendiente</Badge>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
