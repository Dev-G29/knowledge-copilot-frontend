import { useMemo, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Library, LogOut, MessageSquarePlus, Monitor, Moon, PanelLeftClose, Search, Sun, MessagesSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConversations } from '../../context/ConversationsContext';
import { useTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../lib/api';
import { cn } from '../../lib/cn';
import { groupByRecency } from '../../lib/format';
import Logo from '../brand/Logo';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import Menu from '../ui/Menu';
import ConversationItem from './ConversationItem';

export default function Sidebar({ onCollapse, onNavigate }) {
  const { user, isAdmin, logout } = useAuth();
  const { conversations, status, rename, remove } = useConversations();
  const { preference, setPreference } = useTheme();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle ? conversations.filter((c) => c.title?.toLowerCase().includes(needle)) : conversations;
    return groupByRecency(filtered);
  }, [conversations, query]);

  const handleRename = async (id, title) => {
    try {
      await rename(id, title);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not rename the conversation.'));
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await remove(pendingDelete.id);
      if (String(pendingDelete.id) === conversationId) navigate('/chat');
      toast.success('Conversation deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete the conversation.'));
    } finally {
      setDeleting(false);
    }
  };

  const initial = (user?.username || '?').charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-3">
        <Logo to="/chat" />
        {onCollapse ? (
          <Button variant="ghost" size="icon-sm" onClick={onCollapse} aria-label="Hide sidebar" title="Hide sidebar">
            <PanelLeftClose className="size-[18px]" />
          </Button>
        ) : null}
      </div>

      <div className="space-y-2 px-3 pb-3">
        <Button to="/chat" onClick={onNavigate} variant="secondary" className="w-full justify-start">
          <MessageSquarePlus className="size-4 text-primary" />
          New chat
        </Button>
        <label className="relative block">
          <span className="sr-only">Search conversations</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats"
            className="h-9 w-full rounded-lg border border-transparent bg-bg-subtle pl-8 pr-3 text-sm text-fg placeholder:text-fg-subtle outline-none focus:border-border-strong"
          />
        </label>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3" aria-label="Conversations">
        {status === 'loading' ? (
          <div className="space-y-2 pt-2" aria-hidden="true">
            {[72, 56, 64, 48, 60].map((width, index) => (
              <div key={index} className="skeleton h-7 rounded-lg" style={{ width: `${width}%` }} />
            ))}
          </div>
        ) : status === 'error' ? (
          <p className="px-2.5 pt-2 text-sm text-fg-subtle">Couldn't load conversations.</p>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center px-4 pt-10 text-center">
            <MessagesSquare className="size-8 text-fg-subtle/60" />
            <p className="mt-3 text-sm text-fg-subtle">{query ? 'No matching chats.' : 'Your conversations will show up here.'}</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-4">
              <h3 className="px-2.5 pb-1 text-[11.5px] font-semibold uppercase tracking-wider text-fg-subtle">{group.label}</h3>
              <ul className="space-y-0.5">
                {group.items.map((conversation) => (
                  <li key={conversation.id}>
                    <ConversationItem
                      conversation={conversation}
                      onRename={handleRename}
                      onDelete={setPendingDelete}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </nav>

      <div className="border-t border-border p-3">
        <NavLink
          to="/documents"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'mb-2 flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary-soft text-fg' : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
            )
          }
        >
          <Library className="size-4" />
          Knowledge base
        </NavLink>

        <Menu
          side="top"
          align="start"
          className="w-full"
          label="Account menu"
          trigger={({ toggle, props }) => (
            <button
              type="button"
              onClick={toggle}
              {...props}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-bg-subtle"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                {initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-fg">{user?.username}</span>
                <span className="block truncate text-xs text-fg-subtle">{user?.email || 'Signed in'}</span>
              </span>
              {isAdmin ? <Badge tone="primary">Admin</Badge> : null}
            </button>
          )}
          items={[
            { key: 'light', label: 'Light theme', icon: Sun, active: preference === 'light', onSelect: () => setPreference('light') },
            { key: 'dark', label: 'Dark theme', icon: Moon, active: preference === 'dark', onSelect: () => setPreference('dark') },
            { key: 'system', label: 'System theme', icon: Monitor, active: preference === 'system', onSelect: () => setPreference('system') },
            { key: 'sep', separator: true },
            { key: 'logout', label: 'Sign out', icon: LogOut, danger: true, onSelect: () => logout() },
          ]}
        />
      </div>

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete conversation?"
        description={pendingDelete ? `"${pendingDelete.title}" and all of its messages will be permanently deleted.` : undefined}
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
