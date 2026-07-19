# Product Plan

## Problem

Junior developers often apply for many jobs but do not clearly understand which roles are a good match, which skills are missing, and how they should improve their resume for each application.

## Target Users

- Graduate developers in New Zealand
- Junior developers applying for their first full-time role
- International students who need to track work rights, location, and job requirements

## Recruitment and Portfolio Requirements

KiwiHire Coach is both a product and evidence of the developer's practical ability. Recruiters should be able to inspect the public repository and quickly understand what was built, how it works, and how its quality is verified.

- The public GitHub repository must be linked from the CV and pinned on the GitHub profile.
- The repository must contain readable application code and a clear, continuous commit history.
- The README must explain the problem, features, architecture, setup, API, build, and test commands.
- Secrets and local environment files must never be committed.
- The finished project must include screenshots or a short working demonstration.
- CI build and test results should be visible after GitHub Actions is added.

## User Stories

- As a user, I want to save a job application so that I can track my progress.
- As a user, I want to update the status of an application so that I know what stage it is in.
- As a user, I want to save my resume text so that I can reuse it for different applications.
- As a user, I want to paste a job description so that the app can compare it with my resume.
- As a user, I want to see missing skills so that I know what to improve.
- As a user, I want to see simple resume suggestions so that I can tailor my resume before applying.

## MVP Scope

The first prototype should include:

- Dashboard page
- Applications page
- New application form
- Resume page
- Resume review page
- Static match score and suggestions

Backend features such as authentication, database storage, and real resume analysis will be planned later.

## Out of Scope for First Version

- AI-generated resume rewriting
- PDF parsing
- Browser extension
- Scraping SEEK or LinkedIn
- Email reminders
- Payment or subscriptions

These can be future improvements after the basic app is working.

## NZ-Specific Fields

Applications should include:

- Location
- Source, such as SEEK, LinkedIn, GradConnection, company website, or referral
- Work rights requirement
- Graduate or junior friendly flag
- Closing date

These fields make the project more specific than a generic job tracker.
## Object Model Draft

The first version of KiwiHire Coach can be described with four main entities:

- User
- Application
- Resume
- ResumeReview

User represents the person using the system. One user can have many applications and many resumes.

Application represents one job role that the user is interested in or has applied for. It should store the company name, role title, location, source, status, job description, and closing date.

Resume represents one version of the user's resume. A user may have different resume versions for different roles, such as frontend, backend, full-stack, or general IT support roles.

ResumeReview represents the result of comparing one resume with one job application. It should store the match score, matched keywords, missing keywords, and simple suggestions.

The resume matching logic should be kept in a separate ResumeAnalyzer service later, because it is business logic and should not be mixed directly into the frontend page.
