import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StarRatingProps {
  value: number;
  /** Si se entrega, las estrellas son seleccionables. */
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  mostrarValor?: boolean;
  totalResenas?: number;
}

const tam = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-7 w-7' };

export function StarRating({ value, onChange, size = 'md', mostrarValor, totalResenas }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const mostrado = hover || value;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex" onMouseLeave={() => setHover(0)} role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} de 5 estrellas`}>
        {[1, 2, 3, 4, 5].map((n) => {
          const relleno = Math.max(0, Math.min(1, mostrado - (n - 1)));
          const estrella = (
            <span className={cn('relative inline-block', tam[size])}>
              <Star className={cn('absolute inset-0 text-slate-300', tam[size])} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${relleno * 100}%` }}>
                <Star className={cn('fill-accent-400 text-accent-400', tam[size])} />
              </span>
            </span>
          );
          return onChange ? (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => onChange(n)}
              className="p-0.5"
            >
              {estrella}
            </button>
          ) : (
            <span key={n}>{estrella}</span>
          );
        })}
      </div>
      {mostrarValor && <span className="text-sm font-semibold text-slate-800">{value.toFixed(1)}</span>}
      {totalResenas !== undefined && <span className="text-xs text-slate-500">({totalResenas})</span>}
    </div>
  );
}
