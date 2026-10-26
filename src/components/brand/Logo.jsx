import { useId } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn';

export function LogoMark({ className }) {
  // Unique per instance: a shared gradient id resolves to the first copy in the document,
  // which renders nothing when that copy sits inside a display:none subtree.
  const gradientId = `kc-mark-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 64 64" className={cn('size-8', className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0b1120" />
      <rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
      <path d="M18 16v32M18 33l14-17M23 28l11 20" fill="none" stroke={`url(#${gradientId})`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 22a12 12 0 1 0 0 20" fill="none" stroke={`url(#${gradientId})`} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ to = '/', className, compact = false }) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="Knowledge Copilot home">
      <LogoMark className="transition-transform duration-300 group-hover:rotate-[-6deg]" />
      {compact ? null : (
        <span className="text-[15px] font-semibold tracking-tight text-fg">
          Knowledge <span className="text-gradient">Copilot</span>
        </span>
      )}
    </Link>
  );
}
