import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BrainCircuit, Database, FileSearch, Layers, Server, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';

const pipeline = [
  { icon: FileSearch, title: 'Ingest', text: 'PDFBox and Apache POI extract text from PDF and DOCX files. Text is split into ~800-character passages with overlap so context isn’t cut mid-thought.' },
  { icon: BrainCircuit, title: 'Embed', text: 'Each passage is embedded with Gemini (gemini-embedding-001, 3072 dimensions). Questions use a query-optimised embedding.' },
  { icon: Database, title: 'Retrieve', text: 'PostgreSQL with pgvector finds the closest passages using an HNSW index, then results are balanced across documents.' },
  { icon: Layers, title: 'Generate', text: 'Gemini 2.5 Flash answers using only the retrieved passages and recent conversation, streaming tokens back over server-sent events.' },
];

const facts = [
  { icon: Server, label: 'Backend', value: 'Spring Boot 3 · Spring AI · Java 21' },
  { icon: Database, label: 'Storage', value: 'PostgreSQL 16 + pgvector, Flyway migrations' },
  { icon: ShieldCheck, label: 'Security', value: 'JWT auth, role-based access, rate limiting' },
  { icon: Layers, label: 'Frontend', value: 'React 19 · Vite · Tailwind CSS' },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About · Knowledge Copilot';
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-semibold text-primary">About</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-fg">An AI assistant that reads your documents first</h1>
        <p className="mt-5 text-lg leading-relaxed text-fg-muted">
          Knowledge Copilot is a retrieval-augmented generation (RAG) app. Instead of answering from general web knowledge, it looks up the most relevant passages in the
          documents your team uploads and asks the model to answer using only those, then shows you exactly which sources it used.
        </p>
      </motion.header>

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-fg">How an answer is made</h2>
        <ol className="mt-6 space-y-4">
          {pipeline.map(({ icon: Icon, title, text }, index) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="flex gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-fg">
                  <span className="mr-2 text-fg-subtle">{index + 1}.</span>
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-fg">Under the hood</h2>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-bg-subtle/60 p-5">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
                <Icon className="size-4" />
                {label}
              </dt>
              <dd className="mt-2 text-[15px] font-medium text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-14 flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-fg-muted">Want to try it, or talk about building something similar?</p>
        <div className="flex gap-2">
          <Button to="/contact" variant="secondary">
            Contact
          </Button>
          <Button to="/register">
            Try it <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
