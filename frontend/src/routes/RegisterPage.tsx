import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { registerUser } from "../utils/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await registerUser({ email, password });
      setRegisteredEmail(user.email);
      setPassword("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Start simple</p>
          <h1>Create an account</h1>
          <p className="muted">Save applications, resumes, and review history in one place.</p>
        </div>
      </div>
      <form className="panel" onSubmit={handleSubmit}>
        <div className="panel-inner form-grid">
          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          {registeredEmail && (
            <p className="success-message" role="status">
              Account created for {registeredEmail}.{" "}
              <Link to="/login">Continue to login</Link>
            </p>
          )}
          <button
            className="button primary"
            type="submit"
            disabled={isSubmitting || Boolean(registeredEmail)}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
          <p className="muted">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </form>
    </section>
  );
}
