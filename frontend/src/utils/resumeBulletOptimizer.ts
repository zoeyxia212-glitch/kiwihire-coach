export type ResumeBulletInput = {
  action: string;
  tools: string;
  result: string;
};

export type ResumeBulletDraft = {
  bullet: string;
  checks: string[];
};

export function buildResumeBullet(
  input: ResumeBulletInput,
): ResumeBulletDraft {
  const action = cleanPhrase(input.action);
  const tools = cleanPhrase(input.tools);
  const result = cleanPhrase(input.result);
  const parts = [action];
  const checks: string[] = [];

  if (tools) {
    parts.push(`using ${tools}`);
  } else {
    checks.push("Add the real tools or skills you used.");
  }

  let bullet = parts.filter(Boolean).join(" ");

  if (result) {
    bullet += `, resulting in ${lowercaseFirst(result)}`;
  } else {
    checks.push(
      "Add a truthful result, outcome, or piece of evidence. A number is optional.",
    );
  }

  if (!action) {
    checks.unshift("Describe the action you personally completed.");
  }

  if (bullet) {
    bullet = `${uppercaseFirst(bullet)}.`;
  }

  return {
    bullet,
    checks,
  };
}

function cleanPhrase(value: string) {
  return value.trim().replace(/^[-•]\s*/, "").replace(/[.,;:]+$/, "");
}

function uppercaseFirst(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function lowercaseFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
