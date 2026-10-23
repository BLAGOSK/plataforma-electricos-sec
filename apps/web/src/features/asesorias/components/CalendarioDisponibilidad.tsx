import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DiaDisponible } from '@/types/asesoria';
import { cn } from '@/utils/cn';

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

function clave(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  dias: DiaDisponible[];
  seleccionado: string | null;
  onSeleccionar: (fecha: string) => void;
}

/** Calendario mensual que destaca los días con bloques disponibles. */
export function CalendarioDisponibilidad({ dias, seleccionado, onSeleccionar }: Props) {
  const hoy = new Date();
  const [mes, setMes] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const porFecha = useMemo(() => Object.fromEntries(dias.map((d) => [d.fecha, d.slots.filter((s) => s.disponible).length])), [dias]);

  const celdas = useMemo(() => {
    const primero = new Date(mes);
    const offset = (primero.getDay() + 6) % 7; // lunes = 0
    const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: diasMes }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1))];
  }, [mes]);

  const esMesActual = mes.getMonth() === hoy.getMonth() && mes.getFullYear() === hoy.getFullYear();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
          disabled={esMesActual}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold capitalize text-slate-900">{mes.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</p>
        <button
          type="button"
          onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS.map((d) => (
          <span key={d} className="py-1 text-xs font-medium text-slate-400">
            {d}
          </span>
        ))}
        {celdas.map((d, i) => {
          if (!d) return <span key={`v-${i}`} />;
          const k = clave(d);
          const libres = porFecha[k] ?? 0;
          const activo = seleccionado === k;
          const esHoy = k === clave(hoy);
          return (
            <button
              key={k}
              type="button"
              disabled={libres === 0}
              onClick={() => onSeleccionar(k)}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors',
                activo
                  ? 'bg-brand-700 font-semibold text-white'
                  : libres > 0
                    ? 'bg-brand-50 font-medium text-brand-800 hover:bg-brand-100'
                    : 'text-slate-300',
                esHoy && !activo && 'ring-1 ring-inset ring-brand-400',
              )}
              aria-label={`${d.toLocaleDateString('es-CL')}: ${libres} bloques disponibles`}
            >
              {d.getDate()}
              {libres > 0 && <span className={cn('absolute bottom-1 h-1 w-1 rounded-full', activo ? 'bg-white' : 'bg-emerald-500')} />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-brand-50 ring-1 ring-brand-200" /> Con disponibilidad
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-brand-700" /> Seleccionado
        </span>
      </div>
    </div>
  );
}
