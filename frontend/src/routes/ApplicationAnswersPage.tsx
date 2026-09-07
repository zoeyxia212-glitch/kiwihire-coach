import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ApplicationAnswer } from "../types/applicationAnswer";
import {
  createApplicationAnswer,
  deleteApplicationAnswer,
  getApplicationAnswers,
  updateApplicationAnswer,
} from "../utils/api";

const emptyForm = { question: "", answer: "", tags: "", roleTypes: "" };

export default function ApplicationAnswersPage() {
  const [items, setItems] = useState<ApplicationAnswer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getApplicationAnswers()
      .then(setItems)
      .catch(() => setMessage("Your answer library could not be loaded."))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.question, item.answer, item.tags, item.roleTypes]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEditing(item: ApplicationAnswer) {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      tags: item.tags,
      roleTypes: item.roleTypes,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const saved = editingId
        ? await updateApplicationAnswer(editingId, form)
        : await createApplicationAnswer(form);
      setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setMessage(editingId ? "Answer updated." : "Answer added to your library.");
      resetForm();
    } catch {
      setMessage("The answer could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(itemId: number) {
    if (!window.confirm("Delete this saved answer?")) return;
    try {
      await deleteApplicationAnswer(itemId);
      setItems((current) => current.filter((item) => item.id !== itemId));
      if (editingId === itemId) resetForm();
      setMessage("Answer deleted.");
    } catch {
      setMessage("The answer could not be deleted.");
    }
  }

  return (
    <section className="page answer-library-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Reusable preparation</p>
          <h1>Application answer library</h1>
          <p className="muted">
            Save truthful answers once, then adapt them to each company and role.
          </p>
        </div>
      </div>

      <div className="grid two answer-library-layout">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-inner form-grid">
            <div>
              <p className="eyebrow">{editingId ? "Edit answer" : "Add answer"}</p>
              <h2>{editingId ? "Improve this answer" : "Capture a reusable starting point"}</h2>
            </div>
            <div className="field">
              <label htmlFor="answer-question">Application question</label>
              <textarea id="answer-question" required maxLength={500}
                value={form.question}
                placeholder="Why do you want to work for this company?"
                onChange={(event) => updateField("question", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="answer-content">Your base answer</label>
              <textarea id="answer-content" required maxLength={5000}
                value={form.answer}
                placeholder="Use your real experience. Adapt company-specific details before submitting."
                onChange={(event) => updateField("answer", event.target.value)} />
              <small>{form.answer.length} / 5,000</small>
            </div>
            <div className="field">
              <label htmlFor="answer-tags">Skills or evidence tags</label>
              <input id="answer-tags" maxLength={1000} value={form.tags}
                placeholder="Java, debugging, teamwork"
                onChange={(event) => updateField("tags", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="answer-role-types">Useful for role types</label>
              <input id="answer-role-types" maxLength={500} value={form.roleTypes}
                placeholder="Junior Software Engineer, Support Engineer"
                onChange={(event) => updateField("roleTypes", event.target.value)} />
            </div>
            <div className="form-actions">
              <button className="button primary" disabled={isSaving}>
                {isSaving ? "Saving..." : editingId ? "Update answer" : "Save answer"}
              </button>
              {editingId && <button className="button" type="button" onClick={resetForm}>Cancel</button>}
            </div>
            {message && <p className="muted" role="status">{message}</p>}
          </div>
        </form>

        <div>
          <div className="answer-library-tools">
            <label htmlFor="answer-search">Search your answers</label>
            <input id="answer-search" type="search" value={search}
              placeholder="Search question, skill or role..."
              onChange={(event) => setSearch(event.target.value)} />
          </div>
          {isLoading ? <p className="muted">Loading answers...</p> : null}
          {!isLoading && items.length === 0 ? (
            <div className="panel"><div className="panel-inner">
              <p className="eyebrow">No saved answers</p>
              <h3>Start with one question you see frequently.</h3>
              <p className="muted">A saved answer is a starting point, not text to submit unchanged.</p>
            </div></div>
          ) : null}
          {!isLoading && items.length > 0 && filteredItems.length === 0 ? (
            <p className="muted">No answers match this search.</p>
          ) : null}
          <div className="answer-library-list">
            {filteredItems.map((item) => (
              <article className="panel answer-library-card" key={item.id}>
                <div className="panel-inner">
                  <div className="answer-card-heading">
                    <h3>{item.question}</h3>
                    <div className="form-actions">
                      <button className="button small" type="button" onClick={() => startEditing(item)}>Edit</button>
                      <button className="button small danger" type="button" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </div>
                  <p className="answer-content">{item.answer}</p>
                  <div className="answer-metadata">
                    {item.tags && <span>Skills: {item.tags}</span>}
                    {item.roleTypes && <span>Roles: {item.roleTypes}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
