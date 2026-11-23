// Scans every git tracked file for secrets that should never be committed.
// Run from the repository root: node scripts/scanSecrets.mjs
// Exits 1 and prints file and line (never the secret itself) on a match.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const RULES = [
  { name: "Private key block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "AWS access key id", pattern: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: "GitHub token", pattern: /\b(ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{30,}\b/ },
  { name: "GitHub fine grained token", pattern: /\bgithub_pat_[A-Za-z0-9_]{40,}\b/ },
  { name: "Azure storage key or connection string", pattern: /AccountKey=[A-Za-z0-9+\/=]{20,}/ },
  { name: "Azure SAS signature", pattern: /[?&]sig=[A-Za-z0-9%+\/=]{30,}/ },
  { name: "Slack token", pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/ },
  {
    name: "Hard coded secret value",
    pattern:
      /\b(JWT_SECRET|POSTGRES_PASSWORD|DB_PASSWORD|DATABASE_PASSWORD|CLIENT_SECRET)\s*[:=]\s*["']?(?!\$\{|\$\(|<|your|change|example|replace|test|dev|local|password|secret|xxx|\s|["']?$)[^\s"']{12,}/i,
  },
];

// Lines that carry an obvious development placeholder. The backend refuses
// to start with such a value under the prod profile.
const PLACEHOLDER = /local-development|change-before|changeme|placeholder/i;

// Files that are meant to hold placeholders, or hold fake values on purpose.
const SKIP = [/(^|\/)\.env\.example$/, /(^|\/)package-lock\.json$/, /\.(png|jpg|jpeg|gif|ico|pdf|woff2?)$/i, /(^|\/)scripts\/scanSecrets\.mjs$/];

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => !SKIP.some((skip) => skip.test(file)));

const findings = [];
const trackedEnv = files.filter((file) => /(^|\/)\.env(\.[^/]+)?$/.test(file));
trackedEnv.forEach((file) =>
  findings.push({ file, line: 0, rule: "Environment file is tracked by git" }),
);

for (const file of files) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (text.includes("\u0000")) continue;
  text.split("\n").forEach((line, index) => {
    for (const rule of RULES) {
      if (rule.pattern.test(line) && !PLACEHOLDER.test(line)) {
        findings.push({ file, line: index + 1, rule: rule.name });
      }
    }
  });
}

if (findings.length > 0) {
  console.error("Possible secrets found (values not shown):");
  findings.forEach(({ file, line, rule }) =>
    console.error(`  ${file}${line ? `:${line}` : ""}  ${rule}`),
  );
  process.exit(1);
}
console.log(`Secret scan passed: ${files.length} tracked files checked.`);
