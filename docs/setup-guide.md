# Setup Guide

KiwiHire Coach has two services: a Spring Boot backend and a React frontend.
Both need to be running for the app to work end to end.

## Requirements

Install:

```text
Java 17
Node.js 22
npm
```

## Backend setup

```bash
cd backend
./mvnw spring-boot:run
```

The API runs at `http://localhost:8080`. No configuration is required for
local development - it uses an in-memory H2 database by default. See
[`backend/README.md`](../backend/README.md) for backend architecture and
authentication details.

## Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173` and expects the backend to
already be running at `http://localhost:8080`.

`.env` is only needed for the optional EmailJS contact form - the core
product works without it. Never commit `.env` (it's gitignored); only
`.env.example` should be tracked.

## Running the tests

```bash
cd frontend && npm test && npm run build
cd ../backend && ./mvnw test
```

## Development order for new work

```text
1. Run the unified acceptance checklist in docs/product-plan.md before
   trusting that an existing feature still works
2. Confirm the user-visible result AND the persisted data, not just that
   code exists
3. Update docs/product-plan.md and the root README when a feature's status
   changes
```
