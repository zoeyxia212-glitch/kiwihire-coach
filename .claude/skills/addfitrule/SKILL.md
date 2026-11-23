---
name: addfitrule
description: Add or change a deterministic rule in KiwiHire Coach together with its tests, golden eval case and documentation.
---

# Add a fit rule

Rules live in `frontend/src/utils`. Every rule change touches four places:

1. The rule module in `frontend/src/utils`, as a pure function with no network or randomness.
2. A unit test beside it. Cover the silent case (the text says nothing), the optional case ("preferred" never fails) and the failing case.
3. A golden case in `frontend/src/evals/evalCases.ts`, so `ruleEvals.test.ts` keeps guarding the behaviour.
4. A short entry in `docs/fit-rules.md` that says what the rule does, and what it deliberately does not do.

Principles to keep:
- Silence is not permission, and missing data is "unchecked", never a failure or a zero.
- Every result must be explainable in one sentence the user can read.
- Rules are advisory. They warn, they do not block the user.

Finish with `npm test` and `npx tsc --noEmit -p .` in `frontend`.
