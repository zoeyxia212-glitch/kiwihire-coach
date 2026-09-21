import { useState } from "react";

export type ReviewChecklistState = {
  soundsLikeYou: boolean;
  relevantToRole: boolean;
  reviewedWhatChanged: boolean;
};

const INITIAL_STATE: ReviewChecklistState = {
  soundsLikeYou: false,
  relevantToRole: false,
  reviewedWhatChanged: false,
};

export function isChecklistComplete(state: ReviewChecklistState) {
  return (
    state.soundsLikeYou &&
    state.relevantToRole &&
    state.reviewedWhatChanged
  );
}

type ReviewChecklistProps = {
  onChange?: (state: ReviewChecklistState, complete: boolean) => void;
};

/**
 * A lightweight, non-destructive check-in before a user accepts a resume
 * suggestion. Modelled on the review pattern used by comparable products
 * (a short human checklist rather than a black-box "accept" button):
 * https://www.outrung.com/ai-cv-builder
 *
 * This never blocks or auto-changes data - it only tracks whether the
 * user has confirmed they reviewed the suggestion before marking it
 * "Accepted" in the Resume actions panel.
 */
export default function ReviewChecklist({ onChange }: ReviewChecklistProps) {
  const [state, setState] = useState<ReviewChecklistState>(INITIAL_STATE);

  function toggle(key: keyof ReviewChecklistState) {
    const next = { ...state, [key]: !state[key] };
    setState(next);
    onChange?.(next, isChecklistComplete(next));
  }

  return (
    <div className="panel no-print">
      <div className="panel-inner">
        <h3>Before you accept a suggestion</h3>
        <p className="muted">
          A quick check-in - not a gate. AI-assisted suggestions can still
          be wrong, so confirm these before marking one "Accepted".
        </p>
        <ul className="list">
          <li className="list-row">
            <label>
              <input
                type="checkbox"
                checked={state.soundsLikeYou}
                onChange={() => toggle("soundsLikeYou")}
              />
              <span>Sound like you? Does it still describe what you actually did?</span>
            </label>
          </li>
          <li className="list-row">
            <label>
              <input
                type="checkbox"
                checked={state.relevantToRole}
                onChange={() => toggle("relevantToRole")}
              />
              <span>Speak to this role? Is it relevant to the job description?</span>
            </label>
          </li>
          <li className="list-row">
            <label>
              <input
                type="checkbox"
                checked={state.reviewedWhatChanged}
                onChange={() => toggle("reviewedWhatChanged")}
              />
              <span>
                What changed? Compare against the original in the bullet
                preview above before accepting.
              </span>
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
}
