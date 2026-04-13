function About() {
  return (
    <section className="content-page">
      <div className="page-intro">
        <p className="chat-eyebrow">About</p>
        <h1>AI-powered knowledge assistant</h1>
        <p className="page-copy">
          Knowledge Copilot helps teams search across uploaded documents and ask
          natural language questions in one streamlined workspace.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <h2>What it does</h2>
          <p>
            The app combines document search with AI chat so answers can be
            grounded in your own knowledge sources instead of generic web content.
          </p>
        </article>
        <article className="info-card">
          <h2>Why it matters</h2>
          <p>
            Users can move from raw files to contextual answers quickly while
            still reviewing confidence scores and source snippets for trust.
          </p>
        </article>
      </div>
    </section>
  );
}

export default About;
