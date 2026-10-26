import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Database, FileStack, HardDrive, Library, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { documentsApi, getErrorMessage } from '../../lib/api';
import { cn } from '../../lib/cn';
import { fileKind, formatBytes, formatDate, formatRelative, plural } from '../../lib/format';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import UploadZone from './UploadZone';

const kindStyles = {
  PDF: 'bg-red-500/10 text-red-600 dark:text-red-400',
  DOCX: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  TXT: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  FILE: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
};

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-fg-subtle">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-fg">{value}</p>
    </div>
  );
}

export default function DocumentsPage() {
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Knowledge base · Knowledge Copilot';
  }, []);

  const load = useCallback(async () => {
    try {
      setDocuments(await documentsApi.list());
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      toast.error(getErrorMessage(error, 'Could not load documents.'));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    documentsApi
      .list()
      .then((list) => {
        if (cancelled) return;
        setDocuments(list);
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus('error');
        toast.error(getErrorMessage(error, 'Could not load documents.'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? documents.filter((d) => d.name.toLowerCase().includes(needle)) : documents;
  }, [documents, query]);

  const totals = useMemo(
    () => ({
      chunks: documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0),
      bytes: documents.reduce((sum, d) => sum + (d.sizeBytes || 0), 0),
    }),
    [documents],
  );

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await documentsApi.remove(pendingDelete.id);
      setDocuments((list) => list.filter((d) => d.id !== pendingDelete.id));
      toast.success(`${pendingDelete.name} removed`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete the document.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-12">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Knowledge base</h1>
          <p className="text-[15px] text-fg-muted">
            {isAdmin
              ? 'Documents the assistant searches when answering. Uploads are split into passages and embedded with Gemini.'
              : 'Documents the assistant searches when answering your questions.'}
          </p>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={FileStack} label="Documents" value={status === 'loading' ? '–' : documents.length} />
          <Stat icon={Database} label="Indexed passages" value={status === 'loading' ? '–' : totals.chunks.toLocaleString()} />
          <Stat icon={HardDrive} label="Total size" value={status === 'loading' ? '–' : formatBytes(totals.bytes)} />
        </div>

        {isAdmin ? (
          <section className="mt-8" aria-label="Upload documents">
            <UploadZone onUploaded={load} />
          </section>
        ) : null}

        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-fg">All documents</h2>
            <label className="relative block sm:w-64">
              <span className="sr-only">Search documents</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name"
                className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle outline-none focus:border-primary focus:ring-4 focus:ring-ring"
              />
            </label>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            {status === 'loading' ? (
              <div className="divide-y divide-border">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex items-center gap-4 p-4">
                    <div className="skeleton size-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3.5 w-1/3 rounded" />
                      <div className="skeleton h-3 w-1/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <Library className="size-9 text-fg-subtle/60" />
                <p className="mt-3 text-sm font-medium text-fg">{query ? 'No documents match your search' : 'No documents yet'}</p>
                <p className="mt-1 text-sm text-fg-subtle">
                  {query ? 'Try a different name.' : isAdmin ? 'Upload your first file above.' : 'Ask an administrator to upload some.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((doc) => {
                  const kind = fileKind(doc.name);
                  return (
                    <li key={doc.id} className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-bg-subtle/60">
                      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold', kindStyles[kind])}>{kind}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fg" title={doc.name}>
                          {doc.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-fg-subtle">
                          <span title={formatDate(doc.createdAt)}>Added {formatRelative(doc.createdAt)}</span> by {doc.uploadedBy}
                          <span className="sm:hidden"> · {formatBytes(doc.sizeBytes)}</span>
                        </p>
                      </div>
                      <span className="hidden w-20 text-right text-sm text-fg-muted sm:block">{formatBytes(doc.sizeBytes)}</span>
                      <Badge className="hidden sm:inline-flex">{plural(doc.chunkCount, 'passage')}</Badge>
                      {isAdmin ? (
                        <Button
                          variant="danger-ghost"
                          size="icon-sm"
                          onClick={() => setPendingDelete(doc)}
                          aria-label={`Delete ${doc.name}`}
                          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete document?"
        description={pendingDelete ? `"${pendingDelete.name}" and its ${plural(pendingDelete.chunkCount, 'indexed passage')} will be removed. The assistant will no longer use it.` : undefined}
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
