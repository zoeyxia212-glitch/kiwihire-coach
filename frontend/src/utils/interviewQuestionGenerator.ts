import type { InterviewQuestion } from "../types/interview";

export function generateInterviewQuestions(
    jobDescription: string,
    resumeText: string
): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];
    const jobText = jobDescription.toLowerCase();
    const resume = resumeText.toLowerCase();
    if (jobText.includes("react") && resume.includes("react")) {
        questions.push({
            id: "react-project-question",
            question: "Can you tell me about a project where you used React?",
            reason: "Both the job description and your resume mention React.",
            answerGuide:
                "Choose one React project from your resume. Explain the goal, your role, the components you built, and the result.",
            relatedSkill: "React",
        });
    }

    if (jobText.includes("react") && !resume.includes("react")) {
        questions.push({
            id: "react-learning-question",
            question: "The role mentions React. How would you get up to speed with it?",
            reason: "The job description mentions React, but your resume may not show strong React experience.",
            answerGuide:
                "Be honest. Mention your frontend learning experience, similar skills, and how you would quickly practise by building small components.",
            relatedSkill: "React",
        });
    }
    if (
  (jobText.includes("javascript") || jobText.includes("typescript")) &&
  (resume.includes("javascript") || resume.includes("typescript"))
) {
  questions.push({
    id: "js-ts-project-question",
    question: "Can you describe how you used JavaScript or TypeScript in a project?",
    reason:
      "Both the job description and your resume mention JavaScript or TypeScript.",
    answerGuide:
      "Choose one project. Explain what feature you built, how data moved through the page, and how TypeScript helped reduce mistakes.",
    relatedSkill: "JavaScript / TypeScript",
  });
}
if (
  (jobText.includes("javascript") || jobText.includes("typescript")) &&
  !resume.includes("javascript") &&
  !resume.includes("typescript")
) {
  questions.push({
    id: "js-ts-learning-question",
    question:
      "This role mentions JavaScript or TypeScript. How would you improve in that area?",
    reason:
      "The job description mentions JavaScript or TypeScript, but your resume may not clearly show it.",
    answerGuide:
      "Mention your current frontend study and explain that you would practise by building small features, reading existing code, and debugging step by step.",
    relatedSkill: "JavaScript / TypeScript",
  });
}
    if (
        (jobText.includes("sql") || jobText.includes("database")) &&
        (resume.includes("sql") || resume.includes("database"))
    ) {
        questions.push({
            id: "database-project-question",
            question: "Can you explain a time when you worked with a database?",
            reason: "Both the job description and your resume mention database or SQL skills.",
            answerGuide:
                "Talk about one project where you stored, queried, or organised data. Explain what data you worked with and how it was used.",
            relatedSkill: "Database",
        });
    }
    if (
        (jobText.includes("sql") || jobText.includes("database")) &&
        !resume.includes("sql") &&
        !resume.includes("database")
    ) {
        questions.push({
            id: "database-learning-question",
            question: "This role mentions SQL or databases. How would you approach learning or using them in this role?",
            reason:
                "The job description mentions database skills, but your resume may not clearly show database experience.",
            answerGuide:
                "Mention any coursework or project experience with data. Explain that you understand basic tables, queries, and how frontend and backend data connect.",
            relatedSkill: "Database",
        });
    }
    if (
  jobText.includes("support") ||
  jobText.includes("helpdesk") ||
  jobText.includes("operations") ||
  resume.includes("data centre") ||
  resume.includes("incident")
) {
  questions.push({
    id: "operations-support-question",
    question:
      "Can you describe a time when you handled an operational issue or supported a technical process?",
    reason:
      "The job description or your resume mentions support, operations, data centre work, or incident handling.",
    answerGuide:
      "Use your data centre or operations experience. Explain the issue, what you monitored or documented, how you responded, and what you learned about reliability.",
    relatedSkill: "Operations / Support",
  });
}
    if (questions.length === 0) {
        questions.push({
            id: "general-question",
            question: "Can you tell me about a project or experience that is most relevant to this role?",
            reason: "No specific technical keyword was detected, so a general fit question is useful.",
            answerGuide:
                "Choose one project or work experience. Explain the situation, your task, what you did, and the result.",
            relatedSkill: "General",
        });
    }
    return questions;
}