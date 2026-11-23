---
name: prcheck
description: Run the pre pull request checks for KiwiHire Coach and confirm the branch and target are correct. Use before pushing or opening a PR.
---

# Pre PR check

1. Run `git branch --show-current`. It must be `feature/...`, `fix/...`, `ci/...`, `docs/...`, `test/...` or `ops/...`. Never `main`. If it is `main` or `dev`, stop and create a branch first.
2. The PR target is `dev`, not `main`. `dev` goes to `main` only after everything is verified.
3. Run in order and stop at the first failure:
   - `node scripts/scanSecrets.mjs`
   - `cd frontend && npx tsc --noEmit -p .`
   - `cd frontend && npm test`
   - `cd frontend && npm run build`
   - `cd backend && ./mvnw test`
4. Report each step as pass, fail or not run, with the reason. Do not claim a step passed if it was not run.
5. Check `git status` for `.env` files or secrets. Never commit them.
6. Check that new file names contain no underscores or hyphens.
