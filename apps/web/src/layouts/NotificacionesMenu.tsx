import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { useVersion } from '@/services/eventos';
import { notificacionesService } from '@/services/notificacionesService';
import type { Notificacion, TipoNotificacion } from '@/types/notificacion';
import { cn } from '@/utils/cn';
import { tiempoRelativo } from '@/utils/format';
import { Dropdown } from '@/components/ui';

const iconos: Record<TipoNotificacion, { icon: typeof Info; clase: string }> = {
  info: { icon: Info, clase: 'bg-brand-50 text-brand-600' },
  exito: { icon: CheckCircle2, clase: 'bg-emerald-50 text-emerald-600' },
  alerta: { icon: TriangleAlert, clase: 'bg-amber-50 text-amber-600' },
};

export function NotificacionesMenu() {
  const usuario = useUsuario();
  const navigate = useNavigate();
  const version = useVersion('notificaciones');
  const { data: notificaciones = [] } = useAsync(() => notificacionesService.listar(usuario.id), [usuario.id, version]);
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const abrir = (n: Notificacion, cerrar: () => void) => {
    notificacionesService.marcarLeida(n.id);
    cerrar();
    if (n.enlace) navigate(n.enlace);
  };

  return (
    <Dropdown
      className="w-[22rem] max-w-[calc(100vw-2rem)]"
      trigger={({ alternar }) => (
        <button
          onClick={alternar}
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Notificaciones${noLeidas ? ` (${noLeidas} sin leer)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {noLeidas > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {noLeidas}
            </span>
          )}
        </button>
      )}
    >
      {(cerrar) => (
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
            {noLeidas > 0 && (
              <button
                onClick={() => notificacionesService.marcarTodasLeidas(usuario.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No tienes notificaciones.</p>
            ) : (
              notificaciones.map((n) => {
                const { icon: Icon, clase } = iconos[n.tipo];
                return (
                  <button
                    key={n.id}
                    onClick={() => abrir(n, cerrar)}
                    className={cn('flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50', !n.leida && 'bg-brand-50/40')}
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', clase)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-slate-900">{n.titulo}</span>
                        {!n.leida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-600">{n.mensaje}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">{tiempoRelativo(n.fecha)}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </Dropdown>
  );
}
