import { useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, CloudUpload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { documentsApi, getErrorMessage } from '../../lib/api';
import { cn } from '../../lib/cn';
import { formatBytes, plural } from '../../lib/format';
import Spinner from '../../components/ui/Spinner';

const ACCEPTED = ['.pdf', '.docx', '.txt'];
const MAX_BYTES = 50 * 1024 * 1024;

function validate(file) {
  const lower = file.name.toLowerCase();
  if (!ACCEPTED.some((ext) => lower.endsWith(ext))) return 'Only PDF, DOCX and TXT files are supported.';
  if (file.size > MAX_BYTES) return 'File is larger than 50 MB.';
  if (file.size === 0) return 'File is empty.';
  return null;
}

// Uploads files one at a time (embedding is the slow part) and reports per-file progress.
export default function UploadZone({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState([]);
  const inputRef = useRef(null);
  const busy = queue.some((item) => item.state === 'uploading' || item.state === 'processing' || item.state === 'queued');

  const update = (id, patch) => setQueue((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const start = async (fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    const items = files.map((file) => {
      const error = validate(file);
      return { id: `${file.name}-${file.size}-${Math.random()}`, file, progress: 0, state: error ? 'error' : 'queued', error };
    });
    setQueue((current) => [...current.filter((item) => item.state !== 'done'), ...items]);

    for (const item of items) {
      if (item.state === 'error') continue;
      update(item.id, { state: 'uploading' });
      try {
        const result = await documentsApi.upload(item.file, (progress) =>
          update(item.id, { progress, state: progress >= 100 ? 'processing' : 'uploading' }),
        );
        update(item.id, { state: 'done', progress: 100, chunks: result.chunkCount });
        toast.success(`${result.name} indexed`, { description: `${plural(result.chunkCount, 'passage')} ready to search.` });
        onUploaded?.();
      } catch (error) {
        update(item.id, { state: 'error', error: getErrorMessage(error, 'Upload failed.') });
      }
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          start(event.dataTransfer.files);
        }}
        className={cn(
          'group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragging ? 'border-primary bg-primary-soft' : 'border-border-strong bg-bg-subtle/50 hover:border-primary/50 hover:bg-primary-soft/40',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-surface shadow-soft">
          <CloudUpload className={cn('size-6 transition-colors', dragging ? 'text-primary' : 'text-fg-muted group-hover:text-primary')} />
        </span>
        <p className="mt-4 text-[15px] font-medium text-fg">
          {dragging ? 'Drop to upload' : (
            <>
              Drag files here or <span className="text-primary">browse</span>
            </>
          )}
        </p>
        <p className="mt-1 text-sm text-fg-subtle">PDF, DOCX or TXT · up to 50 MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(event) => {
            start(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {queue.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {queue.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5">
              <FileText className="size-4 shrink-0 text-fg-subtle" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-fg">{item.file.name}</span>
                  <span className="shrink-0 text-xs text-fg-subtle">
                    {item.state === 'uploading' && `${item.progress}%`}
                    {item.state === 'processing' && 'Indexing…'}
                    {item.state === 'queued' && 'Waiting'}
                    {item.state === 'done' && plural(item.chunks, 'passage')}
                    {item.state === 'error' && formatBytes(item.file.size)}
                  </span>
                </div>
                {item.state === 'error' ? (
                  <p className="mt-0.5 text-xs text-danger">{item.error}</p>
                ) : item.state !== 'done' ? (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg-subtle">
                    <div
                      className={cn('h-full rounded-full bg-brand transition-[width] duration-300', item.state === 'processing' && 'animate-pulse')}
                      style={{ width: `${item.state === 'queued' ? 0 : item.progress}%` }}
                    />
                  </div>
                ) : null}
              </div>
              {item.state === 'done' ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : null}
              {item.state === 'error' ? <CircleAlert className="size-4 shrink-0 text-danger" /> : null}
              {item.state === 'uploading' || item.state === 'processing' ? <Spinner className="size-4 shrink-0 text-primary" /> : null}
              {!busy && (item.state === 'done' || item.state === 'error') ? (
                <button
                  type="button"
                  onClick={() => setQueue((items) => items.filter((entry) => entry.id !== item.id))}
                  className="rounded-md p-1 text-fg-subtle hover:bg-bg-subtle hover:text-fg"
                  aria-label={`Dismiss ${item.file.name}`}
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
