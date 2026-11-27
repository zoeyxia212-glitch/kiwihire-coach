import { lazy, Suspense, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import BrowserReminderMonitor from "./components/BrowserReminderMonitor";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "./utils/auth";
import type { AuthSession } from "./utils/auth";

const DashboardPage = lazy(() => import("./routes/DashboardPage"));
const HomePage = lazy(() => import("./routes/HomePage"));
const ApplicationsPage = lazy(() => import("./routes/ApplicationsPage"));
const ApplicationDetailPage = lazy(
  () => import("./routes/ApplicationDetailPage"),
);
const NewApplicationPage = lazy(() => import("./routes/NewApplicationPage"));
const ResumesPage = lazy(() => import("./routes/ResumesPage"));
const ResumeReviewPage = lazy(() => import("./routes/ResumeReviewPage"));
const SavedReviewPage = lazy(() => import("./routes/SavedReviewPage"));
const CandidateProfilePage = lazy(
  () => import("./routes/CandidateProfilePage"),
);
const LearningPlanPage = lazy(() => import("./routes/LearningPlanPage"));
const CalendarPage = lazy(() => import("./routes/CalendarPage"));
const InsightsPage = lazy(() => import("./routes/InsightsPage"));
const OffersPage = lazy(() => import("./routes/OffersPage"));
const AccountPage = lazy(() => import("./routes/AccountPage"));
const FeedbackPage = lazy(() => import("./routes/FeedbackPage"));
const ContactPage = lazy(() => import("./routes/ContactPage"));
const NotFoundPage = lazy(() => import("./routes/NotFoundPage"));
const LoginPage = lazy(() => import("./routes/LoginPage"));
const RegisterPage = lazy(() => import("./routes/RegisterPage"));
const EditApplicationPage = lazy(() => import("./routes/EditApplicationPage"));
const ApplicationAnswersPage = lazy(
  () => import("./routes/ApplicationAnswersPage"),
);
const MockInterviewPage = lazy(() => import("./routes/MockInterviewPage"));

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
              <NavLink
                to="/applications"
                onClick={() => setIsMenuOpen(false)}
              >
                Job Tracker
              </NavLink>
              <NavLink
                to="/resumes"
                onClick={() => setIsMenuOpen(false)}
              >
                Resumes
              </NavLink>
              <NavLink
                to="/review"
                onClick={() => setIsMenuOpen(false)}
              >
                CV Review
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </NavLink>
              <NavLink
                to="/learning"
                onClick={() => setIsMenuOpen(false)}
              >
                Learning
              </NavLink>
              <NavLink
                to="/insights"
                onClick={() => setIsMenuOpen(false)}
              >
                Insights
              </NavLink>
              <NavLink
                to="/offers"
                onClick={() => setIsMenuOpen(false)}
              >
                Offers
              </NavLink>
              <NavLink
                to="/answers"
                onClick={() => setIsMenuOpen(false)}
              >
                Answers
              </NavLink>
              <NavLink
                to="/feedback"
                onClick={() => setIsMenuOpen(false)}
              >
                Feedback
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </NavLink>
              <NavLink
                to="/account"
                className="nav-user"
                onClick={() => setIsMenuOpen(false)}
              >
                {authSession.email}
              </NavLink>
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
              <NavLink
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </NavLink>
              <NavLink
                to="/login"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </header>

      {authSession && <BrowserReminderMonitor />}

      <main>
        <Suspense
          fallback={
            <section className="page">
              <p className="muted">Loading page...</p>
            </section>
          }
        >
          <Routes>
          <Route
            path="/login"
            element={<LoginPage onLogin={handleLogin} />}
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/"
            element={authSession ? <DashboardPage /> : <HomePage />}
          />
          <Route
            element={
              <ProtectedRoute
                isAuthenticated={Boolean(authSession)}
              />
            }
          >
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
            <Route path="/reviews/:id/mock-interview" element={<MockInterviewPage />} />
            <Route path="/profile" element={<CandidateProfilePage />} />
            <Route path="/learning" element={<LearningPlanPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/answers" element={<ApplicationAnswersPage />} />
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
        </Suspense>
      </main>
    </div>
  );
}
