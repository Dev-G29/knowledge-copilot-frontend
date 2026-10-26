import { Link } from 'react-router';
import { motion } from 'motion/react';
import { FileSearch, Quote, ShieldCheck, Zap } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import ThemeToggle from '../../components/ui/ThemeToggle';

const points = [
  { icon: FileSearch, text: 'Answers grounded in your own PDFs, Word files and notes' },
  { icon: Quote, text: 'Every answer cites the passages it used' },
  { icon: Zap, text: 'Responses stream in as they are written' },
  { icon: ShieldCheck, text: 'Private workspace with role-based access' },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b1120] p-12 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-70 [background:radial-gradient(600px_circle_at_15%_10%,rgb(37_99_235/0.45),transparent_60%),radial-gradient(500px_circle_at_85%_90%,rgb(34_211_238/0.3),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5 text-[15px] font-semibold">
            <img src="/favicon.svg" alt="" className="size-8" />
            Knowledge Copilot
          </Link>
        </div>
        <div className="relative mt-auto max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold leading-tight tracking-tight"
          >
            Stop searching through folders. <span className="text-gradient">Just ask.</span>
          </motion.h2>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }, index) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.07 }}
                className="flex items-center gap-3 text-[15px] text-slate-300"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-4 text-cyan-300" />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="relative mt-16 text-sm text-slate-500">Spring Boot · Spring AI · Gemini · pgvector</p>
      </aside>

      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
            <p className="mt-1.5 text-[15px] text-fg-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-8 text-center text-sm text-fg-muted">{footer}</div> : null}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
