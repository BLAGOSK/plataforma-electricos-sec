import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  titulo: ReactNode;
  descripcion?: ReactNode;
  icon?: LucideIcon;
  acciones?: ReactNode;
  /** Contenido bajo el título (ej. insignias de estado) */
  meta?: ReactNode;
}

export function PageHeader({ titulo, descripcion, icon: Icon, acciones, meta }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="hidden rounded-xl bg-brand-50 p-2.5 text-brand-700 sm:block">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{titulo}</h1>
          {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}
