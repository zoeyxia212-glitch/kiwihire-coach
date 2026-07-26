import { FormEvent, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router";
import type { LoginResponse } from "../utils/api";
import { loginUser } from "../utils/api";

type LoginPageProps = {
  onLogin: (session: LoginResponse) => void;
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    from?: string;
    message?: string;
  } | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await loginUser({ email, password });
      onLogin(session);
      navigate(locationState?.from ?? "/", { replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not log you in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Login</h1>
          <p className="muted">Continue working on your job search.</p>
        </div>
      </div>
      <form className="panel" onSubmit={handleSubmit}>
        <div className="panel-inner form-grid">
          {locationState?.message && (
            <p className="info-message" role="status">
              {locationState.message}
            </p>
          )}
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button
            className="button primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          <p className="muted">
            Need an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </form>
    </section>
  );
}
