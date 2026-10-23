import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TabItemBase {
  label: string;
  icon?: LucideIcon;
  /** Contador o insignia junto a la etiqueta */
  extra?: ReactNode;
}

const tabClases = (activo: boolean) =>
  cn(
    'inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 pt-1 text-sm font-medium transition-colors',
    activo ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
  );

function TabContenido({ label, icon: Icon, extra }: TabItemBase) {
  return (
    <>
      {Icon && <Icon className="h-4 w-4" />}
      {label}
      {extra}
    </>
  );
}

/** Pestañas basadas en rutas (cada pestaña es una URL). */
export function TabsNav({ items }: { items: Array<TabItemBase & { to: string; end?: boolean }> }) {
  return (
    <nav className="scrollbar-thin -mb-px flex gap-6 overflow-x-auto border-b border-slate-200" aria-label="Pestañas">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => tabClases(isActive)}>
          <TabContenido {...it} />
        </NavLink>
      ))}
    </nav>
  );
}

/** Pestañas controladas por estado local. */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: Array<TabItemBase & { value: T }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="tablist" className="scrollbar-thin -mb-px flex gap-6 overflow-x-auto border-b border-slate-200">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          type="button"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={tabClases(value === it.value)}
        >
          <TabContenido {...it} />
        </button>
      ))}
    </div>
  );
}

/** Selector segmentado (tipo "pill"). */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: Array<{ value: T; label: string; icon?: LucideIcon }>;
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex rounded-lg bg-slate-100 p-1', className)}>
      {items.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </button>
      ))}
    </div>
  );
}
