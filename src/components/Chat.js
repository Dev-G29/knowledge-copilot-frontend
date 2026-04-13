import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import { chat } from '../services/api';

const getConversationId = (data) =>
  data?.conversationId ?? data?.data?.conversationId ?? null;

const getAnswer = (data) =>
  data?.answer ?? data?.response ?? data?.data?.answer ?? 'No answer returned.';

const getConfidence = (data) =>
  data?.confidenceScore ?? data?.confidence ?? data?.data?.confidence ?? null;

const getSources = (data) => {
  const sources = data?.sources ?? data?.data?.sources ?? [];
  return Array.isArray(sources) ? sources : [];
};

const Chat = forwardRef(({ token, selectedConversationId }, ref) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatWindowRef = useRef(null);

  useImperativeHandle(ref, () => ({
    loadConversation,
    clearChat: () => {
      setMessages([]);
      setConversationId(null);
      setQuery('');
      setError('');
    },
  }));

  useEffect(() => {
    const chatWindow = chatWindowRef.current;

    if (!chatWindow) {
      return;
    }

    chatWindow.scrollTo({
      top: chatWindow.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  const loadConversation = (id, conversationData) => {
    setConversationId(id);
    const loadedMessages = [];

    if (conversationData.messages && Array.isArray(conversationData.messages)) {
      conversationData.messages.forEach((msg) => {
        if (msg.type === 'user') {
          loadedMessages.push({
            id: msg.id || `${Date.now()}-user-${Math.random()}`,
            type: 'user',
            text: msg.text || msg.query || '',
          });
        } else if (msg.type === 'assistant') {
          loadedMessages.push({
            id: msg.id || `${Date.now()}-assistant-${Math.random()}`,
            type: 'assistant',
            answer: msg.answer || msg.response || '',
            confidence: msg.confidence || msg.confidenceScore || null,
            sources: Array.isArray(msg.sources) ? msg.sources : [],
          });
        }
      });
    }

    setMessages(loadedMessages);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      type: 'user',
      text: trimmedQuery,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setQuery('');
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        query: trimmedQuery,
      };

      if (conversationId) {
        payload.conversationId = conversationId;
      }

      const response = await chat(payload, token);
      const responseData = response.data;
      const nextConversationId = getConversationId(responseData);

      if (nextConversationId) {
        setConversationId(nextConversationId);
      }

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        type: 'assistant',
        answer: getAnswer(responseData),
        confidence: getConfidence(responseData),
        sources: getSources(responseData),
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (requestError) {
      setError('Unable to get a response right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="chat-card chat-panel">
      <header className="chat-header">
        <p className="chat-eyebrow">AI Chat Application</p>
        <h1>Knowledge Copilot</h1>
        <p className="chat-subtitle">
          Ask a question to start a conversation with the AI assistant.
        </p>
      </header>

      <section ref={chatWindowRef} className="chat-window">
        {messages.length === 0 ? (
          <div className="empty-state">
            Your conversation will appear here once you send a message.
          </div>
        ) : (
          messages.map((message) =>
            message.type === 'user' ? (
              <div key={message.id} className="message-row message-row-user">
                <div className="message message-user">
                  <p className="message-label">You</p>
                  <p className="message-text">{message.text}</p>
                </div>
              </div>
            ) : (
              <article key={message.id} className="message-row message-row-assistant">
                <div className="message message-assistant">
                  <p className="message-label">AI Assistant</p>
                  <div className="message-text markdown-content">
                    <ReactMarkdown>{message.answer}</ReactMarkdown>
                  </div>
                  <p className="message-meta">
                    Confidence:{' '}
                    {message.confidence !== null ? message.confidence : 'N/A'}
                  </p>
                  {message.sources.length > 0 ? (
                    <div className="message-sources">
                      <p className="sources-title">Sources</p>
                      {message.sources.map((source, index) => (
                        <div key={`${message.id}-source-${index}`} className="source-item">
                          <p className="source-name">
                            {source.documentName ||
                              source.document ||
                              source.name ||
                              'Unnamed document'}
                          </p>
                          <p className="source-snippet">
                            {source.snippet || source.text || 'No snippet available.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          )
        )}

        {isLoading ? (
          <div className="message-row message-row-assistant">
            <div className="message message-assistant loading-message">
              <p className="message-label">AI Assistant</p>
              <div className="thinking-dots" aria-label="Assistant is typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <label className="chat-input-shell">
          <span className="chat-input-label">Message</span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask something..."
            aria-label="Ask a question"
            disabled={isLoading}
          />
        </label>
        <button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  );
});

Chat.displayName = 'Chat';

export default Chat;
