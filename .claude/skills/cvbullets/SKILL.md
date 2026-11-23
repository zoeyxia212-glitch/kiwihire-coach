---
name: cvbullets
description: Draft CV bullets for KiwiHire Coach using only measured and verified facts from docs/metrics.md and the repo.
---

# CV bullets

Source of truth is `docs/metrics.md` plus what is merged and verified in the repo.

- Use a number only if it is in the results log. If a row is empty, write the bullet without a number.
- Do not describe a feature as built or deployed until its branch is merged and CI is green. Do not say "deployed" until a live URL exists.
- Form: action, what was built, measured result. Example shape: "Cut p95 latency of the applications API from A ms to B ms by adding an index (k6, N users)."
- Be honest about scope: personal project, rule based, no LLM.
- File names for any exported CV contain no underscores or hyphens.
