import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { ResumeReview } from "../types/resumeReview";
import {
  getResumeReviewById,
  updateMockInterviewSessions,
  updateResumeReviewAnswers,
} from "../utils/api";
import VoiceAnswerRecorder from "../components/VoiceAnswerRecorder";

export default function MockInterviewPage() {
  const { id } = useParams();
  const [review, setReview] = useState<ResumeReview | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [improvementNotes, setImprovementNotes] = useState("");
  const [message, setMessage] = useState("");
  const [speechMessage, setSpeechMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSessionSaved, setIsSessionSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    getResumeReviewById(id)
      .then((loaded) => {
        setReview(loaded);
        setAnswers(Array.from(
          { length: loaded.questions.length },
          (_, index) => loaded.answers[index] || "",
        ));
        setSavedAnswers(Array.from(
          { length: loaded.questions.length },
          (_, index) => loaded.answers[index] || "",
        ));
      })
      .catch(() => setMessage("This mock interview could not be loaded."));
  }, [id]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const hasUnsavedAnswers = answers.some(
    (answer, index) => answer !== (savedAnswers[index] || ""),
  );

  useEffect(() => {
    if (!hasUnsavedAnswers) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasUnsavedAnswers]);

  if (!review) {
    return <section className="page"><p className={message ? "error-message" : "muted"}>{message || "Loading mock interview..."}</p></section>;
  }

  const currentReview = review;
  const sessionQuestions = currentReview.questions.slice(0, 5);
  const currentQuestion = sessionQuestions[questionIndex];
  const answeredCount = answers
    .slice(0, sessionQuestions.length)
    .filter((answer) => answer.trim().length > 0).length;

  function goToQuestion(nextIndex: number) {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeechMessage("");
    setQuestionIndex(nextIndex);
    setSecondsRemaining(120);
    setIsRunning(false);
    setMessage("");
  }

  function toggleQuestionSpeech() {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setSpeechMessage("Question reading is not supported by this browser.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechMessage("Reading stopped.");
      return;
    }
    const speech = new SpeechSynthesisUtterance(currentQuestion.question);
    speech.lang = "en-NZ";
    speech.rate = 0.9;
    speech.onstart = () => {
      setIsSpeaking(true);
      setSpeechMessage("Reading question aloud...");
    };
    speech.onend = () => {
      setIsSpeaking(false);
      setSpeechMessage("");
    };
    speech.onerror = () => {
      setIsSpeaking(false);
      setSpeechMessage("The question could not be read aloud.");
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  async function saveSession() {
    setIsSaving(true);
    setMessage("");
    try {
      await updateResumeReviewAnswers(currentReview.id, answers);
      const saved = await updateMockInterviewSessions(currentReview.id, [
        ...currentReview.mockInterviewSessions,
        {
          completedAt: new Date().toISOString(),
          questionCount: sessionQuestions.length,
          confidence,
          improvementNotes: improvementNotes.trim(),
        },
      ]);
      setReview(saved);
      setSavedAnswers([...answers]);
      setIsSessionSaved(true);
      setMessage("Mock interview saved to this CV review.");
    } catch {
      setMessage("The mock interview could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveDraft() {
    setIsSavingDraft(true);
    setMessage("");
    try {
      const saved = await updateResumeReviewAnswers(currentReview.id, answers);
      setReview(saved);
      setSavedAnswers([...answers]);
      setMessage("Answer progress saved. This is not counted as a completed session.");
    } catch {
      setMessage("Your answer progress could not be saved.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  function finishInterview() {
    if (answeredCount < sessionQuestions.length && !window.confirm(
      `You have answered ${answeredCount} of ${sessionQuestions.length} questions. Finish this session anyway?`,
    )) {
      return;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeechMessage("");
    setIsRunning(false);
    setIsFinished(true);
  }

  function startAnotherSession() {
    setQuestionIndex(0);
    setSecondsRemaining(120);
    setIsRunning(false);
    setIsFinished(false);
    setConfidence(3);
    setImprovementNotes("");
    setMessage("");
    setIsSessionSaved(false);
  }

  if (sessionQuestions.length === 0) {
    return (
      <section className="page">
        <h1>No interview questions yet</h1>
        <p className="muted">Run a CV review first to generate role-specific questions.</p>
        <Link className="button primary" to={`/reviews/${review.id}`}>Back to review</Link>
      </section>
    );
  }

  return (
    <section className="page mock-interview-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Mock interview</p>
          <h1>{review.company} · {review.roleTitle}</h1>
          <p className="muted">Answer up to five role-specific questions. Your draft answers stay connected to this review.</p>
        </div>
        <Link
          className="button"
          to={`/reviews/${review.id}`}
          onClick={(event) => {
            if (hasUnsavedAnswers && !window.confirm(
              "You have unsaved answer changes. Exit without saving?",
            )) {
              event.preventDefault();
            }
          }}
        >
          Exit practice
        </Link>
      </div>

      {!isFinished ? (
        <div className="panel">
          <div className="panel-inner mock-interview-runner">
            <div className="mock-interview-progress">
              <div>
                <strong>Question {questionIndex + 1} of {sessionQuestions.length}</strong>
                <span>{answeredCount} answered</span>
              </div>
              <progress value={questionIndex + 1} max={sessionQuestions.length} />
            </div>
            <p className="eyebrow">Related skill · {currentQuestion.relatedSkill}</p>
            <h2>{currentQuestion.question}</h2>
            <p className="muted">Why it matters: {currentQuestion.reason}</p>
            <div className="mock-interview-speech no-print">
              <button className="button compact" type="button" onClick={toggleQuestionSpeech}>
                {isSpeaking ? "Stop reading" : "Read question aloud"}
              </button>
              {speechMessage && <span className="muted" role="status">{speechMessage}</span>}
            </div>
            <div className="mock-interview-timer">
              <strong>{formatTimer(secondsRemaining)}</strong>
              <button className="button compact" type="button" onClick={() => setIsRunning((current) => !current)}>
                {isRunning ? "Pause" : secondsRemaining === 120 ? "Start timer" : "Continue"}
              </button>
              <button className="button compact" type="button" onClick={() => { setSecondsRemaining(120); setIsRunning(false); }}>Reset</button>
            </div>
            <label>
              Your answer
              <textarea
                value={answers[questionIndex] || ""}
                placeholder={currentQuestion.answerGuide}
                onChange={(event) => setAnswers((current) => {
                  const next = [...current];
                  next[questionIndex] = event.target.value;
                  return next;
                })}
              />
            </label>
            <VoiceAnswerRecorder key={`recording-${questionIndex}`} />
            <div className="form-actions">
              <button className="button" type="button" disabled={questionIndex === 0} onClick={() => goToQuestion(questionIndex - 1)}>Previous</button>
              <button className="button" type="button" disabled={isSavingDraft} onClick={saveDraft}>
                {isSavingDraft ? "Saving..." : "Save progress"}
              </button>
              {questionIndex < sessionQuestions.length - 1 ? (
                <button className="button primary" type="button" onClick={() => goToQuestion(questionIndex + 1)}>Next question</button>
              ) : (
                <button className="button primary" type="button" onClick={finishInterview}>Finish interview</button>
              )}
            </div>
            {message && (
              <p className={message.includes("could not") ? "error-message" : "success-message"} role="status">
                {message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-inner mock-interview-summary">
            <p className="eyebrow">Self-review</p>
            <h2>Record what you will improve next time</h2>
            <label>
              Confidence: {confidence}/5
              <input type="range" min="1" max="5" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} />
            </label>
            <label>
              Improvement notes
              <textarea value={improvementNotes} maxLength={2000} placeholder="Which answer lacked detail? Was your Action clear? What evidence should you practise next?" onChange={(event) => setImprovementNotes(event.target.value)} />
            </label>
            <div className="form-actions">
              <button className="button" type="button" onClick={() => setIsFinished(false)}>Review answers</button>
              <button className="button primary" type="button" disabled={isSaving || isSessionSaved} onClick={saveSession}>
                {isSaving ? "Saving..." : isSessionSaved ? "Session saved" : "Save session"}
              </button>
              {isSessionSaved && (
                <button className="button" type="button" onClick={startAnotherSession}>
                  Start another session
                </button>
              )}
            </div>
            {message && <p className="info-message" role="status">{message}</p>}
          </div>
        </div>
      )}

      {review.mockInterviewSessions.length > 0 && (
        <div className="panel mock-interview-history">
          <div className="panel-inner">
            <h2>Previous sessions</h2>
            {review.mockInterviewSessions.slice().reverse().map((session) => (
              <article className="list-row" key={session.completedAt}>
                <div><strong>{new Date(session.completedAt).toLocaleString("en-NZ")}</strong><p>{session.improvementNotes || "No improvement notes recorded."}</p></div>
                <span>{session.confidence}/5 confidence</span>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function formatTimer(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
