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

The first candidate research round can be run with the interview script,
task checklist, privacy guidance, and findings template in
[`docs/candidate-validation.md`](docs/candidate-validation.md).

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

- Register, log in, log out, and access protected routes with JWT authentication
- Hash passwords and enforce authenticated-user ownership in backend services
- Create, view, edit, archive, and delete job applications
- Track application stages, notes, next actions, follow-up dates, and interview history
- Show current-user application totals, upcoming deadlines, overdue follow-ups, recent activity, and inactive applications on the dashboard
- Save a candidate profile containing target roles, locations, work-rights context, career stage, and transferable experience
- Create and manage named resume versions from pasted text or supported local documents
- Compare a saved resume with a job description using explainable matching logic
- Show matched, missing, and transferable skills, resume evidence, improvement actions, and learning priorities
- Build evidence-first resume bullet drafts locally from user-provided actions, tools, and truthful results without inventing experience
- Show saved review history on its related application for quick return to role-specific preparation
- Generate role-specific interview questions and STAR prompts, classify and filter questions, and track saved-answer preparation progress
- Practise interview answers with browser text-to-speech, a two-minute timer, and private in-tab audio recording
- Enable optional browser reminders or export upcoming interviews, follow-ups, and closing dates to a standard calendar file
- Save review history and collect lightweight usefulness feedback
- Collect authenticated whole-product feedback by category, usefulness rating, page, and written experience
- Change a password or permanently delete an account

The React frontend uses a centralised typed API client to communicate with authenticated Spring Boot endpoints. The backend uses DTOs, layered services, JPA repositories, ownership checks, and relational persistence rather than trusting user IDs supplied by the browser.

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
| `POST` | `/api/auth/register` | Register an account |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `POST` | `/api/applications` | Create an application |
| `GET` | `/api/applications` | List the authenticated user's applications |
| `GET` | `/api/applications/{id}` | Get one application |
| `PUT` | `/api/applications/{id}` | Update an application |
| `DELETE` | `/api/applications/{id}` | Delete an application |
| `GET/POST/PUT/DELETE` | `/api/resumes` | Manage saved resume versions |
| `GET/POST/PATCH/DELETE` | `/api/reviews` | Create and manage resume-to-job reviews |
| `GET/POST/PUT/PATCH/DELETE` | `/api/applications/{id}/events` | View, add, edit, complete, and delete timeline events |
| `GET/PUT` | `/api/profile` | View or update the candidate profile |
| `GET` | `/api/dashboard` | Load current-user dashboard data |
| `GET/POST/PATCH/DELETE` | `/api/learning-goals` | Manage learning priorities |
| `GET/POST` | `/api/feedback` | View and submit authenticated product feedback |
| `GET/PATCH/DELETE` | `/api/account` | Manage the authenticated account |

Application, resume, review, profile, dashboard, and account endpoints derive ownership from the authenticated JWT principal. The browser does not choose which user's records to access.

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

New Zealand-specific application fields include job source, work-rights
requirements, career level, employment type, industry, graduate suitability,
and visa sponsorship availability.

Dashboard follow-ups can be created, completed, postponed, and reopened
without losing the related application timeline history.

The private product-feedback workspace summarizes average usefulness,
high-value ratings, willingness to reuse, feedback categories, and the
workflows mentioned by the signed-in user.

Candidate Profile includes a reusable library of truthful STAR examples.
Interview questions recommend the closest example using transparent keyword
matching and identify missing Situation, Task, Action, or Result sections.

Evidence-first resume bullets can be inserted into an unsaved full-resume
preview, compared against the role before and after, undone safely, and saved
as a separate resume version without overwriting the source.

The authenticated Dashboard summarizes the application pipeline by status,
recent saved resume reviews, answer readiness, and current learning priorities
alongside deadlines, inactive applications, and follow-up actions.

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
7. [x] Add registration, password hashing, JWT authentication, logout, and protected routes
8. [x] Replace the fixed frontend user ID and enforce authenticated-user ownership
9. [x] Add application timeline events for Applied, screening, first interview, second interview, technical interview, offer, rejection, and withdrawal
10. [x] Add next actions, follow-up due dates, upcoming interview reminders, and overdue indicators
11. [x] Replace the static dashboard with current-user application and follow-up data
12. [x] Add a candidate profile for target roles, work rights, location preferences, and previous experience
13. [x] Add resume file text extraction and persistent resume CRUD
14. [x] Add job-description upload or paste and connect it to a persisted review
15. [x] Show matched skills, missing skills, transferable skills, and supporting resume evidence
16. [x] Turn review results into resume actions, predicted interview questions, STAR prompts, saved answers, and learning priorities
17. [x] Save review history and add a lightweight usefulness feedback prompt
18. [ ] Test the workflow with 5-10 target candidates and document product decisions
19. [x] Add New Zealand-specific application fields
20. [ ] Run the application against local PostgreSQL and document the relational model and representative SQL
21. [ ] Publish the REST contract with OpenAPI/Swagger and document success and error status codes
22. [ ] Add GitHub Actions for frontend tests/build and backend tests
23. [ ] Add a Docker Compose environment for the frontend, backend, and PostgreSQL
24. [ ] Add metrics, dashboards, centralised logs, and an operations runbook
25. [ ] Deploy the application and document the deployment flow
26. [ ] Add project screenshots and a short feature demonstration
27. [x] Add application follow-up completion, postponement, reopen, and
    Dashboard quick-create actions
28. [x] Add private product-feedback summaries and willingness-to-reuse
    evidence
29. [x] Connect Candidate Profile STAR examples to interview-question
    recommendations
30. [x] Add evidence-first bullet preview, undo, comparison, and resume
    version saving
31. [x] Add New Zealand candidate career stage and role-classification
    context
32. [ ] Run the unified product acceptance checklist in
    `docs/product-plan.md`

A third-party API integration will be selected only if candidate validation identifies a real need, rather than being added solely as a portfolio checkbox. The staged containerisation, CI, monitoring, logging, and operations plan is documented in `docs/cloud-native-plan.md`. Kubernetes follows a stable Docker Compose environment rather than being introduced as an isolated portfolio checkbox.
