import { useState } from "react";
import type {
  ResumeAnalysis,
  ResumeAnalysisItem,
} from "../types/resumeAnalysis";
import type { SavedReviewQuestion } from "../types/resumeReview";

type ReviewResultDisplayProps = {
  analysis: ResumeAnalysis;
  questions: SavedReviewQuestion[];
  practiceKey?: string;
  practiceAnswers?: string[];
  onSavePracticeAnswer?: (
    questionIndex: number,
    answer: string,
  ) => Promise<void>;
};

export default function ReviewResultDisplay({
  analysis,
  questions,
  practiceKey,
  practiceAnswers = [],
  onSavePracticeAnswer,
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
            {analysis.suggestions.map((suggestion) => (
              <div className="list-row" key={suggestion}>
                <p>{suggestion}</p>
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
                onSaveAnswer={onSavePracticeAnswer}
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
  onSaveAnswer,
}: {
  question: SavedReviewQuestion;
  index: number;
  initialAnswer: string;
  onSaveAnswer?: (
    questionIndex: number,
    answer: string,
  ) => Promise<void>;
}) {
  const [isPracticing, setIsPracticing] = useState(false);
  const [answer, setAnswer] = useState(initialAnswer);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

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

  return (
    <article className="list-row interview-question-card">
      <div className="interview-question-content">
        <p className="eyebrow">Question {index + 1}</p>
        <h3>{question.question}</h3>
        <p>{question.reason}</p>
        <p>{question.answerGuide}</p>

        {onSaveAnswer && (
          <div className="interview-practice">
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
      </div>
      <span className="status">{question.relatedSkill}</span>
    </article>
  );
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
