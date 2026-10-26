import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Check, Copy, Square } from 'lucide-react';
import { LogoMark } from '../../components/brand/Logo';
import Badge from '../../components/ui/Badge';
import { cn } from '../../lib/cn';
import { describeConfidence } from '../../lib/format';
import Markdown from './Markdown';
import Sources from './Sources';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-fg-subtle transition-colors hover:bg-bg-subtle hover:text-fg"
      aria-label="Copy answer"
    >
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-2 py-1 text-sm text-fg-subtle" role="status">
      <span className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="size-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
          />
        ))}
      </span>
      Searching your documents…
    </div>
  );
}

export default function MessageBubble({ message }) {
  if (message.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-relaxed text-primary-fg shadow-sm">
          {message.content}
        </div>
      </motion.div>
    );
  }

  const streaming = message.status === 'streaming';
  const confidence = describeConfidence(message.confidence);
  const showMeta = !streaming && message.status !== 'error' && message.content;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <LogoMark className="mt-0.5 size-7 shrink-0" />
      <div className="min-w-0 flex-1">
        {message.status === 'error' ? (
          <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{message.error || 'Something went wrong.'}</span>
          </div>
        ) : streaming && !message.content ? (
          <Thinking />
        ) : (
          <div className={cn(streaming && 'streaming-cursor')}>
            <Markdown>{message.content}</Markdown>
          </div>
        )}

        {message.status === 'stopped' ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-fg-subtle">
            <Square className="size-3 fill-current" /> Stopped
          </p>
        ) : null}

        {!streaming ? <Sources sources={message.sources} /> : null}

        {showMeta ? (
          <div className="mt-2 flex items-center gap-1.5">
            {confidence ? (
              <Badge tone={confidence.tone} title={`Average retrieval similarity ${(message.confidence * 100).toFixed(0)}%`}>
                {confidence.label} · {(message.confidence * 100).toFixed(0)}%
              </Badge>
            ) : null}
            <CopyButton text={message.content} />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
