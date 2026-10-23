import { Play } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDuracion } from '../constantes';

const degradados = [
  'from-brand-800 to-brand-500',
  'from-emerald-800 to-emerald-500',
  'from-violet-800 to-violet-500',
  'from-slate-800 to-slate-500',
  'from-amber-700 to-amber-400',
  'from-cyan-800 to-cyan-500',
];

/** Miniatura generada (sin imágenes externas) con título y duración. */
export function VideoThumb({ id, titulo, duracionSeg, className }: { id: string; titulo: string; duracionSeg: number; className?: string }) {
  const hash = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <div className={cn('relative aspect-video overflow-hidden bg-gradient-to-br', degradados[hash % degradados.length], className)}>
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />
      <p className="absolute inset-x-4 top-4 line-clamp-2 text-sm font-semibold text-white/90">{titulo}</p>
      <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
        <Play className="ml-0.5 h-5 w-5 fill-slate-900 text-slate-900" />
      </span>
      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">{formatDuracion(duracionSeg)}</span>
    </div>
  );
}
