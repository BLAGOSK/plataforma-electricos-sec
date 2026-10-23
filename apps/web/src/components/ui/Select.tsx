import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import type { Opcion } from '@/types/common';
import { Field } from './Field';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  opciones?: Opcion[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, opciones, placeholder, containerClassName, className, id, required, children, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <Field id={selectId} label={label} error={error} hint={hint} required={required} className={containerClassName}>
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={!!error}
        className={cn('form-control pr-8', error && 'form-control-error', className)}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {opciones?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
    </Field>
  );
});
