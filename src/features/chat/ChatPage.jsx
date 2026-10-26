import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConversations } from '../../context/ConversationsContext';
import { conversationsApi, documentsApi, getErrorMessage } from '../../lib/api';
import { streamChat } from '../../lib/sse';
import Spinner from '../../components/ui/Spinner';
import Composer from './Composer';
import EmptyState from './EmptyState';
import MessageBubble from './MessageBubble';

let localId = 0;
const nextId = (prefix) => `${prefix}-${Date.now()}-${(localId += 1)}`;

// History rows are { query, answer, sources, confidence }; the UI renders one bubble per side.
function toMessages(history) {
  return history.flatMap((row) => [
    { id: `u-${row.id}`, role: 'user', content: row.query },
    {
      id: `a-${row.id}`,
      role: 'assistant',
      content: row.answer,
      sources: row.sources || [],
      confidence: row.confidence ?? null,
      status: 'done',
    },
  ]);
}

export default function ChatPage() {
  const { conversationId: routeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { conversations, refresh } = useConversations();

  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [showJump, setShowJump] = useState(false);

  // The conversation the visible messages belong to. Set before navigating to a newly created
  // conversation so the route change doesn't reload (and wipe) the in-flight stream.
  const activeIdRef = useRef(routeId ?? null);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);
  const lastLocationKey = useRef(location.key);

  const title = conversations.find((c) => String(c.id) === routeId)?.title;

  useEffect(() => {
    document.title = title ? `${title} · Knowledge Copilot` : 'Chat · Knowledge Copilot';
  }, [title]);

  useEffect(() => {
    documentsApi
      .list()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setDocumentsLoaded(true));
  }, []);

  // Load history when the route points at a different conversation than the one on screen.
  useEffect(() => {
    const target = routeId ?? null;
    const navigatedAgain = location.key !== lastLocationKey.current;
    lastLocationKey.current = location.key;

    if (target === null) {
      // "/chat": start fresh when arriving from a conversation or when "New chat" is clicked again.
      if (activeIdRef.current === null && !navigatedAgain) return;
      abortRef.current?.abort();
      activeIdRef.current = null;
      stickToBottom.current = true;
      setMessages([]);
      return;
    }

    // Already showing this conversation (e.g. it was just created by the current stream).
    if (target === activeIdRef.current && messages.length > 0) return;

    abortRef.current?.abort();
    activeIdRef.current = target;
    stickToBottom.current = true;

    let cancelled = false;
    setLoadingHistory(true);
    setMessages([]);
    conversationsApi
      .messages(target)
      .then((history) => {
        if (!cancelled) setMessages(toMessages(history));
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getErrorMessage(error, 'Could not open that conversation.'));
        navigate('/chat', { replace: true });
      })
      .finally(() => !cancelled && setLoadingHistory(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, location.key]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Follow new content unless the user has scrolled up to read.
  useEffect(() => {
    const element = scrollRef.current;
    if (element && stickToBottom.current) element.scrollTop = element.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const element = scrollRef.current;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    stickToBottom.current = distance < 80;
    setShowJump(distance > 240);
  };

  const jumpToBottom = () => {
    stickToBottom.current = true;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  const updateAssistant = (id, patch) =>
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m)));

  const send = useCallback(
    async (text) => {
      const assistantId = nextId('a');
      const startedIn = activeIdRef.current;
      stickToBottom.current = true;
      setMessages((list) => [
        ...list,
        { id: nextId('u'), role: 'user', content: text },
        { id: assistantId, role: 'assistant', content: '', sources: [], confidence: null, status: 'streaming' },
      ]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let createdConversation = false;

      try {
        await streamChat({
          query: text,
          conversationId: startedIn ? Number(startedIn) : null,
          signal: controller.signal,
          onEvent: ({ event, data }) => {
            if (event === 'meta') {
              updateAssistant(assistantId, { sources: data.sources || [], confidence: data.sources?.length ? data.confidence : null });
              if (!startedIn && data.conversationId) {
                createdConversation = true;
                activeIdRef.current = String(data.conversationId);
                navigate(`/chat/${data.conversationId}`, { replace: true });
              }
            } else if (event === 'token') {
              updateAssistant(assistantId, (m) => ({ content: m.content + (data.text ?? '') }));
            } else if (event === 'done') {
              updateAssistant(assistantId, { status: 'done' });
            } else if (event === 'error') {
              updateAssistant(assistantId, { status: 'error', error: data.message || 'The assistant could not finish this answer.' });
            }
          },
        });
        // A stream that closes without "done" (e.g. proxy timeout) still shouldn't spin forever.
        updateAssistant(assistantId, (m) => (m.status === 'streaming' ? { status: m.content ? 'done' : 'error', error: 'The connection closed unexpectedly.' } : {}));
      } catch (error) {
        if (error.name === 'AbortError') {
          updateAssistant(assistantId, (m) => ({ status: m.content ? 'stopped' : 'error', error: m.content ? undefined : 'Stopped before an answer arrived.' }));
        } else {
          const message = getErrorMessage(error);
          updateAssistant(assistantId, { status: 'error', error: message });
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setStreaming(false);
        if (createdConversation || startedIn) refresh();
      }
    },
    [navigate, refresh],
  );

  const stop = () => abortRef.current?.abort();

  const isEmpty = messages.length === 0 && !loadingHistory;

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-y-auto">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center text-fg-subtle">
            <Spinner />
          </div>
        ) : isEmpty ? (
          <EmptyState documents={documents} documentsLoaded={documentsLoaded} isAdmin={isAdmin} username={user?.username} onPick={send} />
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-7 px-4 pb-8 pt-8 sm:px-6 md:pt-12" aria-live="polite">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <div className="relative shrink-0 px-3 pb-3 sm:px-6 sm:pb-5">
        {showJump ? (
          <button
            type="button"
            onClick={jumpToBottom}
            className="absolute -top-12 left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-fg-muted shadow-soft hover:text-fg"
            aria-label="Scroll to latest message"
          >
            <ArrowDown className="size-4" />
          </button>
        ) : null}
        <div className="mx-auto w-full max-w-3xl">
          <Composer onSend={send} onStop={stop} streaming={streaming} autoFocus={!loadingHistory} />
          <p className="mt-2 text-center text-[11.5px] text-fg-subtle">
            Answers are generated from your uploaded documents and can be incomplete. Check the sources.
          </p>
        </div>
      </div>
    </div>
  );
}
