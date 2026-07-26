import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import ReviewResultDisplay from "../components/ReviewResultDisplay";
import type { Application } from "../types/application";
import type { CandidateProfile } from "../types/candidateProfile";
import type { InterviewQuestion } from "../types/interview";
import type { Resume } from "../types/resume";
import type { ResumeReview } from "../types/resumeReview";
import type { ResumeAnalysis } from "../types/resumeAnalysis";
import {
  createResumeReview,
  getApplications,
  getCandidateProfile,
  getResumes,
  getResumeReviews,
} from "../utils/api";
import { generateInterviewQuestions } from "../utils/interviewQuestionGenerator";
import { analyzeResume } from "../utils/resumeAnalysis";

export default function ResumeReviewPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applicationId, setApplicationId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [reviews, setReviews] = useState<ResumeReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [
          loadedApplications,
          loadedResumes,
          loadedReviews,
          loadedProfile,
        ] =
          await Promise.all([
            getApplications(),
            getResumes(),
            getResumeReviews(),
            getCandidateProfile(),
          ]);

        setApplications(loadedApplications);
        setResumes(loadedResumes);
        setReviews(loadedReviews);
        setCandidateProfile(loadedProfile);

        if (loadedApplications[0]) {
          setApplicationId(String(loadedApplications[0].id));
          setJobDescription(loadedApplications[0].jobDescription);
        }

        if (loadedResumes[0]) {
          setResumeId(String(loadedResumes[0].id));
          setResumeText(loadedResumes[0].content);
        }
      } catch {
        setError("Failed to load your applications and resumes.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOptions();
  }, []);

  function chooseApplication(selectedId: string) {
    setApplicationId(selectedId);
    setJobDescription(
      applications.find(
        (item) => String(item.id) === selectedId,
      )?.jobDescription ?? "",
    );
    clearResults();
  }

  function chooseResume(selectedId: string) {
    setResumeId(selectedId);
    setResumeText(
      resumes.find((item) => String(item.id) === selectedId)
        ?.content ?? "",
    );
    clearResults();
  }

  function clearResults() {
    setAnalysis(null);
    setQuestions([]);
    setError("");
    setSaveMessage("");
  }

  function handleAnalyze() {
    if (!jobDescription.trim() || !resumeText.trim()) {
      setError(
        "Choose a resume and an application with text before analyzing.",
      );
      return;
    }

    const candidateContext = buildCandidateContext(candidateProfile);

    setAnalysis(
      analyzeResume(
        jobDescription,
        resumeText,
        candidateContext,
      ),
    );
    setQuestions(
      generateInterviewQuestions(
        jobDescription,
        resumeText,
        candidateContext,
      ),
    );
    setError("");
    setSaveMessage("");
  }

  async function handleSaveReview() {
    if (!analysis || !applicationId || !resumeId) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const savedReview = await createResumeReview({
        applicationId: Number(applicationId),
        resumeId: Number(resumeId),
        score: analysis.score,
        matched: analysis.matched,
        transferable: analysis.transferable,
        missing: analysis.missing,
        suggestions: analysis.suggestions,
        questions: questions.map((question) => ({
          question: question.question,
          reason: question.reason,
          answerGuide: question.answerGuide,
          relatedSkill: question.relatedSkill,
        })),
      });

      setReviews((currentReviews) => [
        savedReview,
        ...currentReviews,
      ]);
      setSaveMessage("Review saved to your history.");
    } catch {
      setError("Failed to save this review.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="muted">Loading review workspace...</p>;
  }

  const missingInputs =
    applications.length === 0 || resumes.length === 0;

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Role-specific review</p>
          <h1>Compare your resume to the role.</h1>
          <p className="muted">
            Transparent local rules only—no paid API and no invented
            experience.
          </p>
        </div>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <div className="panel profile-context-banner">
        <div className="panel-inner">
          <div>
            <p className="eyebrow">Candidate context</p>
            <h2>
              {hasCandidateContext(candidateProfile)
                ? "Candidate Profile will support this review"
                : "Add your Candidate Profile for better context"}
            </h2>
            <p className="muted">
              Profile skills count only as transferable context until
              your resume contains clear supporting evidence.
            </p>
          </div>
          <Link className="button" to="/profile">
            {hasCandidateContext(candidateProfile)
              ? "Update profile"
              : "Create profile"}
          </Link>
        </div>
      </div>

      {missingInputs ? (
        <div className="panel">
          <div className="panel-inner">
            <h2>Complete the inputs first</h2>
            {applications.length === 0 && (
              <p>
                <Link to="/applications/new">Add an application</Link>{" "}
                with a job description.
              </p>
            )}
            {resumes.length === 0 && (
              <p>
                <Link to="/resumes">Save a resume</Link> to your
                library.
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid two">
            <ReviewInput
              label="Application"
              selectId="review-application"
              textId="review-job-description"
              value={applicationId}
              options={applications.map((item) => ({
                id: item.id,
                label: `${item.company} · ${item.roleTitle}`,
              }))}
              text={jobDescription}
              onSelect={chooseApplication}
              onTextChange={(value) => {
                setJobDescription(value);
                clearResults();
              }}
            />
            <ReviewInput
              label="Resume"
              selectId="review-resume"
              textId="review-resume-text"
              value={resumeId}
              options={resumes.map((item) => ({
                id: item.id,
                label: item.name,
              }))}
              text={resumeText}
              onSelect={chooseResume}
              onTextChange={(value) => {
                setResumeText(value);
                clearResults();
              }}
            >
              <button
                className="button primary"
                type="button"
                onClick={handleAnalyze}
              >
                Analyze match
              </button>
            </ReviewInput>
          </div>

          {analysis && (
            <>
              <div className="review-save-bar">
                <button
                  className="button primary"
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveReview}
                >
                  {isSaving ? "Saving review..." : "Save review"}
                </button>
                {saveMessage && (
                  <p className="success-message" role="status">
                    {saveMessage}
                  </p>
                )}
              </div>
              <ReviewResultDisplay
                analysis={analysis}
                questions={questions}
              />
            </>
          )}
        </>
      )}

      <div className="panel review-history">
        <div className="panel-inner">
          <p className="eyebrow">Saved work</p>
          <h2>Review history</h2>
          {!reviews.length ? (
            <p className="muted">
              No saved reviews yet. Analyze a role and save the result
              when it is useful.
            </p>
          ) : (
            <div className="list">
              {reviews.map((review) => (
                <Link
                  className="list-row"
                  key={review.id}
                  to={`/reviews/${review.id}`}
                >
                  <div>
                    <h3>
                      {review.company} · {review.roleTitle}
                    </h3>
                    <p>
                      {review.resumeName}
                      {` · ${formatReviewDate(review.createdAt)}`}
                    </p>
                  </div>
                  <span className="status">
                    {review.score === null
                      ? "No score"
                      : `${review.score}%`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildCandidateContext(profile: CandidateProfile | null) {
  if (!profile) {
    return "";
  }

  return [
    profile.targetRoles,
    profile.workRights,
    profile.preferredLocations,
    profile.technicalSkills,
    profile.experienceSummary,
  ]
    .filter(Boolean)
    .join("\n");
}

function hasCandidateContext(profile: CandidateProfile | null) {
  return Boolean(buildCandidateContext(profile).trim());
}

type ReviewInputProps = {
  label: string;
  selectId: string;
  textId: string;
  value: string;
  options: Array<{ id: number; label: string }>;
  text: string;
  onSelect: (value: string) => void;
  onTextChange: (value: string) => void;
  children?: ReactNode;
};

function ReviewInput({
  label,
  selectId,
  textId,
  value,
  options,
  text,
  onSelect,
  onTextChange,
  children,
}: ReviewInputProps) {
  return (
    <div className="panel">
      <div className="panel-inner form-grid">
        <div className="field">
          <label htmlFor={selectId}>{label}</label>
          <select
            id={selectId}
            value={value}
            onChange={(event) => onSelect(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={textId}>{label} text</label>
          <textarea
            id={textId}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
