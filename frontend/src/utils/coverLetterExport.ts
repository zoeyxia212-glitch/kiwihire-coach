export function downloadCoverLetterDraft(
  draft: string,
  company: string,
  roleTitle: string,
) {
  const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = coverLetterFilename(company, roleTitle);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function coverLetterFilename(company: string, roleTitle: string) {
  return `cover-letter-${filenamePart(company)}-${filenamePart(roleTitle)}.txt`;
}

function filenamePart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "application";
}
