import { Link, Route, Routes } from "react-router-dom";
import DashboardPage from "./routes/DashboardPage";
import ApplicationsPage from "./routes/ApplicationsPage";
import ApplicationDetailPage from "./routes/ApplicationDetailPage";
import NewApplicationPage from "./routes/NewApplicationPage";
import ResumesPage from "./routes/ResumesPage";
import ResumeReviewPage from "./routes/ResumeReviewPage";
import LoginPage from "./routes/LoginPage";
import RegisterPage from "./routes/RegisterPage";

export default function App() {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <Link to="/" className="brand">KiwiHire Coach</Link>
        <nav>
          <Link to="/applications">Applications</Link>
          <Link to="/resumes">Resumes</Link>
          <Link to="/review">Review Resume</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/applications/new" element={<NewApplicationPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/resumes" element={<ResumesPage />} />
          <Route path="/review" element={<ResumeReviewPage />} />
        </Routes>
      </main>
    </div>
  );
}

