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
import LoginPage from "./routes/LoginPage";
import RegisterPage from "./routes/RegisterPage";
import EditApplicationPage from "./routes/EditApplicationPage";
import ProtectedRoute from "./components/ProtectedRoute";
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

  function handleLogin(session: AuthSession) {
    saveAuthSession(session);
    setAuthSession(session);
  }

  function handleLogout() {
    clearAuthSession();
    setAuthSession(null);
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <Link to="/" className="brand">KiwiHire Coach</Link>
        <nav>
          {authSession ? (
            <>
              <Link to="/applications">Applications</Link>
              <Link to="/resumes">Resumes</Link>
              <Link to="/review">Review Resume</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/learning">Learning</Link>
              <span className="nav-user">{authSession.email}</span>
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
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

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
            <Route
              path="/applications/:id/edit"
              element={<EditApplicationPage />}
            />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
