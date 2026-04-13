const steps = [
  'Login',
  'Upload documents (Admin)',
  'Ask questions',
  'View answers and sources',
];

function HowToUse() {
  return (
    <section className="content-page">
      <div className="page-intro">
        <p className="chat-eyebrow">How To Use</p>
        <h1>Get started in four simple steps</h1>
        <p className="page-copy">
          The workflow is designed to stay simple: authenticate, upload trusted
          documents, ask questions, and review the grounded responses.
        </p>
      </div>

      <div className="steps-list">
        {steps.map((step, index) => (
          <article key={step} className="step-card">
            <span className="step-number">{index + 1}</span>
            <div>
              <h2>{step}</h2>
              <p>
                {index === 0 &&
                  'Sign in to access the protected workspace and your assistant tools.'}
                {index === 1 &&
                  'Upload the documents you want the system to use when preparing answers.'}
                {index === 2 &&
                  'Ask a question in natural language to start or continue a conversation.'}
                {index === 3 &&
                  'Review the answer, confidence score, and cited source snippets.'}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HowToUse;
