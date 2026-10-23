import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  descripcion?: ReactNode;
}

export function Checkbox({ label, descripcion, className, id, ...rest }: CheckboxProps) {
  const autoId = useId();
  const cbId = id ?? autoId;
  return (
    <label htmlFor={cbId} className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input
        id={cbId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-700 accent-brand-700"
        {...rest}
      />
      <span className="text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        {descripcion && <span className="block text-slate-500">{descripcion}</span>}
      </span>
    </label>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  descripcion?: ReactNode;
}

export function Switch({ checked, onChange, label, descripcion }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        {descripcion && <span className="block text-slate-500">{descripcion}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-brand-700' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}
