import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

// Minimal accessible dropdown: click or Enter opens, Escape / outside click closes,
// arrow keys move between items.
export default function Menu({ trigger, items, align = 'end', side = 'bottom', className, label }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onMenuKeyDown = (event) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const nodes = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const index = nodes.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % nodes.length : (index - 1 + nodes.length) % nodes.length;
    nodes[next]?.focus();
  };

  return (
    // z-50 while open lifts the whole menu above later siblings, even when the trigger's wrapper
    // creates its own stacking context (e.g. a transform).
    <div ref={rootRef} className={cn('relative', className, open && 'z-50')}>
      {trigger({
        open,
        toggle: () => setOpen((value) => !value),
        props: { 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': id, 'aria-label': label },
      })}
      {open ? (
        <div
          ref={menuRef}
          id={id}
          role="menu"
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-surface-raised p-1 shadow-lifted',
            align === 'end' ? 'right-0' : 'left-0',
            side === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5',
          )}
        >
          {items.map((item) =>
            item.separator ? (
              <div key={item.key} className="my-1 h-px bg-border" role="separator" />
            ) : (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors focus:bg-bg-subtle hover:bg-bg-subtle',
                  item.danger ? 'text-danger' : 'text-fg',
                  item.active && 'font-medium text-primary',
                )}
              >
                {item.icon ? <item.icon className="size-4 opacity-80" /> : null}
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
