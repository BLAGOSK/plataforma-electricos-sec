import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth, useUsuario } from '@/features/auth/context/AuthContext';
import { iconosExtension } from '@/features/extensiones/iconos';
import { useAsync } from '@/hooks/useAsync';
import { extensionesService } from '@/services/extensionesService';
import { useVersion } from '@/services/eventos';
import { cn } from '@/utils/cn';
import { Logo } from './Logo';
import { navAdmin, navConfiguracion, navExtensiones, navPrincipal, type ItemNav } from './navegacion';

function Enlace({ item, sub, onNavegar }: { item: ItemNav; sub?: boolean; onNavegar: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavegar}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
          sub ? 'py-1.5 pl-9 pr-3' : 'px-3 py-2',
          isActive
            ? sub
              ? 'text-white'
              : 'bg-white/10 text-white'
            : 'text-brand-100/80 hover:bg-white/5 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('shrink-0', sub ? 'h-4 w-4' : 'h-5 w-5', isActive ? 'text-accent-400' : 'opacity-80')} />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function Grupo({ item, onNavegar }: { item: ItemNav; onNavegar: () => void }) {
  const { pathname } = useLocation();
  const abierto = item.hijos && (pathname === item.to || pathname.startsWith(item.to + '/'));
  return (
    <div>
      <Enlace item={item} onNavegar={onNavegar} />
      {abierto && (
        <div className="mt-0.5 space-y-0.5">
          {item.hijos!.map((h) => (
            <Enlace key={h.to + h.label} item={h} sub onNavegar={onNavegar} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  abiertoMovil: boolean;
  onCerrar: () => void;
}

export function Sidebar({ abiertoMovil, onCerrar }: SidebarProps) {
  const usuario = useUsuario();
  const { esAdmin } = useAuth();
  const version = useVersion('extensiones');
  const { data: activas = [] } = useAsync(() => extensionesService.activas(usuario.id), [usuario.id, version]);

  const contenido = (
    <div className="flex h-full flex-col bg-brand-950">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo claro />
        <button onClick={onCerrar} className="rounded-lg p-1.5 text-brand-200 hover:bg-white/10 lg:hidden" aria-label="Cerrar menú">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navegación principal">
        {navPrincipal.map((item) => (
          <Grupo key={item.to} item={item} onNavegar={onCerrar} />
        ))}

        <div>
          <Enlace item={navExtensiones} onNavegar={onCerrar} />
          {activas.length > 0 && (
            <div className="mt-0.5 space-y-0.5">
              {activas.map((e) => (
                <Enlace
                  key={e.id}
                  sub
                  onNavegar={onCerrar}
                  item={{ label: e.nombre, to: `/extensiones/${e.slug}`, icon: iconosExtension[e.slug] }}
                />
              ))}
            </div>
          )}
        </div>

        <Grupo item={navConfiguracion} onNavegar={onCerrar} />

        {esAdmin && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-brand-300/70">Administración</p>
            <div className="space-y-0.5">
              {navAdmin.hijos!.map((h) => (
                <Enlace key={h.to} item={h} onNavegar={onCerrar} />
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-[11px] text-brand-300/70">
        Maqueta Fase 1 · datos simulados
      </div>
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{contenido}</aside>

      {/* Móvil (drawer) */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', !abiertoMovil && 'pointer-events-none')} aria-hidden={!abiertoMovil}>
        <div
          className={cn('absolute inset-0 bg-slate-900/50 transition-opacity', abiertoMovil ? 'opacity-100' : 'opacity-0')}
          onClick={onCerrar}
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-72 max-w-[85vw] transition-transform duration-200',
            abiertoMovil ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {contenido}
        </aside>
      </div>
    </>
  );
}
