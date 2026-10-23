import { cn } from '@/utils/cn';

interface ProgresoDocumentalProps {
  cargados: number;
  requeridos: number;
  compacto?: boolean;
  className?: string;
}

export function ProgresoDocumental({ cargados, requeridos, compacto, className }: ProgresoDocumentalProps) {
  const pct = requeridos === 0 ? 100 : Math.round((cargados / requeridos) * 100);
  const color = pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-brand-500' : 'bg-amber-500';
  return (
    <div className={cn('min-w-[7rem]', className)}>
      {!compacto && (
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-slate-500">Documentos requeridos</span>
          <span className="font-medium text-slate-700">
            {cargados}/{requeridos}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
        </div>
        {compacto && (
          <span className="w-9 text-right text-xs tabular-nums text-slate-600">
            {cargados}/{requeridos}
          </span>
        )}
      </div>
    </div>
  );
}
