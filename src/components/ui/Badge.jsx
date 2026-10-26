import { cn } from '../../lib/cn';

const tones = {
  neutral: 'bg-bg-subtle text-fg-muted border-border',
  primary: 'bg-primary-soft text-primary border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
};

export default function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-medium leading-5',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
