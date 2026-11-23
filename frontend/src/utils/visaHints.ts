/**
 * General pointers about work rights for one role, with links to the
 * official Immigration New Zealand pages.
 *
 * These are prompts to check, not immigration advice and not a verdict.
 * Visa conditions differ between people, and only Immigration New Zealand
 * or a licensed adviser can say what a particular visa allows.
 */

import { classifyCandidateStatus } from "./eligibilityGate";

export const VISA_LINKS = {
  aewv: {
    label: "Accredited Employer Work Visa",
    url: "https://www.immigration.govt.nz/visas/accredited-employer-work-visa/",
  },
  accreditedList: {
    label: "Accredited employer list",
    url: "https://www.immigration.govt.nz/work/requirements-for-work-visas/approved-employers/accredited-employer-list/",
  },
  postStudy: {
    label: "Post-study work visa",
    url: "https://www.immigration.govt.nz/visas/post-study-work-visa/",
  },
} as const;

export type VisaHint = {
  text: string;
  links: { label: string; url: string }[];
};

export const VISA_DISCLAIMER =
  "General pointers only, not immigration advice. Check your own visa conditions with Immigration New Zealand.";

export function buildVisaHints(input: {
  candidateWorkRights: string;
  sponsorshipAvailable: boolean | null;
}): VisaHint[] {
  const status = classifyCandidateStatus(input.candidateWorkRights);

  if (status === "citizen-or-resident") {
    return [];
  }
  if (status === "unknown") {
    return [
      {
        text: "Add your work rights to your profile so KiwiHire can point you to the right checks for each role.",
        links: [],
      },
    ];
  }

  const hints: VisaHint[] = [];

  if (/post[- ]?study/i.test(input.candidateWorkRights)) {
    hints.push({
      text: "You hold, or are applying for, a post-study work visa. Check whether yours is open or tied to one employer before you apply, because that changes which roles you can take.",
      links: [VISA_LINKS.postStudy],
    });
  }

  if (input.sponsorshipAvailable === true) {
    hints.push({
      text: "The employer says it can support a visa. An Accredited Employer Work Visa needs an accredited employer and a job check, so confirm the employer is on the accredited list.",
      links: [VISA_LINKS.aewv, VISA_LINKS.accreditedList],
    });
  } else if (input.sponsorshipAvailable === false) {
    hints.push({
      text: "The employer says it does not sponsor visas. The role only works if your current visa already allows this work, so check your visa conditions first.",
      links: [VISA_LINKS.aewv],
    });
  } else {
    hints.push({
      text: "Sponsorship is not stated. If you would need an employer to support a visa, ask early and check whether the employer is accredited.",
      links: [VISA_LINKS.accreditedList],
    });
  }

  return hints;
}
