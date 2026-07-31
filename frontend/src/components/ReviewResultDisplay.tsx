import { useEffect, useRef, useState } from "react";
import type {
  ResumeAnalysis,
  ResumeAnalysisItem,
} from "../types/resumeAnalysis";
import type {
  InterviewAnswerStatus,
  SavedReviewQuestion,
  SuggestionStatus,
} from "../types/resumeReview";
import ResumeBulletOptimizer from "./ResumeBulletOptimizer";

type InterviewQuestionCategory =
  | "Behavioural"
  | "Situational"
  | "Technical";

type QuestionCategoryFilter =
  | "All categories"
  | InterviewQuestionCategory;

type QuestionStatusFilter =
  | "All statuses"
  | InterviewAnswerStatus;

function questionCategory(
  question: SavedReviewQuestion,
): InterviewQuestionCategory {
  const text = question.question.toLowerCase();

  if (
    text.includes("what would you") ||
    text.includes("how would you") ||
    text.includes("imagine") ||
    text.includes("suppose") ||
    text.includes("if you were")
  ) {
    return "Situational";
  }

  if (
    text.includes("tell me about a time") ||
    text.includes("describe a time") ||
    text.includes("give an example") ||
    text.includes("conflict") ||
    text.includes("feedback") ||
    text.includes("worked in a team")
  ) {
    return "Behavioural";
  }

  return "Technical";
}

type ReviewResultDisplayProps = {
  analysis: ResumeAnalysis;
  questions: SavedReviewQuestion[];
  practiceKey?: string;
  practiceAnswers?: string[];
  practiceStatuses?: InterviewAnswerStatus[];
  suggestionStatuses?: SuggestionStatus[];
  starExamples?: string;
  jobDescription?: string;
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
  starExamples = "",
  jobDescription = "",
  onSavePracticeAnswer,
  onUpdatePracticeStatus,
  onUpdateSuggestionStatus,
}: ReviewResultDisplayProps) {
  const [categoryFilter, setCategoryFilter] =
    useState<QuestionCategoryFilter>("All categories");
  const [statusFilter, setStatusFilter] =
    useState<QuestionStatusFilter>("All statuses");
  const indexedQuestions = questions.map((question, index) => ({
    question,
    index,
    category: questionCategory(question),
    status: practiceStatuses[index] ?? "Not started",
  }));
  const visibleQuestions = indexedQuestions.filter((item) => {
    const categoryMatches =
      categoryFilter === "All categories" ||
      item.category === categoryFilter;
    const statusMatches =
      statusFilter === "All statuses" ||
      item.status === statusFilter;

    return categoryMatches && statusMatches;
  });
  const readyCount = indexedQuestions.filter(
    (item) => item.status === "Ready",
  ).length;
  const draftedCount = indexedQuestions.filter(
    (item) => item.status === "Drafted",
  ).length;

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

      <ResumeBulletOptimizer
        analysis={analysis}
        jobDescription={jobDescription}
      />

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
          <p className="muted">
            Questions are grouped using transparent wording rules so
            you can practise different interview styles.
          </p>

          {onSavePracticeAnswer && questions.length > 0 && (
            <div className="interview-progress">
              <div>
                <strong>
                  {readyCount} of {questions.length} answers ready
                </strong>
                <p className="muted">
                  {draftedCount} drafted ·{" "}
                  {questions.length - readyCount - draftedCount} not
                  started
                </p>
              </div>
              <progress
                aria-label="Interview preparation progress"
                value={readyCount}
                max={questions.length}
              />
            </div>
          )}

          <div className="grid two no-print">
            <div className="field">
              <label htmlFor="question-category-filter">
                Question category
              </label>
              <select
                id="question-category-filter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value as QuestionCategoryFilter,
                  )
                }
              >
                <option>All categories</option>
                <option>Behavioural</option>
                <option>Situational</option>
                <option>Technical</option>
              </select>
            </div>
            {onSavePracticeAnswer && (
              <div className="field">
                <label htmlFor="question-status-filter">
                  Preparation status
                </label>
                <select
                  id="question-status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as QuestionStatusFilter,
                    )
                  }
                >
                  <option>All statuses</option>
                  <option>Not started</option>
                  <option>Drafted</option>
                  <option>Ready</option>
                </select>
              </div>
            )}
          </div>

          {visibleQuestions.length === 0 && (
            <p className="muted">
              No interview questions match these filters.
            </p>
          )}
          <div className="list">
            {visibleQuestions.map((item) => (
              <InterviewQuestionCard
                key={`${practiceKey ?? "preview"}-${item.question.question}-${item.index}`}
                question={item.question}
                category={item.category}
                index={item.index}
                initialAnswer={practiceAnswers[item.index] ?? ""}
                status={item.status}
                recommendedExample={recommendStarExample(
                  item.question,
                  starExamples,
                )}
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
  category,
  index,
  initialAnswer,
  status,
  recommendedExample,
  onSaveAnswer,
  onUpdateStatus,
}: {
  question: SavedReviewQuestion;
  category: InterviewQuestionCategory;
  index: number;
  initialAnswer: string;
  status: InterviewAnswerStatus;
  recommendedExample: StarExampleRecommendation | null;
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

        {recommendedExample && (
          <div className="star-recommendation">
            <p className="eyebrow">Recommended real example</p>
            <strong>{recommendedExample.title}</strong>
            <p>{recommendedExample.text}</p>
            <p className="muted">
              Matched using shared words with this question
              {recommendedExample.matchedKeywords.length
                ? `: ${recommendedExample.matchedKeywords.join(", ")}.`
                : "."}
            </p>
            {recommendedExample.missingSections.length > 0 ? (
              <p className="info-message">
                Add before practising:{" "}
                {recommendedExample.missingSections.join(", ")}.
              </p>
            ) : (
              <p className="success-message">
                This example contains all four STAR sections.
              </p>
            )}
          </div>
        )}

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

        <VoiceAnswerRecorder />

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
        <span className="status">{category}</span>
        <span className="status">{question.relatedSkill}</span>
        {onSaveAnswer && <span className="status">{status}</span>}
      </div>
    </article>
  );
}

type StarExampleRecommendation = {
  title: string;
  text: string;
  matchedKeywords: string[];
  missingSections: string[];
};

function recommendStarExample(
  question: SavedReviewQuestion,
  starExamples: string,
): StarExampleRecommendation | null {
  const examples = starExamples
    .split(/\n\s*\n/)
    .map((example) => example.trim())
    .filter(Boolean);

  if (examples.length === 0) {
    return null;
  }

  const questionKeywords = keywords(
    `${question.question} ${question.relatedSkill}`,
  );
  const rankedExamples = examples
    .map((example) => {
      const exampleKeywords = keywords(example);
      const matchedKeywords = [...questionKeywords].filter((keyword) =>
        exampleKeywords.has(keyword),
      );

      return {
        example,
        matchedKeywords,
        score: matchedKeywords.length,
      };
    })
    .sort((first, second) => second.score - first.score);
  const bestMatch = rankedExamples[0];
  const requiredSections = ["Situation", "Task", "Action", "Result"];
  const missingSections = requiredSections.filter(
    (section) =>
      !new RegExp(`\\b${section}\\s*:`, "i").test(bestMatch.example),
  );
  const firstLine = bestMatch.example.split("\n")[0].trim();

  return {
    title:
      firstLine.length <= 100
        ? firstLine
        : `${firstLine.slice(0, 97)}...`,
    text: bestMatch.example,
    matchedKeywords: bestMatch.matchedKeywords.slice(0, 5),
    missingSections,
  };
}

function keywords(value: string) {
  const ignoredWords = new Set([
    "about",
    "after",
    "could",
    "describe",
    "example",
    "have",
    "how",
    "that",
    "the",
    "this",
    "time",
    "what",
    "when",
    "with",
    "would",
    "your",
  ]);

  return new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9+#.]{3,}/g)
      ?.filter((word) => !ignoredWords.has(word)) ?? [],
  );
}

function VoiceAnswerRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(
    () => () => {
      mediaRecorderRef.current?.stop();
      mediaStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    },
    [audioUrl],
  );

  async function startRecording() {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      !("MediaRecorder" in window)
    ) {
      setMessage("Audio recording is not supported by this browser.");
      return;
    }

    setMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const audio = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(URL.createObjectURL(audio));
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);
        setMessage(
          "Recording ready for local playback. It has not been uploaded.",
        );
      };

      recorder.start();
      setIsRecording(true);
      setMessage("Recording locally...");
    } catch {
      setMessage(
        "Microphone access was not available. Check the browser site permission.",
      );
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  function deleteRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl("");
    setMessage("Local recording deleted.");
  }

  return (
    <div className="voice-answer-recorder no-print">
      <div>
        <strong>Private voice practice</strong>
        <p className="muted">
          Audio stays in this browser tab and is not uploaded or
          transcribed.
        </p>
      </div>
      <div className="form-actions">
        {!isRecording ? (
          <button
            className="button compact"
            type="button"
            onClick={startRecording}
          >
            Record answer
          </button>
        ) : (
          <button
            className="button compact"
            type="button"
            onClick={stopRecording}
          >
            Stop recording
          </button>
        )}
        {audioUrl && (
          <button
            className="text-button"
            type="button"
            onClick={deleteRecording}
          >
            Delete recording
          </button>
        )}
      </div>
      {audioUrl && <audio controls src={audioUrl} />}
      {message && (
        <p className="muted" role="status">
          {message}
        </p>
      )}
    </div>
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
