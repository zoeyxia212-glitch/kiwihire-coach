# Architecture

This page shows how KiwiHire Coach fits together. The diagrams are Mermaid, so
GitHub draws them.

## Runtime layout (Docker Compose)

```mermaid
flowchart LR
    Browser([Browser]) -->|HTTP :8080| Nginx
    subgraph compose[Docker Compose]
        Nginx["frontend container<br/>Nginx + React build"]
        API["backend container<br/>Spring Boot :8080"]
        DB[("db container<br/>PostgreSQL 16<br/>volume")]
    end
    Nginx -->|"/api/*"| API
    Nginx -->|"everything else:<br/>index.html (SPA fallback)"| Browser
    API -->|JDBC| DB
    API -. "Flyway migrations at start" .-> DB
```

Only the frontend container publishes a port. The backend and database are
reachable only inside the Compose network.

## Request flow

```mermaid
sequenceDiagram
    participant UI as React page
    participant Client as Typed API client
    participant Filter as JWT filter
    participant Ctl as Controller
    participant Svc as Service
    participant Repo as Repository
    participant DB as PostgreSQL

    UI->>Client: user action
    Client->>Filter: HTTP + JSON + Bearer token
    Filter->>Ctl: authenticated user id
    Ctl->>Svc: DTO + user id
    Svc->>Repo: find by id and user id
    Repo->>DB: SQL
    DB-->>Repo: rows
    Repo-->>Svc: entities
    Svc-->>Ctl: response DTO
    Ctl-->>UI: JSON
```

The user id always comes from the token, never from the request body, and every
lookup filters by it. That is what keeps one account's data away from another.

## Data model

```mermaid
erDiagram
    users ||--o{ applications : owns
    users ||--o{ resumes : owns
    users ||--o{ resume_reviews : owns
    users ||--|| candidate_profiles : has
    users ||--o{ evidence_items : owns
    users ||--o{ application_answers : owns
    users ||--o{ learning_goals : owns
    users ||--o{ product_feedback : writes
    applications ||--o{ application_events : "timeline"
    applications ||--o{ resume_reviews : "reviewed in"
    resumes ||--o{ resume_reviews : "compared in"
    applications }o--o{ evidence_items : "application_evidence"
    applications }o--o{ application_answers : "job_application_answers"
```

Schema changes are Flyway migrations in
`backend/src/main/resources/db/migration`. Hibernate only validates the schema
(`ddl-auto=validate`); it never changes it.

## Where the rules live

The analysis is deterministic and runs in the browser, with no LLM call. The
rules are in `frontend/src/utils` and are described in
[`fit-rules.md`](fit-rules.md): eligibility and language gates, the weighted
fit score, follow-up and stale rules, text sanitising, interview preparation,
and the evidence check. `frontend/src/evals` holds fixed cases that fail the
build if a rule changes its answer.

## Build and delivery

```mermaid
flowchart LR
    PR[Pull request] --> BT[Backend tests]
    PR --> FT[Frontend tests and build]
    PR --> SS[Secret scan]
    PR --> DR[Dependency review]
    BT --> DB2[Docker image build]
    FT --> DB2
    DB2 -.->|"no push, no deploy"| End([Done])
```

Actions are pinned to commit SHAs and run with a read only token. Nothing
deploys automatically.

## Operations

- Health: `/actuator/health` (liveness and readiness probes enabled).
- Metrics: the Prometheus endpoint exists but is off unless
  `MANAGEMENT_ENDPOINTS=health,prometheus` is set. Enable it only where the
  backend port is not reachable from the internet.
- API documentation: Swagger UI at `/swagger-ui.html` and the OpenAPI JSON at
  `/v3/api-docs`. Both are off under the `prod` profile.
