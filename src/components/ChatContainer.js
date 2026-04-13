import { useState, useRef } from 'react';
import Chat from './Chat';
import ConversationSidebar from './ConversationSidebar';

function ChatContainer({ token }) {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const chatRef = useRef(null);

  const handleSelectConversation = (conversationId, conversationData) => {
    setSelectedConversationId(conversationId);
    if (chatRef.current?.loadConversation) {
      chatRef.current.loadConversation(conversationId, conversationData);
    }
  };

  const handleNewChat = () => {
    setSelectedConversationId(null);
    if (chatRef.current?.clearChat) {
      chatRef.current.clearChat();
    }
  };

  return (
    <div className="chat-container">
      <ConversationSidebar
        token={token}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />
      <Chat
        ref={chatRef}
        token={token}
        selectedConversationId={selectedConversationId}
      />
    </div>
  );
}

export default ChatContainer;
