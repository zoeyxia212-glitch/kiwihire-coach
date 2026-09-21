# KiwiHire Coach - Backend

Spring Boot REST API for KiwiHire Coach. See the [root README](../README.md)
for the full product overview and [`docs/product-plan.md`](../docs/product-plan.md)
for product scope and status.

## Stack

- Java 17
- Spring Boot 3.5 (Web, Validation, Security, Data JPA)
- JJWT for JSON Web Tokens, BCrypt for password hashing
- H2 (local development and tests) - PostgreSQL driver is included but the
  runtime migration to PostgreSQL is not complete yet (see the roadmap in
  the root README)

## Architecture

```text
controller/   HTTP endpoints and request routing
service/      Application logic, ownership checks, entity-to-response mapping
repository/   Spring Data JPA database access
entity/       Relational domain models
dto/          API request and response records
exception/    Application errors and their HTTP status mapping
config/       Security configuration and the JWT authentication filter
```

## Authentication and data isolation

- Passwords are hashed with BCrypt; login issues a JWT signed with
  `app.jwt.secret` (see `src/main/resources/application.properties`).
- `JwtAuthenticationFilter` reads the `Authorization: Bearer <token>` header
  on every request and resolves the current user from the token - the
  browser never supplies its own user ID.
- Every per-user resource is looked up with a `findByIdAndUserId(id, userId)`
  style repository query, not a plain `findById(id)`, so a request for
  another user's data returns 404 the same way a nonexistent ID would.
- `app.jwt.secret` falls back to a development-only value locally, but
  `JwtService` refuses to start under the `prod` Spring profile if that
  fallback is still in use - a real deployment must set the `JWT_SECRET`
  environment variable.

## Running locally

```bash
cd backend
./mvnw spring-boot:run
```

The API runs at `http://localhost:8080`. No environment variables are
required for local development - `JWT_SECRET` only needs to be set when
running with the `prod` Spring profile.

## Testing

```bash
cd backend
./mvnw test
```

Coverage includes Spring service unit tests, Spring MVC controller slice
tests, a Spring context smoke test, and Controller -> Service -> Repository
-> H2 integration tests, including an authentication journey test and
per-resource ownership checks.

## API overview

See the [Application API table in the root README](../README.md#application-api)
for the full endpoint list. All application, resume, review, profile,
dashboard, evidence, learning-goal, answer, and account endpoints derive
the current user from the authenticated JWT, never from a client-supplied
ID.
