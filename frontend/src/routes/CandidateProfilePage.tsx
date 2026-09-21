import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createEvidenceItem,
  deleteEvidenceItem,
  getCandidateProfile,
  getEvidenceItems,
  saveCandidateProfile,
  updateEvidenceItem,
} from "../utils/api";
import { getCandidateProfileProgress } from "../utils/candidateProfileProgress";
import type { CandidateProfile } from "../types/candidateProfile";
import type { EvidenceItem } from "../types/evidenceItem";
import { useUnsavedChangesWarning } from "../hooks/useUnsavedChangesWarning";

const emptyEvidenceForm = {
  title: "",
  context: "",
  action: "",
  result: "",
  skills: "",
};

function profileKey(profile: Omit<CandidateProfile, "id" | "updatedAt">) {
  return JSON.stringify(profile);
}

export default function CandidateProfilePage() {
  const [preferredName, setPreferredName] = useState("");
  const [targetRoles, setTargetRoles] = useState("");
  const [workRights, setWorkRights] = useState("");
  const [preferredLocations, setPreferredLocations] = useState("");
  const [careerStage, setCareerStage] = useState("");
  const [technicalSkills, setTechnicalSkills] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [starExamples, setStarExamples] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [evidenceForm, setEvidenceForm] = useState(emptyEvidenceForm);
  const [editingEvidenceId, setEditingEvidenceId] = useState<number | null>(null);
  const [savedEvidenceKey, setSavedEvidenceKey] = useState(
    JSON.stringify(emptyEvidenceForm),
  );
  const [isSavingEvidence, setIsSavingEvidence] = useState(false);
  const [evidenceMessage, setEvidenceMessage] = useState("");
  const [savedProfileKey, setSavedProfileKey] = useState(() => profileKey({
    preferredName: "",
    targetRoles: "",
    workRights: "",
    preferredLocations: "",
    careerStage: "",
    technicalSkills: "",
    experienceSummary: "",
    starExamples: "",
  }));
  const currentProfileValues = {
    preferredName,
    targetRoles,
    workRights,
    preferredLocations,
    careerStage,
    technicalSkills,
    experienceSummary,
    starExamples,
  };
  const hasProfileChanges = profileKey(currentProfileValues) !== savedProfileKey;
  const hasEvidenceChanges = JSON.stringify(evidenceForm) !== savedEvidenceKey;

  useUnsavedChangesWarning(!isLoading && (hasProfileChanges || hasEvidenceChanges));

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profile, items] = await Promise.all([
          getCandidateProfile(),
          getEvidenceItems(),
        ]);
        setPreferredName(profile.preferredName);
        setTargetRoles(profile.targetRoles);
        setWorkRights(profile.workRights);
        setPreferredLocations(profile.preferredLocations);
        setCareerStage(profile.careerStage);
        setTechnicalSkills(profile.technicalSkills);
        setExperienceSummary(profile.experienceSummary);
        setStarExamples(profile.starExamples);
        setSavedProfileKey(profileKey({
          preferredName: profile.preferredName,
          targetRoles: profile.targetRoles,
          workRights: profile.workRights,
          preferredLocations: profile.preferredLocations,
          careerStage: profile.careerStage,
          technicalSkills: profile.technicalSkills,
          experienceSummary: profile.experienceSummary,
          starExamples: profile.starExamples,
        }));
        setEvidenceItems(items);
      } catch {
        setError("Your candidate profile could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const savedProfile = await saveCandidateProfile(currentProfileValues);
      setPreferredName(savedProfile.preferredName);
      setTargetRoles(savedProfile.targetRoles);
      setWorkRights(savedProfile.workRights);
      setPreferredLocations(savedProfile.preferredLocations);
      setCareerStage(savedProfile.careerStage);
      setTechnicalSkills(savedProfile.technicalSkills);
      setExperienceSummary(savedProfile.experienceSummary);
      setStarExamples(savedProfile.starExamples);
      setSavedProfileKey(profileKey({
        preferredName: savedProfile.preferredName,
        targetRoles: savedProfile.targetRoles,
        workRights: savedProfile.workRights,
        preferredLocations: savedProfile.preferredLocations,
        careerStage: savedProfile.careerStage,
        technicalSkills: savedProfile.technicalSkills,
        experienceSummary: savedProfile.experienceSummary,
        starExamples: savedProfile.starExamples,
      }));
      setSuccess("Candidate profile saved.");
    } catch {
      setError("Your candidate profile could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateEvidenceField(
    field: keyof typeof emptyEvidenceForm,
    value: string,
  ) {
    setEvidenceForm((current) => ({ ...current, [field]: value }));
  }

  function startEditingEvidence(item: EvidenceItem) {
    if (
      hasEvidenceChanges
      && !window.confirm("Discard your unsaved evidence changes?")
    ) {
      return;
    }
    const itemForm = {
      title: item.title,
      context: item.context,
      action: item.action,
      result: item.result,
      skills: item.skills,
    };
    setEditingEvidenceId(item.id);
    setEvidenceForm(itemForm);
    setSavedEvidenceKey(JSON.stringify(itemForm));
    setEvidenceMessage("");
  }

  function resetEvidenceForm() {
    setEditingEvidenceId(null);
    setEvidenceForm(emptyEvidenceForm);
    setSavedEvidenceKey(JSON.stringify(emptyEvidenceForm));
  }

  function discardEvidenceForm() {
    if (
      hasEvidenceChanges
      && !window.confirm("Discard your unsaved evidence changes?")
    ) {
      return;
    }
    resetEvidenceForm();
  }

  async function handleEvidenceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingEvidence(true);
    setEvidenceMessage("");

    try {
      const savedItem = editingEvidenceId
        ? await updateEvidenceItem(editingEvidenceId, evidenceForm)
        : await createEvidenceItem(evidenceForm);
      setEvidenceItems((current) => [
        savedItem,
        ...current.filter((item) => item.id !== savedItem.id),
      ]);
      resetEvidenceForm();
      setEvidenceMessage(
        editingEvidenceId ? "Evidence updated." : "Evidence added.",
      );
    } catch {
      setEvidenceMessage("Evidence could not be saved.");
    } finally {
      setIsSavingEvidence(false);
    }
  }

  async function handleDeleteEvidence(itemId: number) {
    if (!window.confirm("Delete this evidence item?")) {
      return;
    }
    try {
      await deleteEvidenceItem(itemId);
      setEvidenceItems((current) =>
        current.filter((item) => item.id !== itemId),
      );
      if (editingEvidenceId === itemId) {
        resetEvidenceForm();
      }
      setEvidenceMessage("Evidence deleted.");
    } catch {
      setEvidenceMessage("Evidence could not be deleted.");
    }
  }

  if (isLoading) {
    return <p className="muted">Loading candidate profile...</p>;
  }

  const currentProfile: CandidateProfile = {
    id: null,
    preferredName,
    targetRoles,
    workRights,
    preferredLocations,
    careerStage,
    technicalSkills,
    experienceSummary,
    starExamples,
    updatedAt: null,
  };
  const progress = getCandidateProfileProgress(currentProfile);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Your job-search context</p>
          <h1>Candidate profile</h1>
          <p className="muted">
            Save the background that should be considered across every
            role, resume review, and interview preparation session.
          </p>
        </div>
      </div>

      <div className="panel profile-progress">
        <div className="panel-inner">
          <div className="progress-heading">
            <div>
              <p className="eyebrow">Profile completeness</p>
              <h2>{progress.percentage}% complete</h2>
            </div>
            <strong>
              {progress.completed} / {progress.total}
            </strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Candidate Profile completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percentage}
          >
            <span style={{ width: `${progress.percentage}%` }} />
          </div>
          <p className="muted">
            {progress.missing.length
              ? `Still to add: ${progress.missing.join(", ")}.`
              : "Your profile has enough context to support role-specific reviews."}
          </p>
        </div>
      </div>

      <section className="evidence-library" aria-labelledby="evidence-heading">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Reusable proof</p>
            <h2 id="evidence-heading">Evidence bank</h2>
          </div>
          <p>
            Store real examples once, then reuse them when tailoring a CV
            or preparing an interview answer.
          </p>
        </div>

        <div className="grid two evidence-layout">
          <form className="panel" onSubmit={handleEvidenceSubmit}>
            <div className="panel-inner form-grid">
              <div>
                <p className="eyebrow">
                  {editingEvidenceId ? "Edit evidence" : "Add evidence"}
                </p>
                <h3>{editingEvidenceId ? "Improve this example" : "Capture a real example"}</h3>
              </div>
              <div className="field">
                <label htmlFor="evidence-title">Short title</label>
                <input id="evidence-title" required maxLength={160}
                  value={evidenceForm.title}
                  placeholder="Fixed a frontend-to-backend API failure"
                  onChange={(event) => updateEvidenceField("title", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="evidence-context">Situation and task</label>
                <textarea id="evidence-context" required maxLength={1000}
                  value={evidenceForm.context}
                  placeholder="What was happening, and what did you need to achieve?"
                  onChange={(event) => updateEvidenceField("context", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="evidence-action">Your action</label>
                <textarea id="evidence-action" required maxLength={3000}
                  value={evidenceForm.action}
                  placeholder="Explain what you personally investigated, decided, and changed."
                  onChange={(event) => updateEvidenceField("action", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="evidence-result">Result</label>
                <textarea id="evidence-result" required maxLength={2000}
                  value={evidenceForm.result}
                  placeholder="What improved? Add a number or observable outcome when possible."
                  onChange={(event) => updateEvidenceField("result", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="evidence-skills">Skills demonstrated</label>
                <input id="evidence-skills" required maxLength={1000}
                  value={evidenceForm.skills}
                  placeholder="Java, REST API, debugging, communication"
                  onChange={(event) => updateEvidenceField("skills", event.target.value)} />
              </div>
              <div className="form-actions">
                <button className="button primary" type="submit" disabled={isSavingEvidence}>
                  {isSavingEvidence ? "Saving..." : editingEvidenceId ? "Update evidence" : "Add evidence"}
                </button>
                {editingEvidenceId && (
                  <button className="button" type="button" onClick={discardEvidenceForm}>Cancel</button>
                )}
              </div>
              {evidenceMessage && <p className="muted" role="status">{evidenceMessage}</p>}
            </div>
          </form>

          <div className="evidence-list">
            {evidenceItems.length === 0 ? (
              <div className="panel"><div className="panel-inner">
                <p className="eyebrow">No evidence yet</p>
                <h3>Start with one project problem you solved.</h3>
                <p className="muted">A strong example explains your decision and its result, not only the technology used.</p>
              </div></div>
            ) : evidenceItems.map((item) => (
              <article className="panel evidence-card" key={item.id}>
                <div className="panel-inner">
                  <div className="evidence-card-heading">
                    <div><p className="eyebrow">Evidence</p><h3>{item.title}</h3></div>
                    <div className="form-actions">
                      <button className="button small" type="button" onClick={() => startEditingEvidence(item)}>Edit</button>
                      <button className="button small danger" type="button" onClick={() => handleDeleteEvidence(item.id)}>Delete</button>
                    </div>
                  </div>
                  <dl className="evidence-details">
                    <div><dt>Situation and task</dt><dd>{item.context}</dd></div>
                    <div><dt>Your action</dt><dd>{item.action}</dd></div>
                    <div><dt>Result</dt><dd>{item.result}</dd></div>
                  </dl>
                  <div className="keyword-pills">
                    {item.skills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                      <span className="pill" key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <form className="panel" onSubmit={handleSubmit}>
        <div className="panel-inner form-grid">
          <div className="field">
            <label htmlFor="preferred-name">Preferred name</label>
            <input
              id="preferred-name"
              value={preferredName}
              maxLength={120}
              placeholder="Zoey Xia"
              autoComplete="name"
              onChange={(event) => setPreferredName(event.target.value)}
            />
            <small>Used to sign generated application documents.</small>
          </div>

          <div className="field">
            <label htmlFor="target-roles">Target roles</label>
            <input
              id="target-roles"
              value={targetRoles}
              maxLength={300}
              placeholder="Graduate Developer, Junior Software Engineer"
              onChange={(event) => setTargetRoles(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="work-rights">New Zealand work rights</label>
            <select
              id="work-rights"
              value={workRights}
              onChange={(event) => setWorkRights(event.target.value)}
            >
              <option value="">Prefer not to say</option>
              <option value="NZ citizen">NZ citizen</option>
              <option value="NZ permanent resident">
                NZ permanent resident
              </option>
              <option value="Open work visa">Open work visa</option>
              <option value="Employer-sponsored visa required">
                Employer-sponsored visa required
              </option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="career-stage">Career stage</label>
            <select
              id="career-stage"
              value={careerStage}
              onChange={(event) => setCareerStage(event.target.value)}
            >
              <option value="">Not specified</option>
              <option value="Graduate">Graduate</option>
              <option value="Junior professional">
                Junior professional
              </option>
              <option value="Career changer">Career changer</option>
              <option value="Returning to work">
                Returning to work
              </option>
              <option value="Experienced professional">
                Experienced professional
              </option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="preferred-locations">
              Preferred locations
            </label>
            <input
              id="preferred-locations"
              value={preferredLocations}
              maxLength={300}
              placeholder="Auckland, Wellington, remote"
              onChange={(event) =>
                setPreferredLocations(event.target.value)
              }
            />
          </div>

          <div className="field">
            <label htmlFor="technical-skills">Technical skills</label>
            <textarea
              id="technical-skills"
              value={technicalSkills}
              maxLength={1000}
              placeholder="Java, Spring Boot, React, TypeScript, SQL..."
              onChange={(event) =>
                setTechnicalSkills(event.target.value)
              }
            />
          </div>

          <div className="field">
            <label htmlFor="experience-summary">
              Experience summary
            </label>
            <textarea
              id="experience-summary"
              className="resume-textarea"
              value={experienceSummary}
              maxLength={5000}
              placeholder="Summarise relevant projects, work experience, education, and transferable experience."
              onChange={(event) =>
                setExperienceSummary(event.target.value)
              }
            />
          </div>

          <div className="field">
            <label htmlFor="star-examples">STAR example library</label>
            <textarea
              id="star-examples"
              className="resume-textarea"
              value={starExamples}
              maxLength={10000}
              placeholder={`Example: Solved an API integration problem
Situation: Our React page could not load Spring Boot data.
Task: I needed to find where the request failed.
Action: I checked the browser network panel, API URL, CORS configuration, and backend logs.
Result: I fixed the incorrect URL and restored the application flow.

Add another real example after a blank line.`}
              onChange={(event) => setStarExamples(event.target.value)}
            />
            <span className="field-help">
              Use real examples only. Separate examples with a blank
              line and include Situation, Task, Action, and Result.
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

          <button
            className="button primary"
            type="submit"
            disabled={isSaving || !hasProfileChanges}
          >
            {isSaving ? "Saving profile..." : "Save profile"}
          </button>
          {hasProfileChanges && (
            <p className="draft-status is-unsaved" role="status">
              Candidate Profile has unsaved changes
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
