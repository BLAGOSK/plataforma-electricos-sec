import type { ReactNode } from 'react';
import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

type TipoAlert = 'info' | 'exito' | 'alerta' | 'error';

const estilos: Record<TipoAlert, { icon: typeof Info; clase: string }> = {
  info: { icon: Info, clase: 'border-brand-200 bg-brand-50 text-brand-900' },
  exito: { icon: CheckCircle2, clase: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  alerta: { icon: TriangleAlert, clase: 'border-amber-200 bg-amber-50 text-amber-900' },
  error: { icon: XCircle, clase: 'border-red-200 bg-red-50 text-red-900' },
};

interface AlertProps {
  tipo?: TipoAlert;
  titulo?: ReactNode;
  children?: ReactNode;
  accion?: ReactNode;
  className?: string;
}

export function Alert({ tipo = 'info', titulo, children, accion, className }: AlertProps) {
  const { icon: Icon, clase } = estilos[tipo];
  return (
    <div className={cn('flex gap-3 rounded-lg border p-4 text-sm', clase, className)} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        {children && <div className={cn(titulo && 'mt-1', 'opacity-90')}>{children}</div>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}
