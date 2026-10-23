import { useCallback, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { useClickOutside } from '@/hooks/useClickOutside';

interface DropdownProps {
  trigger: (props: { abierto: boolean; alternar: () => void }) => ReactNode;
  children: (cerrar: () => void) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cerrar = useCallback(() => setAbierto(false), []);
  useClickOutside(ref, cerrar, abierto);

  return (
    <div ref={ref} className="relative">
      {trigger({ abierto, alternar: () => setAbierto((v) => !v) })}
      {abierto && (
        <div
          className={cn(
            'absolute z-40 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            className ?? 'w-56',
          )}
        >
          {children(cerrar)}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  icon?: ComponentType<{ className?: string }>;
  onClick?: () => void;
  peligro?: boolean;
  children: ReactNode;
}

export function DropdownItem({ icon: Icon, onClick, peligro, children }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
        peligro ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50',
      )}
    >
      {Icon && <Icon className="h-4 w-4 opacity-70" />}
      {children}
    </button>
  );
}
