# KiwiHire Coach

KiwiHire Coach is a job search tracker and resume improvement tool for junior developers looking for roles in New Zealand.

Most job trackers only help users remember where they applied. This project also helps users understand why a role is or is not a good match. Users can save job applications, paste job descriptions, store resume text, and compare a resume against a role's required skills.

## Main Idea

The project combines three things:

- Job application tracking
- Resume and job description matching
- Interview and job search reflection

The first version will use keyword-based matching rather than AI. This keeps the project easier to explain, cheaper to run, and closer to normal full-stack business logic.

## Prototype Features

- Apple-style frontend pages
- Job application dashboard mockup
- Application list and application detail screens
- Resume version screen
- Resume review screen
- Static match score, keywords, and suggestions

## Creative Feature

The main creative feature is the resume optimizer.

When a user adds a job description and selects a resume, the app compares the required skills in the job description with the skills mentioned in the resume. It then shows:

- Matched keywords
- Missing keywords
- Match score
- Simple suggestions for improving the resume

This makes the app more useful than a normal Kanban-style job tracker.

## Current Tech Stack

- React
- TypeScript
- Vite
- CSS

The current version is a frontend prototype only.

## Why This Stack

React and TypeScript are useful for New Zealand junior frontend and full-stack roles. Starting with the frontend first makes the project easier to understand before adding backend, database, and API work.

Backend, database, authentication, and API design are intentionally left for a later stage.

## Project Structure

```text
frontend/
  React pages, components, and CSS

backend/
  Placeholder only for later work

docs/
  Product notes and setup notes
```

## Development Plan

1. Finish the frontend page structure.
2. Improve the static user flow.
3. Decide which backend feature to add first.
4. Add backend and database only after the flow is clear.
