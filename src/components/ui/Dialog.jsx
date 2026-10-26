import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

// Thin wrapper over the native <dialog>: focus trapping, Escape and the backdrop come for free.
export default function Dialog({ open, onClose, title, description, children, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-0 text-fg shadow-lifted backdrop:bg-slate-950/50 backdrop:backdrop-blur-[2px] open:animate-in',
        className,
      )}
    >
      {open ? (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-1 rounded-lg p-1.5 text-fg-subtle hover:bg-bg-subtle hover:text-fg"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
