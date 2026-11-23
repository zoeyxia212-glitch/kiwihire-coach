---
name: measuremetrics
description: Measure real test, coverage, eval and latency numbers and record them in docs/metrics.md. Use when asked for project metrics or numbers for the CV.
---

# Measure metrics

Follow the table in `docs/metrics.md`. Rules:

- Record only numbers that a command actually printed in this session. Never estimate or round up.
- For each number write the date, the command, the environment and the value in the results log.
- For an optimisation, measure the baseline first, change one thing, measure again with the same command, and record both.
- The load test is `k6 run -e BASE_URL=http://localhost:8080 loadtest/applications.js`. Run it only against a local stack. Ask before pointing it at any paid cloud environment.
- If a tool is missing (k6, Docker, Java), say so and leave the row empty.
