import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Field } from './Field';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  icon?: LucideIcon;
  /** Texto fijo a la derecha (ej. unidad "kW") */
  sufijo?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon: Icon, sufijo, containerClassName, className, id, type = 'text', required, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [verPassword, setVerPassword] = useState(false);
  const esPassword = type === 'password';

  return (
    <Field id={inputId} label={label} error={error} hint={hint} required={required} className={containerClassName}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        <input
          ref={ref}
          id={inputId}
          type={esPassword && verPassword ? 'text' : type}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'form-control',
            error && 'form-control-error',
            Icon && 'pl-9',
            (esPassword || sufijo) && 'pr-12',
            className,
          )}
          {...rest}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {verPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {sufijo && !esPassword && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
            {sufijo}
          </span>
        )}
      </div>
    </Field>
  );
});
