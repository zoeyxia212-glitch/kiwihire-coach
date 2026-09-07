import {
  getAccount,
  getApplicationAnswers,
  getApplicationEvents,
  getApplications,
  getCandidateProfile,
  getEvidenceItems,
  getLearningGoals,
  getProductFeedback,
  getResumeReviews,
  getResumes,
} from "./api";

export async function downloadAccountDataExport() {
  const [
    account,
    applications,
    resumes,
    reviews,
    profile,
    evidence,
    applicationAnswers,
    learningGoals,
    feedback,
  ] = await Promise.all([
    getAccount(),
    getApplications(),
    getResumes(),
    getResumeReviews(),
    getCandidateProfile(),
    getEvidenceItems(),
    getApplicationAnswers(),
    getLearningGoals(),
    getProductFeedback(),
  ]);

  const timelines = await Promise.all(
    applications.map(async (application) => ({
      applicationId: application.id,
      events: await getApplicationEvents(String(application.id)),
    })),
  );
  const exportedAt = new Date();
  const backup = {
    product: "KiwiHire Coach",
    schemaVersion: 1,
    exportedAt: exportedAt.toISOString(),
    account,
    profile,
    applications,
    timelines,
    resumes,
    reviews,
    evidence,
    applicationAnswers,
    learningGoals,
    feedback,
  };
  const file = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kiwihire-account-backup-${exportedAt
    .toISOString()
    .slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
