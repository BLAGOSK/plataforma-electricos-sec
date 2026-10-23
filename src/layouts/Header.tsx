import { Menu } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificacionesMenu } from './NotificacionesMenu';
import { UserMenu } from './UserMenu';

export function Header({ onAbrirMenu }: { onAbrirMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onAbrirMenu}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificacionesMenu />
        <UserMenu />
      </div>
    </header>
  );
}
