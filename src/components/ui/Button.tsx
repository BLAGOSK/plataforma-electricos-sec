import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variantes: Record<ButtonVariant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
};

const tamanos: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
  icon: 'h-9 w-9 justify-center',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra?: string) {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
    variantes[variant],
    tamanos[size],
    extra,
  );
}

interface ContenidoProps {
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  size?: ButtonSize;
  children?: ReactNode;
}

function Contenido({ icon: Icon, iconRight: IconRight, loading, size, children }: ContenidoProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <>
      {loading ? <Loader2 className={cn(iconSize, 'animate-spin')} /> : Icon && <Icon className={iconSize} />}
      {children}
      {IconRight && <IconRight className={iconSize} />}
    </>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<ContenidoProps, 'children'> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconRight, loading, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      <Contenido icon={icon} iconRight={iconRight} loading={loading} size={size}>
        {children}
      </Contenido>
    </button>
  );
});

export interface ButtonLinkProps extends LinkProps, Omit<ContenidoProps, 'children' | 'loading'> {
  variant?: ButtonVariant;
}

export function ButtonLink({ variant = 'primary', size = 'md', icon, iconRight, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      <Contenido icon={icon} iconRight={iconRight} size={size}>
        {children}
      </Contenido>
    </Link>
  );
}
