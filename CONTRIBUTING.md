# Contributing

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Released, verified code. Nothing is committed to it directly. |
| `dev` | Integration. Finished work lands here first. |
| `feature/<name>` | One piece of work. Also `fix/`, `docs/`, `ci/`, `test/`, `infra/` and `ops/` for those kinds of change. |

`staging` is added later, when there is a deployed environment to try things in.
There is no `test` branch: automated tests run in CI on every pull request.

## Flow

1. Start from the latest `dev`: `git checkout dev && git pull`, then
   `git checkout -b feature/<name>`.
2. Make small commits with clear messages.
3. Push the branch and open a pull request into `dev`.
4. Merge when CI is green (backend tests, frontend tests and build, secret scan,
   Docker image build, dependency review).
5. When `dev` has been checked locally (`npm test`, `./mvnw test`,
   `docker compose up --build`), open a pull request from `dev` into `main`.

Where one branch builds on another, merge them in order and point each pull
request at the branch it was built on until the earlier one has merged.

## Before opening a pull request

```bash
cd frontend && npm test && npm run build
cd ../backend && ./mvnw test
cd .. && node scripts/scanSecrets.mjs
```

## Rules

- Never commit `.env`, passwords, tokens or keys. Only `.env.example` with
  placeholders is committed.
- Schema changes are new Flyway migrations. Never edit one that has already run.
- A change to a rule in `frontend/src/utils` needs a test, and
  `frontend/src/evals` fails if it changes a fixed case by accident.
- Do not describe a feature as done until it has been run and checked.

## Protecting `main` on GitHub

Settings, Branches, add a rule for `main`: require a pull request, require the
CI checks to pass, and block force pushes.
