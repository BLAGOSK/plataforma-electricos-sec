import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-600', className)} />;
}

/** Indicador de carga para una sección o página completa. */
export function Cargando({ texto = 'Cargando…', className }: { texto?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 py-16 text-sm text-slate-500', className)}>
      <Spinner />
      {texto}
    </div>
  );
}
