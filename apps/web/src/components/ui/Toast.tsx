import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

type TipoToast = 'exito' | 'error' | 'info' | 'alerta';

interface Toast {
  id: number;
  tipo: TipoToast;
  titulo: string;
  mensaje?: string;
}

interface ToastContextValue {
  mostrar: (t: Omit<Toast, 'id'>) => void;
  exito: (titulo: string, mensaje?: string) => void;
  error: (titulo: string, mensaje?: string) => void;
  info: (titulo: string, mensaje?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const estilos: Record<TipoToast, { icon: typeof Info; clase: string }> = {
  exito: { icon: CheckCircle2, clase: 'text-emerald-600' },
  error: { icon: XCircle, clase: 'text-red-600' },
  info: { icon: Info, clase: 'text-brand-600' },
  alerta: { icon: TriangleAlert, clase: 'text-amber-600' },
};

let contador = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const quitar = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  const mostrar = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = ++contador;
      setToasts((ts) => [...ts, { ...t, id }]);
      setTimeout(() => quitar(id), 4500);
    },
    [quitar],
  );

  const value: ToastContextValue = {
    mostrar,
    exito: (titulo, mensaje) => mostrar({ tipo: 'exito', titulo, mensaje }),
    error: (titulo, mensaje) => mostrar({ tipo: 'error', titulo, mensaje }),
    info: (titulo, mensaje) => mostrar({ tipo: 'info', titulo, mensaje }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
        {toasts.map((t) => {
          const { icon: Icon, clase } = estilos[t.tipo];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', clase)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{t.titulo}</p>
                {t.mensaje && <p className="mt-0.5 text-sm text-slate-600">{t.mensaje}</p>}
              </div>
              <button onClick={() => quitar(t.id)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
