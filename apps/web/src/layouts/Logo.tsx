import { Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Logo({ claro, className }: { claro?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 shadow-sm">
        <Zap className="h-5 w-5 fill-accent-400 text-accent-400" />
      </div>
      <div className="leading-tight">
        <p className={cn('text-sm font-bold', claro ? 'text-white' : 'text-slate-900')}>Eléctricos SEC</p>
        <p className={cn('text-[11px]', claro ? 'text-brand-200' : 'text-slate-500')}>Plataforma de instaladores</p>
      </div>
    </div>
  );
}
