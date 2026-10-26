import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { conversationsApi } from '../lib/api';

const ConversationsContext = createContext(null);

export function ConversationsProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [status, setStatus] = useState('loading');

  const refresh = useCallback(async () => {
    try {
      const list = await conversationsApi.list();
      setConversations(Array.isArray(list) ? list : []);
      setStatus('ready');
    } catch {
      setStatus((current) => (current === 'loading' ? 'error' : current));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    conversationsApi
      .list()
      .then((list) => {
        if (cancelled) return;
        setConversations(Array.isArray(list) ? list : []);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, []);

  const rename = useCallback(async (id, title) => {
    const updated = await conversationsApi.rename(id, title);
    setConversations((list) => list.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await conversationsApi.remove(id);
    setConversations((list) => list.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ conversations, status, refresh, rename, remove }), [conversations, status, refresh, rename, remove]);
  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (!context) throw new Error('useConversations must be used inside <ConversationsProvider>');
  return context;
}
