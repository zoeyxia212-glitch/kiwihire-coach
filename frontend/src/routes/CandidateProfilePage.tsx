import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getCandidateProfile, saveCandidateProfile } from "../utils/api";
import { getCandidateProfileProgress } from "../utils/candidateProfileProgress";
import type { CandidateProfile } from "../types/candidateProfile";

export default function CandidateProfilePage() {
  const [targetRoles, setTargetRoles] = useState("");
  const [workRights, setWorkRights] = useState("");
  const [preferredLocations, setPreferredLocations] = useState("");
  const [technicalSkills, setTechnicalSkills] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getCandidateProfile();
        setTargetRoles(profile.targetRoles);
        setWorkRights(profile.workRights);
        setPreferredLocations(profile.preferredLocations);
        setTechnicalSkills(profile.technicalSkills);
        setExperienceSummary(profile.experienceSummary);
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
      await saveCandidateProfile({
        targetRoles,
        workRights,
        preferredLocations,
        technicalSkills,
        experienceSummary,
      });
      setSuccess("Candidate profile saved.");
    } catch {
      setError("Your candidate profile could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="muted">Loading candidate profile...</p>;
  }

  const currentProfile: CandidateProfile = {
    id: null,
    targetRoles,
    workRights,
    preferredLocations,
    technicalSkills,
    experienceSummary,
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

      <form className="panel" onSubmit={handleSubmit}>
        <div className="panel-inner form-grid">
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
            disabled={isSaving}
          >
            {isSaving ? "Saving profile..." : "Save profile"}
          </button>
        </div>
      </form>
    </section>
  );
}
