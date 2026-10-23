import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Field } from './Field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, containerClassName, className, id, required, rows = 3, ...rest },
  ref,
) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  return (
    <Field id={textareaId} label={label} error={error} hint={hint} required={required} className={containerClassName}>
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        className={cn('form-control resize-y', error && 'form-control-error', className)}
        {...rest}
      />
    </Field>
  );
});
