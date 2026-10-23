import { useNavigate } from 'react-router-dom';
import { ChevronDown, KeyRound, LogOut, RotateCcw, Settings, User } from 'lucide-react';
import { useAuth, useUsuario } from '@/features/auth/context/AuthContext';
import { restablecerDb } from '@/mocks/db';
import { Avatar, Badge, Dropdown, DropdownItem } from '@/components/ui';

export function UserMenu() {
  const usuario = useUsuario();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const restablecer = () => {
    if (!confirm('¿Restablecer todos los datos de la demo a su estado inicial? Se cerrará la sesión.')) return;
    restablecerDb();
    logout();
    navigate('/login');
  };

  return (
    <Dropdown
      className="w-64"
      trigger={({ alternar }) => (
        <button onClick={alternar} className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100" aria-label="Menú de usuario">
          <Avatar nombre={usuario.nombre} size="sm" />
          <span className="hidden text-left leading-tight md:block">
            <span className="block max-w-[10rem] truncate text-sm font-medium text-slate-800">{usuario.nombre}</span>
            <span className="block text-[11px] text-slate-500">{usuario.rol === 'admin' ? 'Administrador' : 'Instalador eléctrico'}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
        </button>
      )}
    >
      {(cerrar) => {
        const ir = (to: string) => {
          cerrar();
          navigate(to);
        };
        return (
          <div className="py-1">
            <div className="border-b border-slate-100 px-3 pb-3 pt-2">
              <p className="truncate text-sm font-semibold text-slate-900">{usuario.nombre}</p>
              <p className="truncate text-xs text-slate-500">{usuario.email}</p>
              <div className="mt-2 flex gap-1.5">
                <Badge color={usuario.rol === 'admin' ? 'purple' : 'brand'}>
                  {usuario.rol === 'admin' ? 'Administrador' : 'Eléctrico'}
                </Badge>
                {usuario.licencia && <Badge>Clase {usuario.licencia.clase}</Badge>}
              </div>
            </div>
            <div className="py-1">
              <DropdownItem icon={User} onClick={() => ir('/configuracion/perfil')}>Mi perfil</DropdownItem>
              <DropdownItem icon={KeyRound} onClick={() => ir('/configuracion/password')}>Cambiar contraseña</DropdownItem>
              <DropdownItem icon={Settings} onClick={() => ir('/configuracion/notificaciones')}>Notificaciones</DropdownItem>
            </div>
            <div className="border-t border-slate-100 py-1">
              <DropdownItem icon={RotateCcw} onClick={restablecer}>Restablecer datos demo</DropdownItem>
              <DropdownItem
                icon={LogOut}
                peligro
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Cerrar sesión
              </DropdownItem>
            </div>
          </div>
        );
      }}
    </Dropdown>
  );
}
