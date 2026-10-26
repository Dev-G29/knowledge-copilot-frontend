import { forwardRef } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn';
import Spinner from './Spinner';

const variants = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover shadow-sm',
  brand: 'bg-brand text-white shadow-[0_8px_24px_-8px_rgb(37_99_235/0.6)] hover:brightness-110',
  secondary: 'border border-border bg-surface text-fg hover:bg-bg-subtle shadow-sm',
  ghost: 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
  danger: 'bg-danger text-white hover:brightness-110 shadow-sm',
  'danger-ghost': 'text-danger hover:bg-danger-soft',
};

const sizes = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-[15px]',
  icon: 'size-9 rounded-lg',
  'icon-sm': 'size-8 rounded-lg',
};

export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center font-medium whitespace-nowrap transition-[background-color,color,box-shadow,filter,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  );
}

const Button = forwardRef(function Button(
  { variant, size, className, loading = false, disabled, children, to, type = 'button', ...props },
  ref,
) {
  const classes = buttonClasses({ variant, size, className });
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading ? <Spinner className="size-4" /> : null}
      {children}
    </button>
  );
});

export default Button;
