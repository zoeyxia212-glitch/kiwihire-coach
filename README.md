# KiwiHire Coach

KiwiHire Coach is a full-stack job application tracker and resume improvement tool for junior developers looking for roles in New Zealand.

The project is built with React, TypeScript, Java, Spring Boot, REST APIs, JPA, and a relational database. It is designed to demonstrate practical junior full-stack skills through a real job-search workflow rather than an isolated tutorial project.

Most job trackers only help users remember where they applied. KiwiHire Coach also helps users compare a resume with a job description, identify missing skills, and prepare role-specific interview questions.

## Product Function

KiwiHire Coach is intended to provide three primary user outcomes:

1. Upload or paste a resume and job description, then compare them.
2. Receive specific, explainable recommendations for improving the resume for that role.
3. Prepare for likely interview questions using relevant resume evidence and STAR prompts.

Supporting features include private user accounts, multiple resume versions, job-application tracking, a chronological application timeline, follow-up reminders, saved review history, candidate profiles, and a dashboard.

The core product journey is:

```text
Upload or paste resume
  + upload or paste job description
  -> matched, missing, and transferable-skill comparison
  -> role-specific resume optimisation recommendations
  -> predicted interview questions, STAR evidence, and answer preparation
  -> save the review and track the related application
```

The product is not complete until this journey works with authenticated and persisted user data. The detailed product definition, MVP acceptance criteria, current gaps, and product-first delivery order are documented in [`docs/product-plan.md`](docs/product-plan.md).

## Project Goal

The primary goal is to build a useful end-to-end candidate workflow. A second goal is to demonstrate skills commonly requested in New Zealand junior software developer and full-stack job descriptions:

- Component-based frontend development with React and TypeScript
- REST API design and integration
- Java and object-oriented programming
- Layered Spring Boot architecture
- Relational data modelling and persistence
- Git-based development
- Automated testing
- Clear technical documentation

## Portfolio Evidence Requirements

This repository is also intended to give recruiters direct evidence of practical coding ability. It should remain suitable for public review and make the project's quality easy to assess.

- Keep the repository public and link it from the CV and GitHub profile
- Maintain clear, focused commit history that shows continuous development
- Keep setup, architecture, API, build, and test instructions accurate
- Never commit secrets, passwords, or local environment files
- Add screenshots or a short demonstration of the working application
- Show automated build and test status after CI is introduced
- Pin the finished repository on the GitHub profile

## Current Features

- Create a job application through a controlled React form
- View applications belonging to a user
- Open a single application detail page using a dynamic route
- Store company, role title, location, status, job description, and closing date
- Display loading and error states when fetching application data
- Persist application data through a Spring Boot API and JPA
- Map entities to request and response DTOs
- Provide backend endpoints for create, read, update, and delete operations
- Generate interview questions from job-description keywords
- Display resume review, keyword, and suggestion interfaces

The frontend supports creating, reading, updating, and deleting applications through a centralised typed API client.

## Core Workflow

```text
React form
  -> typed API client
  -> fetch request
  -> Spring REST controller
  -> service layer
  -> JPA repository
  -> relational database
```

Responses travel back through response DTOs and JSON before being rendered by React components.

## Tech Stack

### Frontend

- React
- TypeScript
- React Router
- Vite
- CSS

### Backend

- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- Maven

### Database

- H2 for the current local development environment
- PostgreSQL JDBC driver included for the planned local PostgreSQL migration

### Testing and Development Tools

- Vitest
- JUnit
- Spring Boot Test
- Git
- npm
- Maven Wrapper

## Why This Stack

React and TypeScript provide a component-based frontend with explicit data types for forms, application records, and API responses.

Spring Boot provides a structured Java backend. Controllers handle HTTP requests, services contain application logic, repositories handle persistence, entities model database records, and DTOs define the API contract.

Spring Data JPA reduces repetitive persistence code while preserving a relational data model. H2 keeps local development and basic tests lightweight. PostgreSQL is included as the next local database step; cloud infrastructure is intentionally outside the current scope.

## Backend Architecture

```text
controller/
  HTTP endpoints and request routing

service/
  Application logic and entity-to-response mapping

repository/
  Spring Data JPA database access

entity/
  Relational domain models

dto/
  API request and response objects

exception/
  Application errors and HTTP error responses
```

## Project Structure

