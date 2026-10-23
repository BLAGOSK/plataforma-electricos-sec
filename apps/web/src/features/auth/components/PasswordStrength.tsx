import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { evaluarPassword } from '../utils/password';

const colores = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-600'];
const coloresTexto = ['', 'text-red-600', 'text-amber-600', 'text-lime-700', 'text-emerald-700'];

export function PasswordStrength({ password }: { password: string }) {
  const { puntaje, etiqueta, requisitos } = evaluarPassword(password);
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={cn('h-1.5 flex-1 rounded-full transition-colors', n <= puntaje ? colores[puntaje] : 'bg-slate-200')} />
          ))}
        </div>
        {etiqueta && <span className={cn('w-20 text-right text-xs font-semibold', coloresTexto[puntaje])}>{etiqueta}</span>}
      </div>
      <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {requisitos.map((r) => (
          <li key={r.texto} className={cn('flex items-center gap-1.5 text-xs', r.cumple ? 'text-emerald-700' : 'text-slate-500')}>
            {r.cumple ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-slate-400" />}
            {r.texto}
          </li>
        ))}
      </ul>
    </div>
  );
}
