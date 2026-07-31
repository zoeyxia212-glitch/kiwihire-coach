import { useState } from "react";
import { Link, Route, Routes } from "react-router";
import DashboardPage from "./routes/DashboardPage";
import ApplicationsPage from "./routes/ApplicationsPage";
import ApplicationDetailPage from "./routes/ApplicationDetailPage";
import NewApplicationPage from "./routes/NewApplicationPage";
import ResumesPage from "./routes/ResumesPage";
import ResumeReviewPage from "./routes/ResumeReviewPage";
import SavedReviewPage from "./routes/SavedReviewPage";
import CandidateProfilePage from "./routes/CandidateProfilePage";
import LearningPlanPage from "./routes/LearningPlanPage";
import AccountPage from "./routes/AccountPage";
import FeedbackPage from "./routes/FeedbackPage";
import NotFoundPage from "./routes/NotFoundPage";
import LoginPage from "./routes/LoginPage";
import RegisterPage from "./routes/RegisterPage";
import EditApplicationPage from "./routes/EditApplicationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import BrowserReminderMonitor from "./components/BrowserReminderMonitor";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "./utils/auth";
import type { AuthSession } from "./utils/auth";

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(
    loadAuthSession,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogin(session: AuthSession) {
    saveAuthSession(session);
    setAuthSession(session);
  }

  function handleLogout() {
    clearAuthSession();
    setAuthSession(null);
    setIsMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <Link to="/" className="brand">KiwiHire Coach</Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
        <nav
          id="primary-navigation"
          className={isMenuOpen ? "nav-open" : ""}
        >
          {authSession ? (
            <>
              <Link
                to="/applications"
                onClick={() => setIsMenuOpen(false)}
              >
                Applications
              </Link>
              <Link
                to="/resumes"
                onClick={() => setIsMenuOpen(false)}
              >
                Resumes
              </Link>
              <Link
                to="/review"
                onClick={() => setIsMenuOpen(false)}
              >
                Review Resume
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/learning"
                onClick={() => setIsMenuOpen(false)}
              >
                Learning
              </Link>
              <Link
                to="/feedback"
                onClick={() => setIsMenuOpen(false)}
              >
                Feedback
              </Link>
              <Link
                to="/account"
                className="nav-user"
                onClick={() => setIsMenuOpen(false)}
              >
                {authSession.email}
              </Link>
              <button
                className="nav-button"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      {authSession && <BrowserReminderMonitor />}

      <main>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage onLogin={handleLogin} />}
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute
                isAuthenticated={Boolean(authSession)}
              />
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route
              path="/applications/new"
              element={<NewApplicationPage />}
            />
            <Route
              path="/applications/:id"
              element={<ApplicationDetailPage />}
            />
            <Route path="/resumes" element={<ResumesPage />} />
            <Route path="/review" element={<ResumeReviewPage />} />
            <Route path="/reviews/:id" element={<SavedReviewPage />} />
            <Route path="/profile" element={<CandidateProfilePage />} />
            <Route path="/learning" element={<LearningPlanPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route
              path="/account"
              element={
                <AccountPage onAccountDeleted={handleLogout} />
              }
            />
            <Route
              path="/applications/:id/edit"
              element={<EditApplicationPage />}
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
