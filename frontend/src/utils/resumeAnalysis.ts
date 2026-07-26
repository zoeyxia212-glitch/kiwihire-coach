import type {
  ResumeAnalysis,
  ResumeAnalysisItem,
} from "../types/resumeAnalysis";

type SkillDefinition = {
  name: string;
  terms: string[];
};

const skills: SkillDefinition[] = [
  { name: "React", terms: ["react"] },
  { name: "TypeScript", terms: ["typescript"] },
  { name: "JavaScript", terms: ["javascript"] },
  { name: "Java", terms: ["java"] },
  { name: "Spring Boot", terms: ["spring boot", "spring"] },
  { name: "REST APIs", terms: ["rest api", "restful", "api design"] },
  { name: "SQL", terms: ["sql"] },
  { name: "PostgreSQL", terms: ["postgresql", "postgres"] },
  { name: "MongoDB", terms: ["mongodb", "mongo"] },
  { name: "Git", terms: ["git", "github"] },
  { name: "Testing", terms: ["testing", "unit test", "integration test"] },
  { name: "Docker", terms: ["docker", "container"] },
  { name: "Kubernetes", terms: ["kubernetes", "k8s"] },
  { name: "AWS", terms: ["aws", "amazon web services"] },
  { name: "Azure", terms: ["azure"] },
  { name: "CI/CD", terms: ["ci/cd", "continuous integration"] },
  { name: "Linux", terms: ["linux"] },
  { name: "Agile", terms: ["agile", "scrum", "sprint"] },
  { name: "Troubleshooting", terms: ["troubleshooting", "problem solving"] },
  { name: "Communication", terms: ["communication", "communicate"] },
  { name: "Documentation", terms: ["documentation", "documenting"] },
  { name: "Monitoring", terms: ["monitoring", "observability"] },
  { name: "Customer Support", terms: ["customer support", "user support"] },
];

const transferableEvidence: Record<string, {
  terms: string[];
  explanation: string;
}> = {
  Communication: {
    terms: ["customer service", "client", "stakeholder", "supported users", "team"],
    explanation:
      "Your people-facing or teamwork experience may support this communication requirement.",
  },
  Troubleshooting: {
    terms: ["incident", "support", "operations", "data centre", "resolved", "diagnosed"],
    explanation:
      "Your operations or support evidence may transfer to technical troubleshooting.",
  },
  Agile: {
    terms: ["team project", "collaboration", "iteration", "planning", "delivery"],
    explanation:
      "Your project and collaboration experience may transfer to an Agile team.",
  },
  Documentation: {
    terms: ["report", "record", "procedure", "process", "knowledge base"],
    explanation:
      "Your experience recording information may transfer to technical documentation.",
  },
  Monitoring: {
    terms: ["data centre", "operations", "incident", "alerts", "system health"],
    explanation:
      "Your operational awareness may transfer to application monitoring.",
  },
  "Customer Support": {
    terms: ["customer service", "helped customers", "client service", "front line"],
    explanation:
      "Your customer-facing experience may transfer to user support.",
  },
};

function includesTerm(text: string, term: string) {
  const escapedTerm = term.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapedTerm}([^a-z0-9]|$)`,
  );

  return pattern.test(text);
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => includesTerm(text, term));
}

function findEvidence(text: string, terms: string[]) {
  return text
    .split(/\n|(?<=[.!?])\s+/)
    .map((section) => section.trim())
    .filter(Boolean)
    .find((section) =>
      includesAny(section.toLowerCase(), terms),
    );
}

export function analyzeResume(
  jobDescription: string,
  resumeText: string,
  candidateContext = "",
): ResumeAnalysis {
  const normalizedJob = jobDescription.toLowerCase();
  const normalizedResume = resumeText.toLowerCase();
  const normalizedCandidateContext = candidateContext.toLowerCase();
  const requiredSkills = skills.filter((skill) =>
    includesAny(normalizedJob, skill.terms),
  );
  const matched: ResumeAnalysisItem[] = [];
  const missing: ResumeAnalysisItem[] = [];
  const transferable: ResumeAnalysisItem[] = [];

  requiredSkills.forEach((skill) => {
    const directEvidence = findEvidence(resumeText, skill.terms);

    if (includesAny(normalizedResume, skill.terms)) {
      matched.push({
        skill: skill.name,
        evidence: directEvidence,
        explanation:
          "This requirement appears in both the job description and your resume.",
      });
      return;
    }

    const profileEvidence = findEvidence(
      candidateContext,
      skill.terms,
    );

    if (
      includesAny(normalizedCandidateContext, skill.terms)
    ) {
      transferable.push({
        skill: skill.name,
        evidence: profileEvidence
          ? `Candidate Profile: ${profileEvidence}`
          : undefined,
        explanation:
          "You listed this skill in your Candidate Profile, but it needs a specific example in your resume before it can count as direct evidence.",
      });
      return;
    }

    const transferRule = transferableEvidence[skill.name];
    const transferEvidence = transferRule
      ? findEvidence(resumeText, transferRule.terms)
      : undefined;

    if (
      transferRule &&
      includesAny(normalizedResume, transferRule.terms)
    ) {
      transferable.push({
        skill: skill.name,
        evidence: transferEvidence,
        explanation: transferRule.explanation,
      });
      return;
    }

    missing.push({
      skill: skill.name,
      explanation:
        "The job description mentions this skill, but no clear evidence was found in your resume.",
    });
  });

  const score = requiredSkills.length
    ? Math.round(
        ((matched.length + transferable.length * 0.5) /
          requiredSkills.length) *
          100,
      )
    : null;

  const suggestions = [
    ...missing.map(
      (item) =>
        `If you genuinely have ${item.skill} experience, add one specific example. Otherwise, keep it as a learning priority.`,
    ),
    ...transferable.map(
      (item) =>
        `Connect your existing evidence more clearly to ${item.skill}; do not claim experience you do not have.`,
    ),
  ];

  if (!requiredSkills.length) {
    suggestions.push(
      "No supported skill terms were detected. Review the responsibilities manually or add a more detailed job description.",
    );
  }

  return { score, matched, missing, transferable, suggestions };
}
