import { FormEvent, useEffect, useState } from "react";
import type { ApplicationEvent } from "../types/applicationEvent";
import {
  completeApplicationEvent,
  createApplicationEvent,
  getApplicationEvents,
} from "../utils/api";

const stages = [
  "Saved",
  "Applied",
  "Recruiter Screen",
  "First Interview",
  "Second Interview",
  "Technical Interview",
  "Reference Check",
  "Offer",
  "Rejected",
  "Withdrawn",
];

type ApplicationTimelineProps = {
  applicationId: string;
  onStageChange: (stage: string) => void;
};

function currentLocalDateTime() {
  const now = new Date();
  const localTime = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000,
  );

  return localTime.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ApplicationTimeline({
  applicationId,
  onStageChange,
}: ApplicationTimelineProps) {
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [stage, setStage] = useState("Applied");
  const [occurredAt, setOccurredAt] = useState(
    currentLocalDateTime,
  );
  const [contactPerson, setContactPerson] = useState("");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [followUpDueDate, setFollowUpDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [completingEventId, setCompletingEventId] =
    useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setEvents(await getApplicationEvents(applicationId));
      } catch {
        setError("Failed to load application history.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, [applicationId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const savedEvent = await createApplicationEvent(
        applicationId,
        {
          stage,
          occurredAt,
          contactPerson,
          notes,
          nextAction,
          followUpDueDate: followUpDueDate || null,
        },
      );

      setEvents((currentEvents) => [
        savedEvent,
        ...currentEvents,
      ]);
      onStageChange(savedEvent.stage);
      setContactPerson("");
      setNotes("");
      setNextAction("");
      setFollowUpDueDate("");
      setOccurredAt(currentLocalDateTime());
    } catch {
      setError("Failed to save application update.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleComplete(eventId: number) {
    setError("");
    setCompletingEventId(eventId);

    try {
      const completedEvent = await completeApplicationEvent(
        applicationId,
        eventId,
      );
      setEvents((currentEvents) =>
        currentEvents.map((applicationEvent) =>
          applicationEvent.id === eventId
            ? completedEvent
            : applicationEvent,
        ),
      );
    } catch {
      setError("Failed to complete follow-up.");
    } finally {
      setCompletingEventId(null);
    }
  }

  return (
    <section className="detail-section">
      <div className="grid two">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-inner form-grid">
            <div>
              <p className="eyebrow">Next milestone</p>
              <h2>Add an update</h2>
            </div>

            <div className="field">
              <label htmlFor="event-stage">Stage</label>
              <select
                id="event-stage"
                value={stage}
                onChange={(event) => setStage(event.target.value)}
              >
                {stages.map((stageOption) => (
                  <option key={stageOption}>{stageOption}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="event-date">When did it happen?</label>
              <input
                id="event-date"
                type="datetime-local"
                value={occurredAt}
                onChange={(event) => setOccurredAt(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="event-contact">
                Contact person (optional)
              </label>
              <input
                id="event-contact"
                value={contactPerson}
                onChange={(event) =>
                  setContactPerson(event.target.value)
                }
                placeholder="Recruiter or interviewer"
              />
            </div>

            <div className="field">
              <label htmlFor="event-notes">Notes (optional)</label>
              <textarea
                id="event-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What happened?"
              />
            </div>

            <div className="field">
              <label htmlFor="event-next-action">
                Next action (optional)
              </label>
              <input
                id="event-next-action"
                value={nextAction}
                onChange={(event) => setNextAction(event.target.value)}
                placeholder="Send a thank-you email"
              />
            </div>

            <div className="field">
              <label htmlFor="event-follow-up">
                Follow-up date (optional)
              </label>
              <input
                id="event-follow-up"
                type="date"
                value={followUpDueDate}
                onChange={(event) =>
                  setFollowUpDueDate(event.target.value)
                }
              />
            </div>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <button
              className="button primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving update..." : "Save update"}
            </button>
          </div>
        </form>

        <div className="panel">
          <div className="panel-inner">
            <p className="eyebrow">History</p>
            <h2>Application timeline</h2>

            {isLoading && (
              <p className="muted">Loading history...</p>
            )}

            {!isLoading && events.length === 0 && !error && (
              <p className="muted">
                No updates yet. Add the first milestone for this role.
              </p>
            )}

            <div className="timeline">
              {events.map((applicationEvent) => (
                <article
                  className="timeline-item"
                  key={applicationEvent.id}
                >
                  <div className="timeline-dot" />
                  <div>
                    <div className="timeline-heading">
                      <strong>{applicationEvent.stage}</strong>
                      <span className="muted">
                        {formatDateTime(applicationEvent.occurredAt)}
                      </span>
                    </div>
                    {applicationEvent.contactPerson && (
                      <p>Contact: {applicationEvent.contactPerson}</p>
                    )}
                    {applicationEvent.notes && (
                      <p>{applicationEvent.notes}</p>
                    )}
                    {(applicationEvent.nextAction ||
                      applicationEvent.followUpDueDate) && (
                      <>
                        <p>
                          {applicationEvent.nextAction
                            ? `Next: ${applicationEvent.nextAction}`
                            : "Follow-up"}
                          {applicationEvent.followUpDueDate &&
                            ` · Due ${applicationEvent.followUpDueDate}`}
                        </p>
                        {applicationEvent.completed ? (
                          <span className="completed-label">
                            Completed
                          </span>
                        ) : (
                          <button
                            className="button compact"
                            type="button"
                            disabled={
                              completingEventId === applicationEvent.id
                            }
                            onClick={() =>
                              handleComplete(applicationEvent.id)
                            }
                          >
                            {completingEventId === applicationEvent.id
                              ? "Completing..."
                              : "Mark complete"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
