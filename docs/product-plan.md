# KiwiHire Coach Product Plan

## Product Definition

KiwiHire Coach is a resume-to-job analysis and interview-preparation workspace for New Zealand graduates, international candidates, junior technology professionals, and career changers.

Its three primary product functions are:

1. Let a user upload or enter their resume and a job description, then compare them.
2. Give clear and explainable resume-improvement recommendations for that specific role.
3. Predict likely interview questions and help the user prepare relevant evidence and answers.

Application tracking, saved resume versions, profiles, and review history support these three functions. They are not the product's primary value by themselves.

The finished product is not only a job tracker and not an AI resume-writing landing page. A user should be able to sign in, submit real resume and job-description content, understand the comparison, act on the recommendations, prepare for an interview, and return later to continue the same workflow.

## Target Users

### Primary users

- New Zealand graduate and junior technology job seekers
- International candidates seeking their first local role
- Career changers translating previous operations, support, data-centre, customer-service, or other experience into technology-role evidence

### User needs

- Keep applications, deadlines, and statuses organised
- Maintain different resume versions for different role types
- Understand a job description without relying on unexplained scores
- Identify matched, missing, and transferable skills
- Prepare role-specific interview examples and STAR evidence
- Decide what to improve before applying or interviewing

## Product Differentiator

Most job trackers focus on application status. Generic resume tools focus on rewriting text.

KiwiHire Coach should connect the whole candidate workflow:

```text
Previous experience
        +
Candidate profile and saved resume
        +
Saved application and job description
        ↓
Matched, missing, and transferable skills
        ↓
Resume actions, interview questions, STAR prompts, and learning priorities
```

The main differentiator is transferable-skill guidance for candidates who do not yet have extensive New Zealand technology experience.

This differentiator is a product hypothesis, not a proven fact. It must be validated with real candidates.

## Core User Journey

```text
Register or log in
        ↓
Upload or paste a resume
        ↓
Upload or paste a job description
        ↓
Run a role-specific comparison
        ↓
See matched, missing, and transferable skills
        ↓
Receive specific resume-improvement recommendations
        ↓
Prepare predicted interview questions, STAR evidence, and answers
        ↓
Save the review, link it to an application, and return later
```

If this journey cannot be completed with persisted user data, the product MVP is not complete.

## MVP Product Features

### 1. Account and private workspace

A user must be able to:

- Register with an email address and password
- Log in and log out
- Remain signed in while navigating the application
- Access only their own applications, resumes, profile, and reviews

Acceptance criteria:

- Passwords are hashed and never stored as plain text
- The backend issues and validates authentication credentials
- Protected endpoints reject unauthenticated requests
- A user cannot retrieve or modify another user's records
- The frontend no longer uses a fixed user ID

### 2. Candidate profile

A user must be able to save:

- Target role types
- Preferred New Zealand locations
- Work-rights or visa context
- Graduate, junior, or career-change status
- Previous roles and transferable experience

The profile provides context for later analysis rather than requiring the user to repeat the same information for every application.

### 3. Application tracker

A user must be able to:

- Create, view, edit, and delete an application
- Save company, role title, location, source, status, closing date, and job description
- Track stages such as Saved, Applied, Recruiter Screen, First Interview, Second Interview, Technical Interview, Reference Check, Offer, Rejected, and Withdrawn
- See upcoming closing dates and recent activity

The current application CRUD is the first substantially working product area, but it still requires authenticated-user ownership.

### 4. Application history and follow-up

Changing the current status must not erase the previous stage. Each application should have a chronological timeline containing:

- Event type or stage
- Event date and time
- Optional contact person
- Notes about what happened
- Next action
- Follow-up due date
- Completion status for the next action

Example:

```text
3 August   Applied
7 August   Recruiter phone screen
12 August  First interview
15 August  Follow-up email due
20 August  Second interview
```

The dashboard should highlight:

- Follow-ups due today
- Overdue follow-ups
- Upcoming interviews
- Applications with no activity for a configurable period
- Closing dates approaching soon

The current application record may keep a current status for filtering, but the timeline must remain the historical source of what happened.

### 5. Resume library

A user must be able to:

- Upload a supported resume file
- Paste resume text when a file is unavailable
- Create and name multiple resume versions
- Store resume text
- View, edit, and delete a resume
- Mark or identify the purpose of a resume, such as backend, frontend, cloud, or support
- Select a saved resume when reviewing an application

