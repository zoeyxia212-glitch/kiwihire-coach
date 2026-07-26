import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import type { Resume } from "../types/resume";
import {
  createResume,
  deleteResume,
  getResumes,
  updateResume,
} from "../utils/api";

export default function ResumeEditor() {
  const [searchParams] = useSearchParams();
  const requestedResumeId = searchParams.get("edit");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadResumes() {
      try {
        const loadedResumes = await getResumes();
        setResumes(loadedResumes);

        if (requestedResumeId) {
          const requestedResume = loadedResumes.find(
            (resume) => String(resume.id) === requestedResumeId,
          );

          if (requestedResume) {
            setEditingId(requestedResume.id);
            setName(requestedResume.name);
            setPurpose(requestedResume.purpose ?? "");
            setContent(requestedResume.content);
          } else {
            setError("The requested resume could not be found.");
          }
        }
      } catch {
        setError("Failed to load your resumes.");
      } finally {
        setIsLoading(false);
      }
    }

    loadResumes();
  }, [requestedResumeId]);

  function resetEditor() {
    setEditingId(null);
    setName("");
    setPurpose("");
    setContent("");
    setError("");
    setSuccess("");
  }

  function startEditing(resume: Resume) {
    setEditingId(resume.id);
    setName(resume.name);
    setPurpose(resume.purpose ?? "");
    setContent(resume.content);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const request = { name, purpose, content };
      const savedResume = editingId
        ? await updateResume(editingId, request)
        : await createResume(request);

      setResumes((currentResumes) => [
        savedResume,
        ...currentResumes.filter(
          (resume) => resume.id !== savedResume.id,
        ),
      ]);
      setEditingId(savedResume.id);
      setSuccess(
        editingId
          ? "Resume updated."
          : "Resume saved to your library.",
      );
    } catch {
      setError("Failed to save your resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(resume: Resume) {
    const confirmed = window.confirm(
      `Delete "${resume.name}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteResume(resume.id);
      setResumes((currentResumes) =>
        currentResumes.filter(
          (currentResume) => currentResume.id !== resume.id,
        ),
      );

      if (editingId === resume.id) {
        resetEditor();
      }
    } catch {
      setError("Failed to delete your resume.");
    }
  }

  return (
    <div className="grid two">
      <form className="panel" onSubmit={handleSubmit}>
        <div className="panel-inner form-grid">
          <div>
            <p className="eyebrow">
              {editingId ? "Editing version" : "New version"}
            </p>
            <h2>
              {editingId ? "Update resume" : "Paste a resume"}
            </h2>
          </div>

          <div className="field">
            <label htmlFor="resume-name">Resume name</label>
            <input
              id="resume-name"
              placeholder="Graduate developer resume"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="resume-purpose">
              Target or purpose (optional)
            </label>
            <input
              id="resume-purpose"
              placeholder="Backend, frontend, cloud, support..."
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              maxLength={80}
            />
          </div>

          <div className="field">
            <label htmlFor="resume-content">Resume text</label>
            <textarea
              id="resume-content"
              className="resume-textarea"
              placeholder="Paste your resume text here..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={50000}
              required
            />
            <span className="field-help">
              {content.length.toLocaleString()} / 50,000 characters
            </span>
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="success-message" role="status">
              {success}
            </p>
          )}

          <div className="form-actions">
            <button
              className="button primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving resume..."
                : editingId
                  ? "Update resume"
                  : "Save resume"}
            </button>
            {editingId && (
              <button
                className="button"
                type="button"
                onClick={resetEditor}
              >
                Create another
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="panel">
        <div className="panel-inner">
          <p className="eyebrow">Saved versions</p>
          <h2>Your resume library</h2>

          {isLoading && (
            <p className="muted">Loading resumes...</p>
          )}

          {!isLoading && resumes.length === 0 && (
            <p className="muted">
              No resumes yet. Paste your first version to begin.
            </p>
          )}

          <div className="resume-list">
            {resumes.map((resume) => (
              <article className="resume-card" key={resume.id}>
                <div>
                  <h3>{resume.name}</h3>
                  <p>
                    {resume.purpose || "General resume"}
                    {` · ${resume.content.length.toLocaleString()} characters`}
                  </p>
                </div>
                <div className="form-actions">
                  <button
                    className="button compact"
                    type="button"
                    onClick={() => startEditing(resume)}
                  >
                    Edit
                  </button>
                  <button
                    className="button compact"
                    type="button"
                    onClick={() => handleDelete(resume)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
