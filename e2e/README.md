# Browser journey tests

These tests drive the real app in a browser. They need the whole stack running.

```bash
# from the repository root
docker compose up --build

# in another terminal
cd e2e
npm install
npx playwright install chromium
npm test
```

Set `E2E_BASE_URL` to test another address. Each run creates its own accounts
(`e2e.<timestamp>@example.com`), so it does not touch real data. Use a local
stack, not a deployed one.

The selectors use visible labels and button names. If a label changes, update
the matching line in `tests/journey.spec.ts`.

These tests are not part of the pull request CI, because they need the full
stack. Account backup and restore is built in the browser, so its round trip
belongs here too: add a test that exports a backup, registers a second
account and restores it.
