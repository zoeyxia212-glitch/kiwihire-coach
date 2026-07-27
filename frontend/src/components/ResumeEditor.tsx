import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Resume } from "../types/resume";
import {
  createResume,
  deleteResume,
  getResumes,
  updateResume,
} from "../utils/api";
import { parseDocumentFile } from "../utils/documentFileParser";

type ResumeSortOption =
  | "Recently updated"
  | "Recently created"
  | "Name A–Z";

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
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileMessage, setFileMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] =
    useState<ResumeSortOption>("Recently updated");

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

  function duplicateResume(resume: Resume) {
    setEditingId(null);
    setName(`${resume.name} copy`);
    setPurpose(resume.purpose ?? "");
    setContent(resume.content);
    setError("");
    setSuccess("");
    setFileMessage(
      `Created an unsaved copy of "${resume.name}". Rename or edit it, then save as a new version.`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      content.trim() &&
      !window.confirm(
        "Replace the text currently in the editor with this file?",
      )
    ) {
      return;
    }

    setIsParsingFile(true);
    setError("");
    setSuccess("");
    setFileMessage("");

    try {
      const parsedFile = await parseDocumentFile(file);
      setEditingId(null);
      setName(parsedFile.suggestedName);
      setPurpose("");
      setContent(parsedFile.text);
      setFileMessage(
        `Extracted ${parsedFile.text.length.toLocaleString()} characters from ${file.name}. Review the text before saving.`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The resume file could not be read.",
      );
    } finally {
      setIsParsingFile(false);
    }
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

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredResumes = resumes
    .filter((resume) =>
      [resume.name, resume.purpose]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    )
    .sort(resumeSorter(sortBy));

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

          <div className="resume-upload">
            <div>
              <h3>Import a resume file</h3>
              <p className="muted">
                PDF, DOCX, or TXT · Maximum 10 MB · Processed locally
                in your browser
              </p>
            </div>
            <label className="button" htmlFor="resume-file">
              {isParsingFile ? "Reading file..." : "Choose file"}
            </label>
            <input
              id="resume-file"
              className="visually-hidden"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              disabled={isParsingFile}
              onChange={handleFileChange}
            />
          </div>

          {fileMessage && (
            <p className="info-message" role="status">
              {fileMessage}
            </p>
          )}

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

          {resumes.length > 0 && (
            <div className="resume-filters">
              <div className="field">
                <label htmlFor="resume-search">Search resumes</label>
                <input
                  id="resume-search"
                  type="search"
                  value={searchTerm}
                  placeholder="Name or purpose..."
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="resume-sort">Sort by</label>
                <select
                  id="resume-sort"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as ResumeSortOption)
                  }
                >
                  <option>Recently updated</option>
                  <option>Recently created</option>
                  <option>Name A–Z</option>
                </select>
              </div>
            </div>
          )}

          {isLoading && (
            <p className="muted">Loading resumes...</p>
          )}

          {!isLoading && resumes.length === 0 && (
            <p className="muted">
              No resumes yet. Paste your first version to begin.
            </p>
          )}

          <div className="resume-list">
            {filteredResumes.map((resume) => (
              <article className="resume-card" key={resume.id}>
                <div>
                  <h3>{resume.name}</h3>
                  <p>
                    {resume.purpose || "General resume"}
                    {` · ${resume.content.length.toLocaleString()} characters`}
                  </p>
                  <p>Updated {formatResumeDate(resume.updatedAt)}</p>
                </div>
                <div className="form-actions">
                  <Link
                    className="button compact"
                    to={`/review?resume=${resume.id}`}
                  >
                    Use in review
                  </Link>
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
                    onClick={() => duplicateResume(resume)}
                  >
                    Duplicate
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

          {!isLoading &&
            resumes.length > 0 &&
            filteredResumes.length === 0 && (
              <div className="empty-filter-result">
                <h3>No resumes match this search</h3>
                <p className="muted">
                  Try another name or purpose.
                </p>
                <button
                  className="button compact"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

function resumeSorter(sortBy: ResumeSortOption) {
  return (first: Resume, second: Resume) => {
    if (sortBy === "Name A–Z") {
      return first.name.localeCompare(second.name);
    }

    const firstDate =
      sortBy === "Recently created" ? first.createdAt : first.updatedAt;
    const secondDate =
      sortBy === "Recently created" ? second.createdAt : second.updatedAt;

    return new Date(secondDate).getTime() - new Date(firstDate).getTime();
  };
}

function formatResumeDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
