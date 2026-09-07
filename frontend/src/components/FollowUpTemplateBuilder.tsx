import { useEffect, useState } from "react";

type TemplateType =
  | "Application follow-up"
  | "Interview thank-you"
  | "Status enquiry"
  | "Interview confirmation";

type FollowUpTemplateBuilderProps = {
  company: string;
  roleTitle: string;
  contactPerson: string | null;
  userEmail: string;
};

const TEMPLATE_TYPES: TemplateType[] = [
  "Application follow-up",
  "Interview thank-you",
  "Status enquiry",
  "Interview confirmation",
];

export default function FollowUpTemplateBuilder({
  company,
  roleTitle,
  contactPerson,
  userEmail,
}: FollowUpTemplateBuilderProps) {
  const [templateType, setTemplateType] =
    useState<TemplateType>("Application follow-up");
  const [draft, setDraft] = useState(() =>
    buildTemplate("Application follow-up", company, roleTitle, contactPerson),
  );
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    setDraft(buildTemplate(templateType, company, roleTitle, contactPerson));
    setCopyMessage("");
  }, [templateType, company, roleTitle, contactPerson]);

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopyMessage("Copied. Review the message before sending it from your email account.");
    } catch {
      setCopyMessage("Copy was blocked by the browser. Select the text and copy it manually.");
    }
  }

  return (
    <section className="detail-section">
      <div className="panel">
        <div className="panel-inner follow-up-template-builder">
          <div className="follow-up-template-heading">
            <div>
              <p className="eyebrow">Communication helper</p>
              <h2>Prepare a follow-up email</h2>
              <p className="muted">
                Generate a local starting point, personalise it, then copy it to
                your own email. KiwiHire does not send anything automatically.
              </p>
            </div>
            <label>
              Message type
              <select
                value={templateType}
                onChange={(event) =>
                  setTemplateType(event.target.value as TemplateType)
                }
              >
                {TEMPLATE_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
          </div>

          {!contactPerson && (
            <p className="template-warning">
              No contact person is saved. Replace “Hiring Team” with the correct
              name before sending.
            </p>
          )}

          <label>
            Email draft
            <textarea
              className="follow-up-template-draft"
              value={draft}
              maxLength={5000}
              onChange={(event) => {
                setDraft(event.target.value);
                setCopyMessage("");
              }}
            />
          </label>
          <div className="follow-up-template-actions">
            <button className="button primary" type="button" onClick={copyDraft}>
              Copy email draft
            </button>
            <button
              className="button"
              type="button"
              onClick={() => setDraft(
                buildTemplate(templateType, company, roleTitle, contactPerson),
              )}
            >
              Reset template
            </button>
            <span className="muted">Signed-in account: {userEmail}</span>
          </div>
          {copyMessage && <p className="info-message" role="status">{copyMessage}</p>}
        </div>
      </div>
    </section>
  );
}

function buildTemplate(
  type: TemplateType,
  company: string,
  roleTitle: string,
  contactPerson: string | null,
) {
  const greeting = `Kia ora ${contactPerson?.trim() || "Hiring Team"},`;
  const signOff = "Kind regards,\n[Your name]";

  if (type === "Interview thank-you") {
    return `${greeting}\n\nThank you for taking the time to speak with me about the ${roleTitle} position at ${company}. I appreciated learning more about the role and the team.\n\nOur conversation reinforced my interest in the opportunity. Please let me know if I can provide any further information.\n\n${signOff}`;
  }
  if (type === "Status enquiry") {
    return `${greeting}\n\nI am writing to ask whether there are any updates on the ${roleTitle} recruitment process at ${company}. I remain interested in the opportunity and would be happy to provide any additional information.\n\nThank you for your time.\n\n${signOff}`;
  }
  if (type === "Interview confirmation") {
    return `${greeting}\n\nThank you for inviting me to interview for the ${roleTitle} position at ${company}. I am pleased to confirm that I will attend at [time] on [date].\n\nPlease let me know if there is anything you would like me to prepare beforehand.\n\n${signOff}`;
  }
  return `${greeting}\n\nI recently applied for the ${roleTitle} position at ${company} and wanted to follow up on my application. I remain very interested in the opportunity and would be happy to provide any further information.\n\nThank you for considering my application.\n\n${signOff}`;
}
