import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/cn';

export const inputClasses =
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-[15px] text-fg placeholder:text-fg-subtle shadow-sm transition-[border-color,box-shadow] outline-none focus:border-primary focus:ring-4 focus:ring-ring aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/20 disabled:opacity-60';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(inputClasses, className)} {...props} />;
});

// Label + input + hint/error, wired up for screen readers.
export const Field = forwardRef(function Field({ label, error, hint, type = 'text', className, ...props }, ref) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={isPassword ? 'pr-11' : undefined}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-fg-subtle hover:text-fg"
            aria-label={reveal ? 'Hide password' : 'Show password'}
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
