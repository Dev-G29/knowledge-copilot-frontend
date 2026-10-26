import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Composer({ onSend, onStop, streaming, disabled, autoFocus, placeholder = 'Ask anything about your documents…' }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);

  // Grow with content up to ~8 lines.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 220)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus && !streaming) ref.current?.focus();
  }, [autoFocus, streaming]);

  const submit = () => {
    const text = value.trim();
    if (!text || streaming || disabled) return;
    onSend(text);
    setValue('');
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="relative rounded-2xl border border-border bg-surface shadow-soft transition-[border-color,box-shadow] focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-ring"
    >
      <label htmlFor="composer" className="sr-only">
        Message
      </label>
      <textarea
        id="composer"
        ref={ref}
        rows={1}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="block max-h-[220px] w-full resize-none bg-transparent px-4 pb-12 pt-3.5 text-[15px] leading-relaxed text-fg placeholder:text-fg-subtle outline-none"
      />
      <div className="absolute bottom-2.5 left-4 right-2.5 flex items-center justify-between">
        <span className="hidden text-xs text-fg-subtle sm:block">
          <kbd className="font-sans">Enter</kbd> to send · <kbd className="font-sans">Shift + Enter</kbd> for a new line
        </span>
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="ml-auto flex size-9 items-center justify-center rounded-xl bg-fg text-bg transition-transform hover:scale-105"
            aria-label="Stop generating"
            title="Stop generating"
          >
            <Square className="size-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            className={cn(
              'ml-auto flex size-9 items-center justify-center rounded-xl transition-all',
              value.trim() ? 'bg-brand text-white shadow-md hover:brightness-110' : 'bg-bg-subtle text-fg-subtle',
            )}
            aria-label="Send message"
          >
            <ArrowUp className="size-[18px]" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </form>
  );
}
