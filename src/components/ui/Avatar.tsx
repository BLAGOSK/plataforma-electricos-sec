import { cn } from '@/utils/cn';
import { iniciales } from '@/utils/format';

const paleta = [
  'bg-brand-100 text-brand-800',
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-violet-100 text-violet-800',
  'bg-rose-100 text-rose-800',
  'bg-cyan-100 text-cyan-800',
];

const tamanos = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' };

interface AvatarProps {
  nombre: string;
  size?: keyof typeof tamanos;
  enLinea?: boolean;
  className?: string;
}

export function Avatar({ nombre, size = 'md', enLinea, className }: AvatarProps) {
  const hash = [...nombre].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn('inline-flex items-center justify-center rounded-full font-semibold', tamanos[size], paleta[hash % paleta.length])}
        aria-hidden
      >
        {iniciales(nombre)}
      </span>
      {enLinea !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white',
            enLinea ? 'bg-emerald-500' : 'bg-slate-300',
          )}
        />
      )}
    </span>
  );
}
