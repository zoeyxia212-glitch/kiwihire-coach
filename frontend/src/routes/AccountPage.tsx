import { FormEvent, useEffect, useState } from "react";
import type { UserResponse } from "../utils/api";
import {
  changePassword,
  deleteAccount,
  getAccount,
} from "../utils/api";

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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
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
    </div>
  );
}

function formatAccountDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "long",
  }).format(new Date(value));
}
