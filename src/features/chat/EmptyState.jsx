import { motion } from 'motion/react';
import { FileUp, Library, Sparkles } from 'lucide-react';
import { LogoMark } from '../../components/brand/Logo';
import Button from '../../components/ui/Button';
import { plural } from '../../lib/format';

function suggestionsFor(documents) {
  const names = documents.slice(0, 2).map((d) => d.name.replace(/\.(pdf|docx|txt)$/i, ''));
  return [
    names[0] ? `Summarize the key points of "${names[0]}"` : 'Summarize the key points of my documents',
    'What topics do these documents cover?',
    names[1] ? `What does "${names[1]}" say about deadlines or dates?` : 'List any deadlines or important dates mentioned',
    'Explain the most important policy in simple terms',
  ];
}

export default function EmptyState({ documents, documentsLoaded, isAdmin, username, onPick }) {
  const hasDocuments = documents.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pt-[12vh] text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14 }}>
        <LogoMark className="size-14 drop-shadow-[0_12px_30px_rgb(37_99_235/0.45)]" />
      </motion.div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        {username ? `Hi ${username}, what would you like to know?` : 'What would you like to know?'}
      </h1>
      <p className="mt-2 text-[15px] text-fg-muted">
        {documentsLoaded
          ? hasDocuments
            ? `Answers come from ${plural(documents.length, 'indexed document')}, with sources you can check.`
            : 'The knowledge base is empty right now.'
          : ' '}
      </p>

      {documentsLoaded && !hasDocuments ? (
        <div className="mt-8 w-full rounded-2xl border border-dashed border-border-strong bg-bg-subtle/60 p-6">
          <Library className="mx-auto size-8 text-fg-subtle" />
          <p className="mt-3 text-sm text-fg-muted">
            {isAdmin
              ? 'Upload a PDF, Word or text file to give the assistant something to work with.'
              : 'An administrator needs to upload documents before the assistant can answer questions.'}
          </p>
          {isAdmin ? (
            <Button to="/documents" className="mt-4">
              <FileUp className="size-4" /> Upload documents
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
          {suggestionsFor(documents).map((suggestion, index) => (
            <motion.button
              key={suggestion}
              type="button"
              onClick={() => onPick(suggestion)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index + 0.1 }}
              className="group flex items-start gap-2.5 rounded-xl border border-border bg-surface p-3.5 text-left text-sm text-fg-muted shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-fg hover:shadow-soft"
            >
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary/70 transition-colors group-hover:text-primary" />
              {suggestion}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
