import { FormEvent, useEffect, useState } from "react";
import type { UserResponse } from "../utils/api";
import {
  changePassword,
  deleteAccount,
  getAccount,
} from "../utils/api";
import { downloadAccountDataExport } from "../utils/accountDataExport";
import {
  inspectAccountDataBackup,
  restoreAccountDataBackup,
  type AccountBackupPreview,
} from "../utils/accountDataImport";
import { PASSWORD_HELP_TEXT, validatePassword } from "../utils/passwordPolicy";

type AccountPageProps = {
  onAccountDeleted: () => void;
};

export default function AccountPage({
  onAccountDeleted,
}: AccountPageProps) {
  const [account, setAccount] = useState<UserResponse | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [backupPreview, setBackupPreview] =
    useState<AccountBackupPreview | null>(null);
  const [isInspectingBackup, setIsInspectingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getAccount()
      .then(setAccount)
      .catch(() => setError("Your account details could not be loaded."));
  }, []);

  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      setError(passwordCheck.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Choose a new password that is different.");
      return;
    }

    setIsSaving(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your password could not be changed.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (deleteConfirmation !== "DELETE") {
      setError("Type DELETE exactly to confirm.");
      return;
    }

    if (
      !window.confirm(
        "Permanently delete your account and all KiwiHire Coach data?",
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAccount(deletePassword, deleteConfirmation);
      onAccountDeleted();
      window.location.assign("/register");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your account could not be deleted.",
      );
      setIsDeleting(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    setError("");
    setSuccess("");
    try {
      await downloadAccountDataExport();
      setSuccess("Your private KiwiHire data backup was downloaded.");
    } catch {
      setError("Your data backup could not be created. No partial file was downloaded.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleBackupSelection(file: File | undefined) {
    setBackupPreview(null);
    setError("");
    setSuccess("");
    if (!file) return;

    setIsInspectingBackup(true);
    try {
      setBackupPreview(await inspectAccountDataBackup(file));
      setSuccess("Backup validated. No data has been imported or changed.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "The backup could not be read.");
    } finally {
      setIsInspectingBackup(false);
    }
  }

  async function handleRestore() {
    if (!backupPreview) return;
    if (!window.confirm(
      "Restore this backup into the current empty account? Existing data will never be overwritten.",
    )) return;

    setIsRestoringBackup(true);
    setError("");
    setSuccess("");
    try {
      const result = await restoreAccountDataBackup(backupPreview.data);
      const snapshotMessage = result.restoredSubmissionSnapshots > 0
        ? ` ${result.restoredSubmissionSnapshots} frozen submission snapshot(s) restored.`
        : "";
      setSuccess(
        `Restore complete: ${result.applications} applications, ${result.resumes} resumes, ${result.reviews} reviews, and ${result.timelineEvents} timeline events created.${snapshotMessage}`,
      );
      setBackupPreview(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "The backup could not be restored.");
    } finally {
      setIsRestoringBackup(false);
    }
  }

  return (
    <section className="page account-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Private workspace</p>
          <h1>Account</h1>
          <p className="muted">
            Manage your sign-in details and personal workspace.
          </p>
        </div>
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

      <div className="grid two">
        <div className="panel">
          <div className="panel-inner">
            <p className="eyebrow">Account details</p>
            <h2>{account?.email ?? "Loading account..."}</h2>
            {account && (
              <p className="muted">
                Joined {formatAccountDate(account.createdAt)}
              </p>
            )}
          </div>
        </div>

        <form className="panel" onSubmit={handlePasswordChange}>
          <div className="panel-inner form-grid">
            <div>
              <p className="eyebrow">Security</p>
              <h2>Change password</h2>
            </div>
            <PasswordField
              id="current-password"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
            <PasswordField
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              helpText={PASSWORD_HELP_TEXT}
            />
            <PasswordField
              id="confirm-new-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            <button
              className="button primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Changing password..." : "Change password"}
            </button>
          </div>
        </form>
      </div>

      <section className="panel account-data-export">
        <div className="panel-inner">
          <div>
            <p className="eyebrow">Your data</p>
            <h2>Download a private backup</h2>
            <p className="muted">
              Export your profile, applications, timelines, resumes, reviews,
              evidence, saved answers, learning goals, and feedback as JSON.
              The file may contain sensitive CV and job-search information.
            </p>
          </div>
          <button
            className="button primary"
            type="button"
            disabled={isExporting}
            onClick={handleExport}
          >
            {isExporting ? "Preparing backup..." : "Download my data"}
          </button>
        </div>
      </section>

      <section className="panel account-backup-import">
        <div className="panel-inner">
          <div>
            <p className="eyebrow">Safe restore preview</p>
            <h2>Inspect a backup before importing</h2>
            <p className="muted">
              KiwiHire validates the file locally first. Selecting a file does
              not create, replace, or delete any records.
            </p>
          </div>
          <label className="button backup-file-button">
            {isInspectingBackup ? "Checking backup..." : "Choose backup file"}
            <input
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              disabled={isInspectingBackup}
              onChange={(event) => void handleBackupSelection(event.target.files?.[0])}
            />
          </label>
          {backupPreview && (
            <div className="backup-preview" aria-label="Backup contents">
              <div>
                <strong>{backupPreview.accountEmail}</strong>
                <span>Exported {formatBackupDate(backupPreview.exportedAt)}</span>
              </div>
              {Object.entries(backupPreview.counts).map(([label, count]) => (
                <span key={label}><strong>{count}</strong>{humanizeBackupLabel(label)}</span>
              ))}
              <p>
                Restore creates new record IDs and never overwrites existing
                workspace data, including frozen submission snapshots.
              </p>
              <button
                className="button primary"
                type="button"
                disabled={isRestoringBackup}
                onClick={handleRestore}
              >
                {isRestoringBackup
                  ? "Restoring backup..."
                  : "Restore into empty account"}
              </button>
            </div>
          )}
        </div>
      </section>

      <form className="panel danger-zone" onSubmit={handleDelete}>
        <div className="panel-inner form-grid">
          <div>
            <p className="eyebrow">Danger zone</p>
            <h2>Delete account and personal data</h2>
            <p className="muted">
              This permanently deletes applications, timelines,
              resumes, reviews, answers, learning goals, and profile
              details. It cannot be undone.
            </p>
          </div>
          <PasswordField
            id="delete-current-password"
            label="Current password"
            value={deletePassword}
            onChange={setDeletePassword}
          />
          <div className="field">
            <label htmlFor="delete-confirmation">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirmation"
              value={deleteConfirmation}
              autoComplete="off"
              onChange={(event) =>
                setDeleteConfirmation(event.target.value)
              }
              required
            />
          </div>
          <button
            className="button danger"
            type="submit"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting account..." : "Delete my account"}
          </button>
        </div>
      </form>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  helpText,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="password"
        value={value}
        minLength={8}
        autoComplete="current-password"
        onChange={(event) => onChange(event.target.value)}
        required
      />
      {helpText && <small>{helpText}</small>}
    </div>
  );
}

function formatAccountDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "long",
  }).format(new Date(value));
}

function formatBackupDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-NZ", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function humanizeBackupLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").toLowerCase();
}
