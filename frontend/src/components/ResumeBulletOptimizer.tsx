import { useEffect, useMemo, useState } from "react";
import type { ResumeAnalysis } from "../types/resumeAnalysis";
import type { Resume } from "../types/resume";
import { createResume, getResumes } from "../utils/api";
import { analyzeResume } from "../utils/resumeAnalysis";
import { buildResumeBullet } from "../utils/resumeBulletOptimizer";

type ResumeBulletOptimizerProps = {
  analysis: ResumeAnalysis;
  jobDescription?: string;
};

export default function ResumeBulletOptimizer({
  analysis,
  jobDescription = "",
}: ResumeBulletOptimizerProps) {
  const skills = useMemo(
    () =>
      [
        ...new Set(
          [
            ...analysis.missing,
            ...analysis.transferable,
            ...analysis.matched,
          ].map((item) => item.skill),
        ),
      ],
    [analysis],
  );
  const [selectedSkill, setSelectedSkill] = useState(skills[0] ?? "");
  const [originalBullet, setOriginalBullet] = useState("");
  const [action, setAction] = useState("");
  const [tools, setTools] = useState(skills[0] ?? "");
  const [result, setResult] = useState("");
  const [draft, setDraft] = useState("");
  const [checks, setChecks] = useState<string[]>([]);
  const [copyMessage, setCopyMessage] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [changeMessage, setChangeMessage] = useState("");
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isSavingVersion, setIsSavingVersion] = useState(false);

  const selectedResume = resumes.find(
    (resume) => String(resume.id) === selectedResumeId,
  );
  const beforeScore =
    selectedResume && jobDescription
      ? analyzeResume(selectedResume.content, jobDescription).score
      : null;
  const afterScore =
    previewContent && jobDescription
      ? analyzeResume(previewContent, jobDescription).score
      : null;

  useEffect(() => {
    async function loadResumes() {
      try {
        const loadedResumes = await getResumes();
        setResumes(loadedResumes);
        if (loadedResumes[0]) {
          setSelectedResumeId(String(loadedResumes[0].id));
        }
      } catch {
        setChangeMessage("Resume versions could not be loaded.");
      } finally {
        setIsLoadingResumes(false);
      }
    }

    loadResumes();
  }, []);

  function chooseSkill(skill: string) {
    setSelectedSkill(skill);
    setTools((current) => current || skill);
    setDraft("");
    setCopyMessage("");
  }

  function generateDraft() {
    const generated = buildResumeBullet({ action, tools, result });
    setDraft(generated.bullet);
    setChecks(generated.checks);
    setCopyMessage("");
  }

  async function copyDraft() {
    if (!draft) {
      return;
    }

    try {
      await navigator.clipboard.writeText(draft);
      setCopyMessage("Draft copied. Review it before adding it to your resume.");
    } catch {
      setCopyMessage("Copy failed. Select the draft and copy it manually.");
    }
  }

  function chooseResume(resumeId: string) {
    setSelectedResumeId(resumeId);
    setPreviewContent("");
    setChangeMessage("");
  }

  function insertDraft() {
    if (!selectedResume || !draft) {
      setChangeMessage("Choose a resume and build a bullet first.");
      return;
    }

    const sourceBullet = originalBullet.trim();
    if (
      sourceBullet &&
      selectedResume.content.includes(sourceBullet)
    ) {
      setPreviewContent(
        selectedResume.content.replace(sourceBullet, draft),
      );
      setChangeMessage(
        "The original bullet was replaced in this unsaved preview.",
      );
      return;
    }

    setPreviewContent(
      `${selectedResume.content.trimEnd()}\n\n• ${draft}`,
    );
    setChangeMessage(
      sourceBullet
        ? "The original bullet was not found, so the draft was appended to the preview."
        : "The draft was appended to this unsaved preview.",
    );
  }

  function undoInsert() {
    setPreviewContent("");
    setChangeMessage(
      "Preview change undone. The saved resume was never modified.",
    );
  }

  async function saveNewVersion() {
    if (!selectedResume || !previewContent) {
      setChangeMessage("Insert the draft before saving a new version.");
      return;
    }

    setIsSavingVersion(true);
    setChangeMessage("");

    try {
      const savedResume = await createResume({
        name: `${selectedResume.name} – ${selectedSkill} version`,
        purpose:
          selectedResume.purpose ||
          `Targeted evidence for ${selectedSkill}`,
        content: previewContent,
      });
      setResumes((current) => [savedResume, ...current]);
      setSelectedResumeId(String(savedResume.id));
      setPreviewContent("");
      setChangeMessage(
        `Saved "${savedResume.name}" as a separate resume version.`,
      );
    } catch {
      setChangeMessage("The new resume version could not be saved.");
    } finally {
      setIsSavingVersion(false);
    }
  }

  return (
    <div className="panel resume-bullet-optimizer">
      <div className="panel-inner">
        <p className="eyebrow">Local optimisation assistant</p>
        <h2>Build an evidence-first resume bullet</h2>
        <p className="muted">
          This browser-only builder structures facts you provide. It
          does not invent experience, achievements, or numbers.
        </p>

        {skills.length === 0 ? (
          <p className="muted">
            Run a review with recognized requirements before building a
            targeted bullet.
          </p>
        ) : (
          <div className="grid two">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="bullet-target-skill">
                  Requirement to evidence
                </label>
                <select
                  id="bullet-target-skill"
                  value={selectedSkill}
                  onChange={(event) => chooseSkill(event.target.value)}
                >
                  {skills.map((skill) => (
                    <option key={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="original-resume-bullet">
                  Original bullet (optional)
                </label>
                <textarea
                  id="original-resume-bullet"
                  value={originalBullet}
                  placeholder="Helped with a university project."
                  onChange={(event) =>
                    setOriginalBullet(event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="bullet-action">
                  What did you personally do?
                </label>
                <input
                  id="bullet-action"
                  value={action}
                  placeholder="Built a job application tracking API"
                  onChange={(event) => setAction(event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="bullet-tools">
                  Which real tools or skills did you use?
                </label>
                <input
                  id="bullet-tools"
                  value={tools}
                  placeholder={selectedSkill || "Java, Spring Boot, SQL"}
                  onChange={(event) => setTools(event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="bullet-result">
                  What was the truthful result or evidence?
                </label>
                <input
                  id="bullet-result"
                  value={result}
                  placeholder="supporting authenticated CRUD workflows"
                  onChange={(event) => setResult(event.target.value)}
                />
                <span className="field-help">
                  Use a number only when you can explain and verify it.
                </span>
              </div>

              <button
                className="button primary"
                type="button"
                onClick={generateDraft}
              >
                Build local draft
              </button>
            </div>

            <div className="resume-bullet-preview">
              <p className="eyebrow">Editable draft</p>
              {originalBullet && (
                <div>
                  <strong>Before</strong>
                  <p>{originalBullet}</p>
                </div>
              )}
              {draft ? (
                <>
                  <div>
                    <strong>After</strong>
                    <p>{draft}</p>
                  </div>
                  {checks.length > 0 && (
                    <ul>
                      {checks.map((check) => (
                        <li key={check}>{check}</li>
                      ))}
                    </ul>
                  )}
                  <div className="form-actions">
                    <button
                      className="button"
                      type="button"
                      onClick={copyDraft}
                    >
                      Copy draft
                    </button>
                  </div>
                  {copyMessage && (
                    <p className="success-message" role="status">
                      {copyMessage}
                    </p>
                  )}
                </>
              ) : (
                <p className="muted">
                  Add your real action, tools, and result to create a
                  draft.
                </p>
              )}
            </div>
          </div>
        )}

        {draft && (
          <div className="resume-version-workflow">
            <p className="eyebrow">Save workflow</p>
            <h3>Insert into a new resume version</h3>
            {isLoadingResumes ? (
              <p className="muted">Loading resume library...</p>
            ) : resumes.length === 0 ? (
              <p className="info-message">
                Save a resume in the Resume Library before inserting
                this draft.
              </p>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="bullet-resume-version">
                    Source resume
                  </label>
                  <select
                    id="bullet-resume-version"
                    value={selectedResumeId}
                    onChange={(event) =>
                      chooseResume(event.target.value)
                    }
                  >
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={insertDraft}
                  >
                    Insert into preview
                  </button>
                  {previewContent && (
                    <>
                      <button
                        className="button"
                        type="button"
                        onClick={undoInsert}
                      >
                        Undo
                      </button>
                      <button
                        className="button primary"
                        type="button"
                        disabled={isSavingVersion}
                        onClick={saveNewVersion}
                      >
                        {isSavingVersion
                          ? "Saving version..."
                          : "Save as new version"}
                      </button>
                    </>
                  )}
                </div>
                {previewContent && (
                  <>
                    <div className="resume-score-comparison">
                      <span>
                        Before:{" "}
                        {beforeScore === null
                          ? "Not available"
                          : `${beforeScore}%`}
                      </span>
                      <span>
                        After:{" "}
                        {afterScore === null
                          ? "Not available"
                          : `${afterScore}%`}
                      </span>
                    </div>
                    <details>
                      <summary>Review complete resume preview</summary>
                      <pre className="resume-version-preview">
                        {previewContent}
                      </pre>
                    </details>
                  </>
                )}
                {changeMessage && (
                  <p className="info-message" role="status">
                    {changeMessage}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
