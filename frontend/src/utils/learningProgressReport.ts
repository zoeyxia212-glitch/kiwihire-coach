import type { LearningGoal } from "../types/learningGoal";

export function downloadLearningProgressReport(goals: LearningGoal[]) {
  const completed = goals.filter((goal) => goal.status === "Completed");
  const inProgress = goals.filter((goal) => goal.status === "In progress");
  const toLearn = goals.filter((goal) => goal.status === "To learn");
  const lines = [
    "# KiwiHire Learning Progress Report",
    "",
    `Generated: ${new Intl.DateTimeFormat("en-NZ", { dateStyle: "long" }).format(new Date())}`,
    "",
    "## Summary",
    "",
    `- Completed: ${completed.length}`,
    `- In progress: ${inProgress.length}`,
    `- To learn: ${toLearn.length}`,
    "",
    ...goalSection("Completed learning", completed),
    ...goalSection("Currently learning", inProgress),
    ...goalSection("Planned learning", toLearn),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `kiwihire-learning-progress-${localDateKey()}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function goalSection(title: string, goals: LearningGoal[]) {
  if (!goals.length) {
    return [];
  }

  return [
    `## ${title}`,
    "",
    ...goals.flatMap((goal) => [
      `### ${goal.skill}`,
      "",
      `- Why it matters: ${goal.reason || "Not recorded"}`,
      `- Practical action: ${goal.nextAction || "Not recorded"}`,
      `- Target date: ${goal.targetDate || "Not set"}`,
      ...(goal.completedAt
        ? [`- Completed: ${formatDate(goal.completedAt)}`]
        : []),
      `- Evidence and outcome: ${goal.outcomeEvidence || "Not recorded"}`,
      ...(goal.sourceReviewId
        ? [`- Source CV review: ${window.location.origin}/reviews/${goal.sourceReviewId}`]
        : []),
      "",
    ]),
  ];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function localDateKey() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
