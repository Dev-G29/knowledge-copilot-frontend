function ChatLayout() {
  return (
    <main className="app-shell">
      <section className="chat-card">
        <header className="chat-header">
          <p className="chat-eyebrow">AI Chat Application</p>
          <h1>Knowledge Copilot</h1>
          <p className="chat-subtitle">
            Minimal frontend scaffold for the chat experience.
          </p>
        </header>

        <section className="chat-window">
          <div className="message message-assistant">
            Hello! Your chat UI will go here.
          </div>
          <div className="message message-user">Waiting for user input...</div>
        </section>

        <form className="chat-input-area">
          <input
            type="text"
            placeholder="Type a message..."
            aria-label="Message input"
          />
          <button type="button">Send</button>
        </form>
      </section>
    </main>
  );
}

export default ChatLayout;
