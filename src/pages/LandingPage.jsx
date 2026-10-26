import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowUp,
  Database,
  FileStack,
  FileText,
  Lock,
  MessagesSquare,
  Quote,
  ScanSearch,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/brand/Logo';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const DEMO_QUESTION = 'How many vacation days do new employees get?';
const DEMO_ANSWER =
  'New full-time employees receive **20 paid vacation days** per year, prorated in their first year. Up to 5 unused days can be carried into the first quarter of the next year.';

const features = [
  { icon: Quote, title: 'Answers with citations', text: 'Every answer lists the documents and passages it came from, so you can check it in seconds.' },
  { icon: Zap, title: 'Streams in real time', text: 'Responses appear word by word as Gemini writes them. No staring at a spinner.' },
  { icon: ScanSearch, title: 'Semantic search', text: 'Finds passages by meaning rather than keywords, using pgvector similarity search over Gemini embeddings.' },
  { icon: FileStack, title: 'PDF, Word and text', text: 'Drop in handbooks, policies or specs. They are split into passages and indexed automatically.' },
  { icon: MessagesSquare, title: 'Remembers the thread', text: 'Ask follow-ups naturally. Conversations are saved so you can pick up where you left off.' },
  { icon: Lock, title: 'Private by default', text: 'JWT sign-in, admin-only uploads, and every conversation is visible only to its owner.' },
];

const steps = [
  { icon: Upload, title: 'Upload', text: 'An admin adds PDFs, DOCX or TXT files to the knowledge base.' },
  { icon: Database, title: 'Index', text: 'Text is split into overlapping passages, embedded, and stored in Postgres with pgvector.' },
  { icon: Sparkles, title: 'Ask', text: 'Your question retrieves the most relevant passages, and Gemini answers using only those.' },
];

const stack = ['Spring Boot 3', 'Spring AI', 'Google Gemini', 'PostgreSQL + pgvector', 'React 19', 'Tailwind CSS'];

function renderBold(text) {
  // While the demo is typing, close a half-written **bold** run so no raw asterisks show.
  if ((text.match(/\*\*/g) || []).length % 2 === 1) text += '**';
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') ? (
      <strong key={index} className="font-semibold text-fg">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

function ProductPreview() {
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState(reduceMotion ? DEMO_ANSWER.length : 0);
  const done = typed >= DEMO_ANSWER.length;

  useEffect(() => {
    if (reduceMotion || done) return undefined;
    const timer = setTimeout(() => setTyped((count) => Math.min(DEMO_ANSWER.length, count + 3)), typed === 0 ? 1100 : 22);
    return () => clearTimeout(timer);
  }, [typed, done, reduceMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative mx-auto w-full max-w-3xl"
    >
      <div className="absolute -inset-x-10 -inset-y-8 -z-10 rounded-[3rem] bg-brand opacity-20 blur-3xl dark:opacity-25" />
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lifted">
        <div className="flex items-center gap-2 border-b border-border bg-bg-subtle/70 px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 truncate text-xs font-medium text-fg-subtle">Knowledge Copilot · HR Handbook</span>
        </div>
        <div className="space-y-5 p-5 text-left sm:p-7">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-fg sm:text-[15px]">{DEMO_QUESTION}</div>
          </div>
          <div className="flex gap-3">
            <LogoMark className="size-7 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="min-h-[4.5rem] text-sm leading-relaxed text-fg-muted sm:text-[15px]">
                {typed === 0 ? (
                  <span className="inline-flex items-center gap-2 text-fg-subtle">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" /> Searching 12 documents…
                  </span>
                ) : (
                  <>
                    {renderBold(DEMO_ANSWER.slice(0, typed))}
                    {!done ? <span className="ml-0.5 inline-block h-4 w-[7px] translate-y-[3px] animate-blink rounded-sm bg-primary" /> : null}
                  </>
                )}
              </p>
              <motion.div
                initial={false}
                animate={{ opacity: done ? 1 : 0, y: done ? 0 : 6 }}
                transition={{ duration: 0.3 }}
                className="mt-3 flex flex-wrap items-center gap-1.5"
              >
                <span className="text-xs font-medium text-fg-subtle">Sources</span>
                {['employee-handbook.pdf', 'leave-policy-2026.docx'].map((name, index) => (
                  <span key={name} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-fg-muted">
                    <span className="flex size-4 items-center justify-center rounded bg-primary-soft text-[10px] font-semibold text-primary">{index + 1}</span>
                    <FileText className="size-3" />
                    {name}
                  </span>
                ))}
                <Badge tone="success" className="ml-1">
                  High match · 82%
                </Badge>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="border-t border-border p-3 sm:p-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-fg-subtle">
            Ask a follow-up…
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-white">
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45 },
};

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'Knowledge Copilot · Answers from your documents';
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-12rem] -z-10 h-[32rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.18),transparent)] dark:bg-[radial-gradient(closest-side,rgb(59_130_246/0.25),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 text-center sm:px-6 sm:pt-20 md:pb-28">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-medium text-fg-muted shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Retrieval-augmented generation with Gemini
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl md:text-6xl"
          >
            Answers from your documents, <span className="text-gradient">with sources you can check.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg"
          >
            Upload handbooks, policies and specs. Ask questions in plain language and get a straight answer, grounded in your files.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button to={isAuthenticated ? '/chat' : '/register'} variant="brand" size="lg" className="w-full sm:w-auto">
              {isAuthenticated ? 'Open your workspace' : 'Get started free'}
              <ArrowRight className="size-4" />
            </Button>
            <Button to="/#how-it-works" variant="secondary" size="lg" className="w-full sm:w-auto">
              See how it works
            </Button>
          </motion.div>

          <div className="mt-16">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t border-border bg-bg-subtle/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Why Knowledge Copilot</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Built for answers you can trust</h2>
            <p className="mt-4 text-fg-muted">A focused assistant that only answers from what you give it, and says so when it can't.</p>
          </motion.div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }, index) => (
              <motion.article
                key={title}
                {...fadeUp}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-fg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">From files to answers in three steps</h2>
          </motion.div>
          <ol className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
            <div className="absolute left-[16.6%] right-[16.6%] top-7 hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent md:block" aria-hidden="true" />
            {steps.map(({ icon: Icon, title, text }, index) => (
              <motion.li key={title} {...fadeUp} transition={{ duration: 0.45, delay: index * 0.1 }} className="relative text-center">
                <span className="relative mx-auto flex size-14 items-center justify-center rounded-2xl border border-border bg-surface shadow-soft">
                  <Icon className="size-6 text-primary" />
                  <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{index + 1}</span>
                </span>
                <h3 className="mt-5 text-lg font-semibold text-fg">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-fg-muted">{text}</p>
              </motion.li>
            ))}
          </ol>

          <motion.div {...fadeUp} className="mt-16 flex flex-wrap items-center justify-center gap-2">
            {stack.map((item) => (
              <span key={item} className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-fg-muted">
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <motion.div
          {...fadeUp}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#0b1120] px-6 py-14 text-center text-white ring-1 ring-white/10 sm:px-12"
        >
          <div className="absolute inset-0 opacity-80 [background:radial-gradient(500px_circle_at_20%_0%,rgb(37_99_235/0.5),transparent_60%),radial-gradient(400px_circle_at_80%_100%,rgb(34_211_238/0.35),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your documents already have the answers.</h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-300">Create an account and start asking in under a minute.</p>
            <div className="mt-8 flex justify-center">
              <Button to={isAuthenticated ? '/chat' : '/register'} size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                {isAuthenticated ? 'Open your workspace' : 'Create a free account'}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
