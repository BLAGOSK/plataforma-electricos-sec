import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StepperProps {
  pasos: Array<{ titulo: string; descripcion?: string }>;
  /** Índice (base 0) del paso actual */
  actual: number;
}

export function Stepper({ pasos, actual }: StepperProps) {
  return (
    <ol className="flex w-full items-start">
      {pasos.map((p, i) => {
        const completado = i < actual;
        const activo = i === actual;
        return (
          <li key={p.titulo} className={cn('relative flex flex-1 flex-col items-center text-center')}>
            {i > 0 && (
              <span
                className={cn('absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2', i <= actual ? 'bg-brand-600' : 'bg-slate-200')}
                aria-hidden
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold',
                completado && 'border-brand-600 bg-brand-600 text-white',
                activo && 'border-brand-600 bg-white text-brand-700',
                !completado && !activo && 'border-slate-300 bg-white text-slate-400',
              )}
            >
              {completado ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('mt-2 text-xs font-medium sm:text-sm', activo || completado ? 'text-slate-900' : 'text-slate-400')}>
              {p.titulo}
            </span>
            {p.descripcion && <span className="hidden text-xs text-slate-500 sm:block">{p.descripcion}</span>}
          </li>
        );
      })}
    </ol>
  );
}
