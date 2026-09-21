import { useEffect, useState } from "react";
import type { EvidenceItem } from "../types/evidenceItem";
import { buildCoverLetterDraft, reviewCoverLetterDraft } from "../utils/coverLetterDraft";
import { useUnsavedChangesWarning } from "../hooks/useUnsavedChangesWarning";
import { downloadCoverLetterDraft } from "../utils/coverLetterExport";
import {
  checkSemanticRelevance,
  type SemanticRelevanceResult,
} from "../utils/semanticRelevance";

type CoverLetterBuilderProps = {
  company: string;
  roleTitle: string;
  candidateName: string;
  contactPerson: string;
  evidenceItems: EvidenceItem[];
  initialDraft: string;
  jobDescription?: string;
  disabled?: boolean;
  onSave: (draft: string) => Promise<void>;
};

// How long to wait after the draft stops changing before running the
// optional local AI relevance check - avoids re-embedding on every
// keystroke while the user is editing the textarea.
const SEMANTIC_CHECK_DEBOUNCE_MS = 700;

export default function CoverLetterBuilder({
  company,
  roleTitle,
  candidateName,
  contactPerson,
  evidenceItems,
  initialDraft,
  jobDescription = "",
  disabled = false,
  onSave,
}: CoverLetterBuilderProps) {
  const [hiringManagerName, setHiringManagerName] = useState(contactPerson);
  const [motivation, setMotivation] = useState("");
  const [draft, setDraft] = useState(initialDraft);
  const [savedDraft, setSavedDraft] = useState(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [semanticCheck, setSemanticCheck] =
    useState<SemanticRelevanceResult | null>(null);
  const [isCheckingSemantic, setIsCheckingSemantic] = useState(false);
  const hasUnsavedChanges = draft !== savedDraft;
  const qualityChecks = reviewCoverLetterDraft(draft, company, roleTitle);
  const passedCheckCount = qualityChecks.filter((check) => check.passed).length;

  useUnsavedChangesWarning(hasUnsavedChanges);

  useEffect(() => {
    setDraft(initialDraft);
    setSavedDraft(initialDraft);
  }, [initialDraft]);

  useEffect(() => {
    setHiringManagerName(contactPerson);
  }, [contactPerson]);

  // Optional pass on top of the deterministic checklist above: a real
  // (small) AI model running entirely in the browser, comparing the
  // draft against this application's job description. Debounced so it
  // only runs once the draft settles, never blocks the UI, and fails
  // silently if the model can't load - see semanticRelevance.ts and
  // docs/product-plan.md, "AI Integration Principles".
  useEffect(() => {
    if (!jobDescription.trim() || !draft.trim()) {
      setSemanticCheck(null);
      setIsCheckingSemantic(false);
      return;
    }

    let cancelled = false;
    setIsCheckingSemantic(true);

    const timer = setTimeout(() => {
      checkSemanticRelevance(draft, jobDescription)
        .then((result) => {
          if (!cancelled) {
            setSemanticCheck(result);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsCheckingSemantic(false);
          }
        });
    }, SEMANTIC_CHECK_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [draft, jobDescription]);

  function handleGenerate() {
    setDraft(buildCoverLetterDraft({
      company,
      roleTitle,
      hiringManagerName,
      candidateName,
      motivation,
      evidenceItems,
    }));
    setMessage(
      evidenceItems.length
        ? "Draft created from your saved evidence. Review every sentence before using it."
        : "Draft created without evidence. Add and select evidence to make it stronger.",
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draft);
      setMessage("Cover letter copied. Review and personalise it before sending.");
    } catch {
      setMessage("Copy failed. Select the draft text and copy it manually.");
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage("");
    try {
      await onSave(draft);
      setSavedDraft(draft);
      setMessage("Cover letter draft saved to this application.");
    } catch {
      setMessage("Cover letter draft could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleRestore() {
    setDraft(savedDraft);
    setMessage("Restored the last saved cover letter draft.");
  }

  return (
    <section className="detail-section" id="cover-letter-builder">
      <div className="panel">
        <div className="panel-inner form-grid">
          <div>
            <p className="eyebrow">Cover letter workspace</p>
            <h2>Build a truthful first draft</h2>
            <p className="muted">
              Uses this role and your saved evidence. Nothing is sent
              automatically and no paid AI service is used.
            </p>
            {!candidateName.trim() && (
              <p className="cover-letter-profile-prompt">
                Add your preferred name in <a href="/profile">Candidate Profile</a>
                {" "}to replace the signature placeholder automatically.
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="cover-letter-manager">Hiring manager (optional)</label>
            <input
              id="cover-letter-manager"
              value={hiringManagerName}
              maxLength={120}
              placeholder="Aroha Smith"
              disabled={disabled}
              onChange={(event) => setHiringManagerName(event.target.value)}
            />
            {contactPerson && (
              <small>Pre-filled from this application&apos;s contact person.</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="cover-letter-motivation">
              Why this company and role?
            </label>
            <textarea
              id="cover-letter-motivation"
              value={motivation}
              maxLength={1500}
              placeholder="Write your genuine reason. Avoid generic praise."
              disabled={disabled}
              onChange={(event) => setMotivation(event.target.value)}
            />
          </div>

          <p className="muted">
            {evidenceItems.length} saved evidence item(s) will be used (maximum 3).
          </p>

          <div className="form-actions">
            <button
              className="button primary"
              type="button"
              disabled={disabled}
              onClick={handleGenerate}
            >
              Create local draft
            </button>
            {draft && (
              <>
                <button
                  className="button"
                  type="button"
                  disabled={disabled || isSaving || !hasUnsavedChanges}
                  onClick={handleSave}
                >
                  {isSaving ? "Saving..." : "Save draft"}
                </button>
                <button className="button" type="button" onClick={handleCopy}>
                  Copy draft
                </button>
                <button
                  className="button"
                  type="button"
                  onClick={() => downloadCoverLetterDraft(draft, company, roleTitle)}
                >
                  Download .txt
                </button>
                {hasUnsavedChanges && (
                  <button
                    className="button"
                    type="button"
                    disabled={disabled || isSaving}
                    onClick={handleRestore}
                  >
                    Restore saved draft
                  </button>
                )}
              </>
            )}
          </div>

          {message && <p className="info-message" role="status">{message}</p>}

          {draft && (
            <>
              <div className="field">
                <label htmlFor="cover-letter-draft">
                  Editable draft
                  <span className={hasUnsavedChanges ? "draft-status is-unsaved" : "draft-status"}>
                    {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
                  </span>
                </label>
                <textarea
                  id="cover-letter-draft"
                  className="resume-textarea"
                  value={draft}
                  maxLength={10000}
                  disabled={disabled}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </div>
              <div className="cover-letter-quality" aria-live="polite">
                <div>
                  <p className="eyebrow">Local quality check</p>
                  <h3>{passedCheckCount}/{qualityChecks.length} checks passed</h3>
                  <p className="muted">
                    {draft.trim() ? draft.trim().split(/\s+/).length : 0} words
                  </p>
                </div>
                <ul>
                  {qualityChecks.map((check) => (
                    <li className={check.passed ? "is-complete" : ""} key={check.label}>
                      <span aria-hidden="true">{check.passed ? "✓" : "○"}</span>
                      <span>
                        <strong>{check.label}</strong>
                        {!check.passed && <small>{check.guidance}</small>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {jobDescription.trim() && (
                <div className="resume-bullet-review">
                  <p className="eyebrow">
                    AI-assisted relevance check (runs locally in your
                    browser)
                  </p>
                  {isCheckingSemantic && (
                    <p className="muted">
                      Loading a small local model in your browser the
                      first time this runs may take a moment...
                    </p>
                  )}
                  {!isCheckingSemantic && semanticCheck?.available === true && (
                    <p>
                      Estimated semantic relevance to this job
                      description:{" "}
                      <strong>
                        {Math.round(semanticCheck.similarity * 100)}%
                      </strong>
                      {semanticCheck.similarity < 0.3 && (
                        <>
                          {" "}
                          - this reads as unrelated to the role. Worth
                          double-checking.
                        </>
                      )}
                    </p>
                  )}
                  {!isCheckingSemantic && semanticCheck?.available === false && (
                    <p className="muted">
                      Local AI check unavailable this time (
                      {semanticCheck.reason}). The checklist above still
                      applies.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
