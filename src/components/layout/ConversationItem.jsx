import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import Menu from '../ui/Menu';

export default function ConversationItem({ conversation, onRename, onDelete, onNavigate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = async () => {
    const title = draft.trim();
    setEditing(false);
    if (title && title !== conversation.title) {
      await onRename(conversation.id, title);
    } else {
      setDraft(conversation.title);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        maxLength={120}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit();
          if (event.key === 'Escape') {
            setDraft(conversation.title);
            setEditing(false);
          }
        }}
        aria-label="Conversation title"
        className="h-9 w-full rounded-lg border border-primary bg-surface px-2.5 text-sm text-fg outline-none ring-4 ring-ring"
      />
    );
  }

  return (
    <div className="group relative">
      <NavLink
        to={`/chat/${conversation.id}`}
        onClick={onNavigate}
        title={conversation.title}
        className={({ isActive }) =>
          cn(
            'flex h-9 items-center rounded-lg pl-2.5 pr-9 text-sm transition-colors',
            isActive ? 'bg-primary-soft font-medium text-fg' : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
          )
        }
      >
        <span className="truncate">{conversation.title}</span>
      </NavLink>
      <Menu
        className="absolute right-1 top-1/2 -translate-y-1/2"
        label={`Options for ${conversation.title}`}
        trigger={({ open, toggle, props }) => (
          <button
            type="button"
            onClick={toggle}
            {...props}
            className={cn(
              'flex size-7 items-center justify-center rounded-md text-fg-subtle transition-opacity hover:bg-border/60 hover:text-fg focus-visible:opacity-100',
              open ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100',
            )}
          >
            <Ellipsis className="size-4" />
          </button>
        )}
        items={[
          { key: 'rename', label: 'Rename', icon: Pencil, onSelect: () => setEditing(true) },
          { key: 'delete', label: 'Delete', icon: Trash2, danger: true, onSelect: () => onDelete(conversation) },
        ]}
      />
    </div>
  );
}
