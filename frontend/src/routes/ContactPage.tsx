import { FormEvent, useState } from "react";
import {
  isEmailContactConfigured,
  sendContactMessage,
} from "../utils/email";

const categories = [
  "General enquiry",
  "Technical problem",
  "Feature suggestion",
  "Account help",
  "Other",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isConfigured = isEmailContactConfigured();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSending(true);

    try {
      await sendContactMessage({ name, email, subject, category, message });
      setName("");
      setEmail("");
      setSubject("");
      setCategory(categories[0]);
      setMessage("");
      setSuccess("Your message has been sent. We will reply by email.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your message could not be sent.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="page contact-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Contact KiwiHire Coach</p>
          <h1>How can we help?</h1>
          <p className="muted">
            Ask a question, report a problem, or suggest an improvement.
            We will reply to the email address you provide.
          </p>
        </div>
      </div>

      <div className="grid two contact-layout">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-inner form-grid">
            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                value={name}
                maxLength={100}
                autoComplete="name"
                required
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                maxLength={254}
                autoComplete="email"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="contact-category">What is this about?</label>
              <select
                id="contact-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                value={subject}
                maxLength={150}
                required
                onChange={(event) => setSubject(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                value={message}
                minLength={10}
                maxLength={2000}
                required
                placeholder="Please include enough detail for us to understand the problem."
                onChange={(event) => setMessage(event.target.value)}
              />
              <span className="field-help">{message.length} / 2,000</span>
            </div>

            {!isConfigured && (
              <p className="info-message" role="status">
                Email delivery is not configured in this environment yet.
              </p>
            )}
            {error && <p className="error-message" role="alert">{error}</p>}
            {success && <p className="success-message" role="status">{success}</p>}

            <button
              className="button primary"
              type="submit"
              disabled={isSending || !isConfigured}
            >
              {isSending ? "Sending message..." : "Send message"}
            </button>
          </div>
        </form>

        <aside className="panel contact-guidance">
          <div className="panel-inner">
            <p className="eyebrow">Before sending</p>
            <h2>Help us help you faster.</h2>
            <ul>
              <li>Describe what you were trying to do.</li>
              <li>Include the page and any error message you saw.</li>
              <li>Do not include passwords, tokens, or sensitive CV details.</li>
            </ul>
            <p className="muted">
              For product ratings and workflow research, signed-in users can
              continue to use the separate Feedback page.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
