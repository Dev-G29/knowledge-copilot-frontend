import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, FileText } from 'lucide-react';
import { cn } from '../../lib/cn';

// Citation chips under an answer; each expands to show the passage that was used.
export default function Sources({ sources }) {
  const [openIndex, setOpenIndex] = useState(null);
  if (!sources?.length) return null;
  const open = openIndex !== null ? sources[openIndex] : null;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 text-xs font-medium text-fg-subtle">Sources</span>
        {sources.map((source, index) => (
          <button
            key={`${source.document}-${index}`}
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
            className={cn(
              'inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium transition-colors',
              openIndex === index
                ? 'border-primary/40 bg-primary-soft text-primary'
                : 'border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg',
            )}
          >
            <span className="flex size-4 items-center justify-center rounded bg-primary-soft text-[10px] font-semibold text-primary">{index + 1}</span>
            <span className="max-w-48 truncate">{source.document}</span>
            <ChevronDown className={cn('size-3 transition-transform', openIndex === index && 'rotate-180')} />
          </button>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key={openIndex}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <figure className="mt-2 rounded-xl border border-border bg-bg-subtle p-3.5">
              <figcaption className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-fg">
                <FileText className="size-3.5 text-primary" />
                {open.document}
              </figcaption>
              <blockquote className="border-l-2 border-primary/40 pl-3 text-[13px] leading-relaxed text-fg-muted">
                {open.snippet || 'No excerpt available.'}
              </blockquote>
            </figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
