import { useCallback, useEffect, useState } from 'react';
import { getConversations, getConversation } from '../services/api';

function ConversationSidebar({
  token,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
}) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getConversations(token);
      const data = response.data?.data || response.data || [];
      const conversationList = Array.isArray(data) ? data : [];
      // Show only last 10 conversations
      setConversations(conversationList.slice(0, 10));
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleConversationClick = async (conversation) => {
    try {
      const response = await getConversation(conversation.id, token);
      const conversationData = response.data?.data || response.data || {};
      onSelectConversation(conversation.id, conversationData);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    }
  };

  return (
    <aside className="conversation-sidebar">
      <div className="sidebar-header">
        <h2>Chat History</h2>
        <button
          className="new-chat-button"
          onClick={onNewChat}
          title="Start a new conversation"
        >
          <span className="plus-icon">+</span>
        </button>
      </div>

      <div className="sidebar-content">
        {isLoading ? (
          <div className="sidebar-loading">Loading conversations...</div>
        ) : error ? (
          <div className="sidebar-error">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="sidebar-empty">No conversations yet</div>
        ) : (
          <ul className="conversation-list">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                className={`conversation-item ${
                  selectedConversationId === conversation.id ? 'active' : ''
                }`}
              >
                <button
                  className="conversation-button"
                  onClick={() => handleConversationClick(conversation)}
                  title={conversation.title || conversation.firstQuery || 'Untitled'}
                >
                  <span className="conversation-title">
                    {(conversation.title || conversation.firstQuery || 'Untitled').substring(0, 40)}
                  </span>
                  {conversation.timestamp && (
                    <span className="conversation-time">
                      {new Date(conversation.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar-footer">
        <button className="refresh-button" onClick={fetchConversations} title="Refresh">
          ↻
        </button>
      </div>
    </aside>
  );
}

export default ConversationSidebar;
