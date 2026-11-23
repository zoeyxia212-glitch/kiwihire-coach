# Measured results

Only numbers that were actually measured go here, with the date, command and
environment. Leave a row empty until it has been measured. Copy a number into
the CV only after it appears in this file.

## How to measure

| Metric | Command | Where to read it |
|---|---|---|
| Backend tests | `cd backend && ./mvnw test` | `Tests run:` line |
| Backend line coverage | same command, then open `backend/target/site/jacoco/index.html` | Total row |
| Frontend tests | `cd frontend && npm test` | `Tests` line |
| Frontend coverage | `cd frontend && npm i -D @vitest/coverage-v8 && npx vitest run --coverage` | coverage table |
| Rule eval cases | `npm test -- ruleEvals` | passed / total |
| API latency (p95) | `k6 run -e BASE_URL=http://localhost:8080 loadtest/applications.js` | `http_req_duration` p(95) |
| Frontend performance | Chrome DevTools, Lighthouse tab, production build | Performance score |

Run the load test on a quiet machine, with the Docker stack running, and note
the number of virtual users (`-e VUS=20`).

## Results log

| Date | Metric | Value | Environment | Notes |
|---|---|---|---|---|
| | Backend tests | | | |
| | Backend coverage | | | |
| | Frontend tests | | | |
| | Rule eval cases | | | |
| | p95 latency, baseline | | | |
| | p95 latency, after change | | | |
| | Lighthouse performance | | | |

## Before and after

For any optimisation, record the baseline first, change one thing, then
measure again with the same command. Write both numbers and what changed.
