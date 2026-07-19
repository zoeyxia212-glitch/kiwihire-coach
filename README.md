# KiwiHire Coach

KiwiHire Coach is a full-stack job application tracker and resume improvement tool for junior developers looking for roles in New Zealand.

The project is built with React, TypeScript, Java, Spring Boot, REST APIs, JPA, and a relational database. It is designed to demonstrate practical junior full-stack skills through a real job-search workflow rather than an isolated tutorial project.

Most job trackers only help users remember where they applied. KiwiHire Coach also helps users compare a resume with a job description, identify missing skills, and prepare role-specific interview questions.

## Project Goal

The central goal is to build and demonstrate the skills commonly requested in New Zealand junior software developer and full-stack job descriptions:

- Component-based frontend development with React and TypeScript
- REST API design and integration
- Java and object-oriented programming
- Layered Spring Boot architecture
- Relational data modelling and persistence
- Git-based development
- Automated testing
- Clear technical documentation

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

The frontend currently supports creating and reading applications. Update and delete endpoints exist in the backend, while their frontend workflows remain on the roadmap.

## Core Workflow

```text
React form
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

The current automated test coverage is foundational. Service, controller, and React component coverage will be expanded as the project develops.

## Product Direction

The resume matching feature uses transparent keyword-based logic rather than AI-generated rewriting. This keeps the matching behaviour explainable and provides clear business logic that can be discussed in a technical interview.

New Zealand-specific application fields are planned to include job source, work-rights requirements, and whether a role is graduate or junior friendly.

## Roadmap

The roadmap prioritises evidence requested by junior software and full-stack job descriptions:

1. Complete frontend update and delete workflows
2. Add JobApplication service and controller tests
3. Add React component and API-state tests
4. Run the application against a local PostgreSQL database
5. Add registration, password hashing, authentication, and authorization
6. Remove the fixed frontend user ID
7. Add New Zealand-specific application fields

Cloud deployment, Kubernetes, and cloud infrastructure are intentionally deferred until the core full-stack and testing skills are complete.
