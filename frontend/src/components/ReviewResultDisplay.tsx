import { useEffect, useState } from "react";
import type {
  ResumeAnalysis,
  ResumeAnalysisItem,
} from "../types/resumeAnalysis";
import type {
  InterviewAnswerStatus,
  SavedReviewQuestion,
  SuggestionStatus,
} from "../types/resumeReview";

type ReviewResultDisplayProps = {
  analysis: ResumeAnalysis;
  questions: SavedReviewQuestion[];
  practiceKey?: string;
  practiceAnswers?: string[];
  practiceStatuses?: InterviewAnswerStatus[];
  suggestionStatuses?: SuggestionStatus[];
  onSavePracticeAnswer?: (
    questionIndex: number,
    answer: string,
  ) => Promise<void>;
  onUpdatePracticeStatus?: (
    questionIndex: number,
    status: InterviewAnswerStatus,
  ) => Promise<void>;
  onUpdateSuggestionStatus?: (
    suggestionIndex: number,
    status: SuggestionStatus,
  ) => Promise<void>;
};

export default function ReviewResultDisplay({
  analysis,
  questions,
  practiceKey,
  practiceAnswers = [],
  practiceStatuses = [],
  suggestionStatuses = [],
  onSavePracticeAnswer,
  onUpdatePracticeStatus,
  onUpdateSuggestionStatus,
}: ReviewResultDisplayProps) {
  return (
    <div className="review-results">
      <div className="panel">
        <div className="panel-inner">
          <p className="eyebrow">Explainable score</p>
          <h2>
            {analysis.score === null
              ? "Not enough recognized requirements"
              : `${analysis.score}% match`}
          </h2>
          <p className="muted">
            Direct matches count fully; transferable evidence counts
            as half. Always check the evidence yourself.
          </p>
        </div>
      </div>

      <div className="grid three">
        <AnalysisColumn
          title="Matched"
          items={analysis.matched}
          emptyText="No direct matches detected."
          tone="matched"
        />
        <AnalysisColumn
          title="Transferable"
          items={analysis.transferable}
          emptyText="No transferable evidence detected."
          tone="transferable"
        />
        <AnalysisColumn
          title="Missing"
          items={analysis.missing}
          emptyText="No missing supported skills detected."
          tone="missing"
        />
      </div>

      <div className="panel">
        <div className="panel-inner">
          <h2>Resume actions</h2>
          <div className="list">
            {analysis.suggestions.map((suggestion, index) => (
              <div className="list-row suggestion-row" key={`${suggestion}-${index}`}>
                <p>{suggestion}</p>
                {onUpdateSuggestionStatus && (
                  <>
                    <label className="suggestion-status no-print">
                      <span>Decision</span>
                      <select
                        value={suggestionStatuses[index] ?? "To do"}
                        onChange={(event) =>
                          onUpdateSuggestionStatus(
                            index,
                            event.target.value as SuggestionStatus,
                          )
                        }
                      >
                        <option>To do</option>
                        <option>Accepted</option>
                        <option>Ignored</option>
                      </select>
                    </label>
                    <span className="print-only">
                      Decision: {suggestionStatuses[index] ?? "To do"}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-inner">
          <h2>Likely interview questions</h2>
          <div className="list">
            {questions.map((question, index) => (
              <InterviewQuestionCard
                key={`${practiceKey ?? "preview"}-${question.question}-${index}`}
                question={question}
                index={index}
                initialAnswer={practiceAnswers[index] ?? ""}
                status={
                  practiceStatuses[index] ?? "Not started"
                }
                onSaveAnswer={onSavePracticeAnswer}
                onUpdateStatus={onUpdatePracticeStatus}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InterviewQuestionCard({
  question,
  index,
  initialAnswer,
  status,
  onSaveAnswer,
  onUpdateStatus,
}: {
  question: SavedReviewQuestion;
  index: number;
  initialAnswer: string;
  status: InterviewAnswerStatus;
  onSaveAnswer?: (
    questionIndex: number,
    answer: string,
  ) => Promise<void>;
  onUpdateStatus?: (
    questionIndex: number,
    status: InterviewAnswerStatus,
  ) => Promise<void>;
}) {
  const [isPracticing, setIsPracticing] = useState(false);
  const [answer, setAnswer] = useState(initialAnswer);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [speechMessage, setSpeechMessage] = useState("");

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isTimerRunning]);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
    },
    [],
  );

  async function saveAnswer(nextAnswer = answer) {
    if (!onSaveAnswer) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      await onSaveAnswer(index, nextAnswer);
      setSaveMessage("Answer saved to your account.");
    } catch {
      setSaveMessage("Answer could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function clearAnswer() {
    const confirmed = window.confirm(
      "Clear this practice answer?",
    );

    if (!confirmed) {
      return;
    }

    setAnswer("");
    await saveAnswer("");
  }

  async function changeStatus(nextStatus: InterviewAnswerStatus) {
    if (!onUpdateStatus) {
      return;
    }

    setIsSavingStatus(true);
    setSaveMessage("");

    try {
      await onUpdateStatus(index, nextStatus);
      setSaveMessage("Preparation status saved.");
    } catch {
      setSaveMessage("Preparation status could not be saved.");
    } finally {
      setIsSavingStatus(false);
    }
  }

  function readQuestionAloud() {
    if (!("speechSynthesis" in window)) {
      setSpeechMessage(
        "Voice reading is not supported by this browser.",
      );
      return;
    }

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(question.question);
    speech.lang = "en-NZ";
    speech.rate = 0.9;
    speech.onstart = () => setSpeechMessage("Reading question...");
    speech.onend = () => setSpeechMessage("");
    speech.onerror = () =>
      setSpeechMessage("The question could not be read aloud.");
    window.speechSynthesis.speak(speech);
  }

  function resetTimer() {
    setIsTimerRunning(false);
    setSecondsRemaining(120);
  }

  return (
    <article className="list-row interview-question-card">
      <div className="interview-question-content">
        <p className="eyebrow">Question {index + 1}</p>
        <h3>{question.question}</h3>
        <p>{question.reason}</p>
        <p>{question.answerGuide}</p>

        <div className="mock-interview-tools no-print">
          <button
            className="button compact"
            type="button"
            onClick={readQuestionAloud}
          >
            Read question aloud
          </button>
          <div className="interview-timer" aria-live="polite">
            <strong>{formatTimer(secondsRemaining)}</strong>
            <button
              className="button compact"
              type="button"
              disabled={secondsRemaining === 0}
              onClick={() =>
                setIsTimerRunning((current) => !current)
              }
            >
              {isTimerRunning
                ? "Pause timer"
                : secondsRemaining === 120
                  ? "Start 2-minute timer"
                  : "Continue timer"}
            </button>
            {secondsRemaining < 120 && (
              <button
                className="text-button"
                type="button"
                onClick={resetTimer}
              >
                Reset
              </button>
            )}
          </div>
          {speechMessage && (
            <span className="muted" role="status">
              {speechMessage}
            </span>
          )}
        </div>

        {onSaveAnswer && (
          <div className="interview-practice no-print">
            <button
              className="button compact"
              type="button"
              onClick={() => setIsPracticing((current) => !current)}
            >
              {isPracticing
                ? "Hide practice answer"
                : answer
                  ? "Continue practice answer"
                  : "Write practice answer"}
            </button>

            {isPracticing && (
              <>
                <div className="answer-status-control">
                  <label htmlFor={`answer-status-${index}`}>
                    Preparation status
                  </label>
                  <select
                    id={`answer-status-${index}`}
                    value={status}
                    disabled={isSavingStatus}
                    onChange={(event) =>
                      changeStatus(
                        event.target.value as InterviewAnswerStatus,
                      )
                    }
                  >
                    <option>Not started</option>
                    <option>Drafted</option>
                    <option>Ready</option>
                  </select>
                </div>
                <label htmlFor={`practice-answer-${index}`}>
                  Your STAR answer draft
                </label>
                <textarea
                  id={`practice-answer-${index}`}
                  value={answer}
                  maxLength={10000}
                  placeholder="Situation... Task... Action... Result..."
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setSaveMessage("");
                  }}
                />
                <div className="practice-answer-footer">
                  <button
                    className="button compact"
                    type="button"
                    disabled={isSaving}
                    onClick={() => saveAnswer()}
                  >
                    {isSaving ? "Saving..." : "Save answer"}
                  </button>
                  {answer && (
                    <button
                      className="text-button"
                      type="button"
                      onClick={clearAnswer}
                    >
                      Clear draft
                    </button>
                  )}
                </div>
                {saveMessage && (
                  <p
                    className={
                      saveMessage.includes("could not")
                        ? "error-message"
                        : "success-message"
                    }
                    role="status"
                  >
                    {saveMessage}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {onSaveAnswer && (
          <div className="print-only printed-answer">
            <strong>Preparation status: {status}</strong>
            <p>
              {answer ||
                "No saved STAR answer has been prepared for this question."}
            </p>
          </div>
        )}
      </div>
      <div className="question-statuses">
        <span className="status">{question.relatedSkill}</span>
        {onSaveAnswer && <span className="status">{status}</span>}
      </div>
    </article>
  );
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function AnalysisColumn({
  title,
  items,
  emptyText,
  tone,
}: {
  title: string;
  items: ResumeAnalysisItem[];
  emptyText: string;
  tone: "matched" | "transferable" | "missing";
}) {
  return (
    <div className={`panel analysis-column ${tone}`}>
      <div className="panel-inner">
        <h2>{title}</h2>
        {!items.length && <p className="muted">{emptyText}</p>}
        <div className="analysis-items">
          {items.map((item) => (
            <article key={item.skill}>
              <strong>{item.skill}</strong>
              <p>{item.explanation}</p>
              {item.evidence && (
                <blockquote>{item.evidence}</blockquote>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
