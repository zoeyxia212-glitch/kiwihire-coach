export type DuplicateCandidate = {
  id: number;
  company: string;
  roleTitle: string;
  status: string;
  archived?: boolean;
};

function normalise(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Finds an existing, non-archived application for the same company and role
 * title (ignoring case and extra spaces). Returns null until both fields have
 * text, so the warning does not appear while the person is still typing.
 */
export function findDuplicateApplication(
  existing: DuplicateCandidate[],
  company: string,
  roleTitle: string,
): DuplicateCandidate | null {
  const wantedCompany = normalise(company);
  const wantedRole = normalise(roleTitle);
  if (!wantedCompany || !wantedRole) return null;

  return (
    existing.find(
      (item) =>
        !item.archived &&
        normalise(item.company) === wantedCompany &&
        normalise(item.roleTitle) === wantedRole,
    ) ?? null
  );
}
