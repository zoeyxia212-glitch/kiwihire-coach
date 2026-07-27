import { Link } from "react-router";
import { loadAuthSession } from "../utils/auth";

export default function NotFoundPage() {
  const isAuthenticated = Boolean(loadAuthSession());

  return (
    <section className="page not-found-page">
      <div className="panel">
        <div className="panel-inner">
          <p className="error-code">404</p>
          <p className="eyebrow">Page not found</p>
          <h1>This page does not exist.</h1>
          <p className="muted">
            The link may be outdated, or the address may have been
            typed incorrectly.
          </p>
          <div className="form-actions">
            {isAuthenticated ? (
              <>
                <Link className="button primary" to="/">
                  Go to dashboard
                </Link>
                <Link className="button" to="/applications">
                  View applications
                </Link>
              </>
            ) : (
              <>
                <Link className="button primary" to="/login">
                  Go to login
                </Link>
                <Link className="button" to="/register">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