```text
kiwihire-coach/
  frontend/
    src/components/   Reusable forms and UI components
    src/routes/       Page-level route components
    src/types/        Shared TypeScript types
    src/utils/        API and interview-question utilities

  backend/
    src/main/java/    Spring Boot application code
    src/resources/    Application configuration and seed data
    src/test/         Backend tests

  docs/
    Product and backend planning notes
```

## Application API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/applications` | Create an application |
| `GET` | `/api/applications/user/{userId}` | List applications for a user |
| `GET` | `/api/applications/{id}` | Get one application |
| `PUT` | `/api/applications/{id}` | Update an application |
| `DELETE` | `/api/applications/{id}` | Delete an application |

The prototype frontend currently uses user ID `1`. Replacing this with authenticated-user context is part of the roadmap.

## Running Locally

### Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

The API runs at `http://localhost:8080`.

### Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Build and Test

Run the frontend tests and production build:

```bash
cd frontend
npm test
npm run build
```

Run the backend tests:

```bash
cd backend
./mvnw test
```

The current automated test coverage includes Spring service unit tests, Spring MVC controller slice tests, a Spring context smoke test, Controller-to-H2 integration tests for CRUD and error behaviour, and Vitest coverage for the interview-question generator and frontend API client. React component and end-to-end coverage will be expanded as the project develops.

## Product Direction

The resume matching feature uses transparent keyword-based logic rather than AI-generated rewriting. This keeps the matching behaviour explainable and provides clear business logic that can be discussed in a technical interview.

New Zealand-specific application fields are planned to include job source, work-rights requirements, and whether a role is graduate or junior friendly.

The current product hypothesis is to support New Zealand graduates, international candidates, and career changers seeking their first local technology role. A possible differentiator is helping users connect transferable experience from operations, support, data centres, and other previous work to the skills and evidence requested by a job description.

This positioning is not treated as validated. The prototype will be tested with real candidates before larger AI features are added. Research will focus on what candidates currently use, where they struggle, which parts of the workflow they return to, and why they would or would not use KiwiHire Coach for a real application.

## Roadmap

The roadmap prioritises product validation and technical evidence commonly requested by junior software and full-stack job descriptions:

1. [x] Complete frontend update and delete workflows
2. [x] Add JobApplication service unit tests with JUnit and Mockito
3. [x] Add Spring MVC controller tests for CRUD and error responses
4. [x] Add full Spring integration tests covering Controller -> Service -> Repository -> H2
5. [x] Centralise frontend HTTP requests in a typed API client and add Vitest success and failure tests
6. [x] Add React component tests for loading, success, error, and user interaction states
7. [ ] Add registration, password hashing, JWT authentication, logout, and protected routes
8. [ ] Replace the fixed frontend user ID and enforce authenticated-user ownership
9. [ ] Add application timeline events for Applied, screening, first interview, second interview, technical interview, offer, rejection, and withdrawal
10. [ ] Add next actions, follow-up due dates, upcoming interview reminders, and overdue indicators
11. [ ] Replace the static dashboard with current-user application and follow-up data
12. [ ] Add a candidate profile for target roles, work rights, location preferences, and previous experience
13. [ ] Add resume file upload, text extraction, and persistent resume CRUD
14. [ ] Add job-description upload or paste and connect it to a persisted review
15. [ ] Show matched skills, missing skills, transferable skills, and supporting resume evidence
16. [ ] Turn review results into resume actions, predicted interview questions, STAR prompts, saved answers, and learning priorities
17. [ ] Save review history and add a lightweight usefulness feedback prompt
18. [ ] Test the workflow with 5-10 target candidates and document product decisions
19. [ ] Add New Zealand-specific application fields
20. [ ] Run the application against local PostgreSQL and document the relational model and representative SQL
21. [ ] Publish the REST contract with OpenAPI/Swagger and document success and error status codes
22. [ ] Add GitHub Actions for frontend tests/build and backend tests
23. [ ] Add a Docker Compose environment for the frontend, backend, and PostgreSQL
24. [ ] Add metrics, dashboards, centralised logs, and an operations runbook
25. [ ] Deploy the application and document the deployment flow
26. [ ] Add project screenshots and a short feature demonstration

A third-party API integration will be selected only if candidate validation identifies a real need, rather than being added solely as a portfolio checkbox. The staged containerisation, CI, monitoring, logging, and operations plan is documented in `docs/cloud-native-plan.md`. Kubernetes follows a stable Docker Compose environment rather than being introduced as an isolated portfolio checkbox.
