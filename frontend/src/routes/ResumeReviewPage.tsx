import { useEffect, useState } from "react";
import type { InterviewQuestion } from "../types/interview";
import { generateInterviewQuestions } from "../utils/interviewQuestionGenerator";


export default function ResumeReviewPage() {
  const JOB_DESCRIPTION_KEY = "kiwihire-job-description";
const RESUME_TEXT_KEY = "kiwihire-resume-text";
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
  const savedJobDescription = localStorage.getItem(JOB_DESCRIPTION_KEY);
  const savedResumeText = localStorage.getItem(RESUME_TEXT_KEY);

  if (savedJobDescription) {
    setJobDescription(savedJobDescription);
  }

  if (savedResumeText) {
    setResumeText(savedResumeText);
  }
}, []);
function handleGenerateQuestions() {
  if (!jobDescription.trim() || !resumeText.trim()) {
    setQuestions([]);
    setErrorMessage("Please paste both job description and resume text.");
    return;
  }

  const result = generateInterviewQuestions(jobDescription, resumeText);
  setQuestions(result);
  setErrorMessage("");
}
function handleClearInputs() {
  setJobDescription("");
  setResumeText("");
  setQuestions([]);
  setErrorMessage("");
  localStorage.removeItem(JOB_DESCRIPTION_KEY);
  localStorage.removeItem(RESUME_TEXT_KEY);
}


  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Resume optimizer</p>
          <h1>Match your resume to the role.</h1>
          <p className="muted">Find missing keywords before you apply.</p>
        </div>
      </div>
      <div className="grid two">
  <div className="panel">
    <div className="panel-inner form-grid">
      <div className="field">
        <label>Job description</label>
        <textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
onChange={(event) => {
  setJobDescription(event.target.value);
  localStorage.setItem(JOB_DESCRIPTION_KEY, event.target.value);
}}        />
      </div>
    </div>
  </div>

  <div className="panel">
    <div className="panel-inner form-grid">
      <div className="field">
        <label>Resume text</label>
        <textarea
          placeholder="Paste your resume text here..."
          value={resumeText}
onChange={(event) => {
  setResumeText(event.target.value);
  localStorage.setItem(RESUME_TEXT_KEY, event.target.value);
}}        />
      </div>

      <button
        className="button primary"
        type="button"
        onClick={handleGenerateQuestions}
      >
        Generate interview questions
      </button>
      <button
  className="button"
  type="button"
  onClick={handleClearInputs}
>
  Clear inputs
</button>
      {errorMessage && <p className="muted">{errorMessage}</p>}
    </div>
  </div>
</div>
     <div style={{ marginTop: 16 }}>
  <div className="panel">
    <div className="panel-inner">
      <h2>Interview questions</h2>
{questions.length > 0 && (
  <p className="muted">{questions.length} questions generated</p>
)}
      {questions.length === 0 &&!errorMessage && (
        <p className="muted">
          Paste a job description and resume, then generate interview questions.
        </p>
      )}

      <div className="list">
       {questions.map((item, index) => (
  <article className="list-row" key={item.id}>
    <div>
      <p className="eyebrow">Question {index + 1}</p>
      <h3>{item.question}</h3>
      <p>{item.reason}</p>
      <p>{item.answerGuide}</p>
    </div>
    <span className="status">{item.relatedSkill}</span>
  </article>
))}
      </div>
    </div>
  </div>
</div>
    </section>
  );
}
