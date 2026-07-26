# Cloud-Native Upgrade Plan

## Goal

Evolve KiwiHire Coach from a local full-stack application into a containerised, observable, and automatically verified application without rewriting the existing product.

Each phase should remain independently runnable, testable, and explainable in a technical interview.

## Phase 1: PostgreSQL Runtime

- Run PostgreSQL with Docker Compose.
- Configure Spring Boot datasource values through environment variables.
- Keep H2 isolated to automated integration tests.
- Persist local PostgreSQL data with a named Docker volume.
- Verify the existing CRUD workflow against PostgreSQL.

## Phase 2: Backend Container

- Add a multi-stage Spring Boot Dockerfile.
- Build the application JAR in a Maven stage.
- Run the JAR in a smaller Java runtime image.
- Add a backend health endpoint and container health check.
- Connect the backend container to PostgreSQL through the Compose network.

## Phase 3: Frontend and Nginx

- Add a multi-stage React Dockerfile.
- Build the frontend with Node.js and serve the generated assets with Nginx.
- Proxy `/api` requests from Nginx to the backend container.
- Support React client-side routes with an Nginx fallback to `index.html`.
- Remove production dependence on a hard-coded localhost backend URL.

## Phase 4: Continuous Integration

- Add GitHub Actions for frontend dependency installation, tests, and production build.
- Add GitHub Actions for backend tests and package build.
- Build both Docker images after the application checks pass.
- Keep deployment separate until a target environment has been selected.

## Phase 5: Metrics and Dashboards

- Add Spring Boot Actuator and Micrometer Prometheus support.
- Expose health and Prometheus metrics endpoints safely.
- Add Prometheus and Grafana services to the local Compose environment.
- Build a small dashboard for HTTP traffic, response time, error rates, CPU, and JVM memory.

## Phase 6: Centralised Logging

- Produce useful Spring Boot application logs.
- Add Loki and a compatible log collector to the local environment.
- Search logs through Grafana by level, endpoint, and error message.
- Demonstrate one reproducible failure and its corresponding logs.

## Phase 7: Operations Runbook

- Document database connection failures.
- Document unhealthy containers and restart loops.
- Document port conflicts and Nginx `502` responses.
- Document API `500` investigation using logs and metrics.
- Include the commands used to inspect containers, networks, health, and logs.

## Later: Kubernetes

Move to Kubernetes only after the Docker Compose environment is stable. The first Kubernetes version should cover Deployments, Services, ConfigMaps, Secrets, Ingress, readiness probes, liveness probes, rolling updates, and pod recovery.

Ansible or Jenkins can be evaluated later. GitHub Actions is the preferred first CI tool because the repository is already hosted on GitHub.
