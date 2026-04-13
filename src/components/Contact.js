import profilePhoto from "../images/profilephoto.png";


function Contact() {
  return (
    <section className="content-page contact-page">
      <div className="page-intro contact-hero">
        
        <h1>Let’s build your modern AI knowledge assistant.</h1>
        <p className="page-copy contact-copy-text">
          Reach out for collaboration, feedback, or any project opportunities.
          I can help you design polished, AI-driven experiences for your
          documents and teams.
        </p>
      </div>

      <article className="contact-card contact-panel">
        <div className="contact-panel-grid">
          <div className="contact-panel-body">
            <span className="contact-pill">Contact</span>
            <h2>Grow faster with intelligent document search.</h2>
            <p className="contact-panel-description">
              I create AI assistants that transform raw knowledge into trusted,
              conversational answers. Let’s build a sleek, secure product that
              feels modern and easy to use.
            </p>

            <div className="contact-details contact-details-grid">
              <a href="mailto:devgangavkar@gmail.com">Email</a>
              <a href="tel:+919075115211">+91 9075115211</a>
              <a href="https://www.linkedin.com/in/dev-gangavkar" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </div>

          <div className="contact-panel-image">
            <img
              className="contact-photo contact-photo--panel"
              src={profilePhoto}
              alt="Profile placeholder"
            />
          </div>
        </div>
      </article>
    </section>
  );
}

export default Contact;