The existing Resume page is currently only a visual form and does not satisfy this feature.

### 6. Resume-to-job review

A user must be able to select:

- An uploaded or saved resume
- An uploaded, pasted, or saved job description

The review must return explainable results:

- Matched skills
- Missing skills
- Transferable skills
- Evidence found in the resume
- Suggested resume actions
- Learning priorities

A match score may be displayed, but it must not be the only result and its calculation must be explainable.

### 7. Resume optimisation

Recommendations should be specific to the selected job and should:

- Identify important requirements that are absent or weakly evidenced
- Point to the relevant resume section
- Suggest what evidence or wording should be strengthened
- Never invent skills, employment, achievements, or experience
- Distinguish missing evidence from genuinely missing experience
- Allow the user to decide whether to accept or ignore a recommendation

The first implementation may generate structured suggestions without automatically rewriting the whole resume.

### 8. Interview and evidence preparation

From the review, the product should generate:

- Role-specific interview questions
- Likely behavioural, technical, and situational question categories
- Reasons each question is relevant
- STAR evidence prompts
- Suggested examples from the candidate's previous experience
- Gaps where the candidate still needs to prepare an example
- A place for the user to draft and save their answer

The existing keyword question generator is an early prototype of this feature and is not yet connected to saved users, resumes, applications, or review history.

### 9. Real dashboard

The dashboard must use current user data to show:

- Total applications
- Applications by status
- Upcoming closing dates
- Follow-ups due today or overdue
- Upcoming first and second interviews
- Recent application timeline activity
- Recent applications
- Recent reviews
- Current high-priority skill gaps or next actions

Static demonstration numbers do not count as a completed dashboard.

### 10. Feedback and validation

The product should include a lightweight way for users to report:

- Whether a review was useful
- Which recommendation was unclear or missing
- Whether they would use the workflow for a real application

The prototype should be tested with 5-10 target candidates. Findings and resulting product decisions should be documented without storing unnecessary personal information.

## Current Product Status

### Working

- Application create, read, update, and delete workflow
- Spring Boot persistence for applications
- Application loading and error states
- Local job-description and resume text persistence for the review prototype
- Keyword-based interview-question generation

### Prototype-only or incomplete

- Login and registration
- User ownership and authorization
- Candidate profile
- Resume persistence and resume CRUD
- Resume-to-JD matched, missing, and transferable-skill analysis
- Saved review history
- Real dashboard data
- Product feedback collection

Automated testing, typed API access, and infrastructure work support product quality, but they are not substitutes for completing these user workflows.

## Product-First Delivery Order

1. Registration, login, password hashing, JWT authentication, and logout
2. Authenticated-user ownership for applications and removal of fixed user ID
3. Application timeline, stage history, next actions, and follow-up dates
4. Real dashboard data and follow-up reminders
5. Candidate profile
6. Resume upload, text extraction, entity, API, and frontend CRUD
7. Job-description upload or paste workflow
8. Saved application + saved resume review workflow
9. Matched, missing, and transferable-skill analysis
10. Role-specific resume optimisation recommendations
11. Predicted interview questions, STAR evidence, saved answers, and learning actions
12. Saved review history and feedback prompt
13. Candidate interviews and product iteration
14. PostgreSQL, OpenAPI, CI, Docker, monitoring, logging, and deployment

Infrastructure work may proceed in small supporting increments, but it must not displace the incomplete core user journey.

## Out of Scope Until the MVP Works

- Automatic AI resume rewriting
- SEEK or LinkedIn scraping
- Browser extension
- Email reminders
- Payments or subscriptions
- Kubernetes
- Multi-cloud deployment

These features should be considered only after the core workflow is usable and candidate validation shows a real need.

## Portfolio and Interview Evidence

The repository should still provide evidence of practical engineering:

- Layered Controller, Service, Repository, Entity, and DTO design
- Unit, web-slice, integration, API-client, and React component tests
- Secure authentication and record ownership
- Relational data modelling with H2 for tests and PostgreSQL for runtime
- OpenAPI documentation
- GitHub Actions continuous integration
- Docker Compose and a documented deployment flow
- Clear commit history, screenshots, and a short demonstration
- Honest explanation of solo iterative development and AI-assisted work

Technical evidence should demonstrate that a real product workflow was implemented, not replace it.
