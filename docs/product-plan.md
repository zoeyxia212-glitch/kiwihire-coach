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

### Implemented product workflows

- Registration, login, logout, password hashing, JWT authentication, and
  protected frontend routes
- Authenticated-user ownership checks for private records
- Application CRUD, archive/restore, New Zealand role details, search, filters,
  sorting, and CSV export
- Persistent application timeline with stage history, contacts, notes, next
  actions, completion state, follow-up dates, edit, delete, and reopen
- Dashboard data for status distribution, deadlines, follow-ups, inactivity,
  recent applications, recent reviews, answer readiness, and learning goals
- Candidate Profile containing reusable background context and truthful STAR
  examples
- Persistent resume library with create, import, edit, duplicate, delete, and
  purpose-specific versions
- Local PDF, DOCX, and TXT extraction for resumes and job descriptions
- Explainable resume-to-JD analysis for matched, transferable, and missing
  skills with supporting evidence
- Evidence-first resume bullet builder with full-resume preview, before/after
  comparison, undo, and save-as-new-version workflow
- Categorised interview questions, saved STAR answer drafts, readiness status,
  local read-aloud, timer, and private in-tab voice recording
- Transparent Candidate Profile STAR-example recommendations
- Persistent saved reviews, recommendation decisions, learning actions, and
  product feedback
- Private feedback summaries covering usefulness, willingness to reuse,
  categories, and mentioned workflows
- Free local browser reminders and downloadable calendar reminders

### Implemented with deliberate limitations

- Resume analysis and bullet generation use explainable local rules rather than
  paid generative-AI APIs. The product does not claim to automatically rewrite
  a complete resume.
- Voice practice records and plays audio locally in the current browser tab. It
  does not upload, transcribe, or score speech.
- Browser notifications run only while KiwiHire Coach is open. Calendar export
  is available, but there is no email, SMS, or third-party background push.
- File import extracts text. Scanned PDFs that contain only images still require
  OCR outside the current workflow.

### Still requires evidence before being called complete

- Run the full acceptance checklist below
- Repair any regression found during the test pass
- Test the workflow with 5-10 target candidates
- Document candidate findings and resulting product decisions
- Update screenshots and record a short end-to-end demonstration

Automated testing, typed API access, and infrastructure work support product
quality, but they are not substitutes for verifying the complete user journey.

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

Items 1-12 now have implementations in the repository. They remain subject to
the unified acceptance pass rather than being treated as verified solely
because code exists.

## Out of Scope Until the MVP Works

- Automatic AI resume rewriting
- SEEK or LinkedIn scraping
- Browser extension
- Email reminders
- Payments or subscriptions
- Kubernetes
- Multi-cloud deployment

These features should be considered only after the core workflow is usable and candidate validation shows a real need.

## AI Integration Principles (For When Automatic AI Resume Rewriting Is Built)

These are not implemented today - the product uses free, explainable local
rules only (see MVP Product Features). This section exists so that when
automatic AI resume rewriting or any other LLM-backed feature is eventually
built, it follows a decided design rather than an improvised one. Drafted
after reviewing two comparable products (an AI CV builder and an open-source
AI job-search agent) for patterns worth adopting.

1. **Untrusted input.** Any user-supplied free text sent to an LLM (job
   descriptions above all) must be wrapped in an explicit delimiter and the
   prompt must state plainly that the wrapped content is data, not
   instructions, and that any instruction-like text inside it must be
   ignored. This prevents prompt injection through a pasted job ad.

2. **Draft and review as two separate calls.** A single prompt that both
   generates and self-checks its own output is not sufficient. Generation
   and review must be two independent calls (different prompt, ideally
   framed as a different role) so the reviewer is not primed to agree with
   the draft. The existing human `ReviewChecklist` component
   (`frontend/src/components/ReviewChecklist.tsx`) is the human layer of
   this pattern; an AI reviewer step would sit before it, not replace it.

3. **Deterministic logic stays deterministic.** The existing rule-based
   matching (Matched / Missing / Transferable skill analysis) must remain
   the source of truth for whether a skill is supported by evidence. An
   LLM may rephrase or explain these results in more natural language, but
   must not be asked to decide the match itself - that keeps the analysis
   explainable and consistent with the "not a black-box score" product
   principle.

4. **Explicit allow-list for any action the AI can take.** If a future
   agent feature does anything beyond generating text - filling a form,
   sending an email, modifying saved data - the set of allowed actions
   must be an explicit, user-visible list, and anything consequential
   needs a confirmation step. This follows the same rule already in place
   for cost: no feature that spends money or acts on the user's behalf
   turns on silently.

### Status: partial implementation (2026-09-21)

The Evidence-first Bullet Builder now has a first real (if small) AI
component, not just rule-based drafting:

- `frontend/src/utils/semanticRelevance.ts` loads a small sentence
  embedding model (`Xenova/all-MiniLM-L6-v2`) at runtime via a dynamic
  import from a public CDN - no npm dependency, no server, no API key, no
  cost. It scores how semantically related a drafted bullet is to the job
  description, as a genuine AI signal alongside the deterministic
  keyword-overlap check in `resumeBulletReviewer.ts`.
- This is wired into `ResumeBulletOptimizer.tsx` as an additional,
  clearly-labelled "AI-assisted relevance check" panel that runs after
  the drafter and the rule-based reviewer, and fails silently (falls back
  to the existing checks) if the model can't load.
- **Not yet verified in a real browser** - it was written and type-checked
  (`npx tsc --noEmit` passes) but not run end to end, because the
  environment used to write it has no browser and restricted network
  access. Before calling this "implemented" per the rule below, load the
  app in an actual browser, generate a draft with a job description
  filled in, and confirm the relevance percentage appears (or fails
  gracefully offline).

Everything else in this section (untrusted input handling, draft/review
separation for generated text, action allow-listing) remains a principle
only - no automatic AI resume rewriting exists yet.

### Status: cover letter + resume trimming additions (2026-09-21)

Three follow-on changes, same "no paid AI, deterministic-by-default"
rules as above:

- `frontend/src/utils/localReview.ts` is a new shared module for the
  word-counting, keyword-overlap, overclaim-phrase, and placeholder
  detection that `resumeBulletReviewer.ts`'s `reviewResumeBullet` and
  `coverLetterDraft.ts`'s `reviewCoverLetterDraft` each used to
  reimplement separately. Both now build their checklists from it;
  `reviewCoverLetterDraft` also gained an "avoids overclaiming" check as
  a direct result of sharing this logic.
- `CoverLetterBuilder.tsx` now runs the same local AI relevance check as
  the bullet builder (`semanticRelevance.ts`), debounced against the
  live draft text and the application's job description, with the same
  silent-fallback behaviour if the model can't load.
- `frontend/src/utils/resumeTrimSuggestions.ts` is a new, fully
  deterministic (no AI) heuristic: it flags resume lines that don't
  share any keyword with the `evidence` text already returned on matched
  or transferable `ReviewAnalysisItem`s from a review, as candidates to
  shorten or cut. It only has resume text to compare on the live
  Resume Review page (`ResumeReviewPage.tsx`), not on saved historical
  reviews, since saved reviews don't currently store the full resume
  text - only the evidence snippets.
- **None of this is verified in a real browser yet**, for the same
  reason as the bullet builder's AI check above: `npx tsc --noEmit`
  passes and the pure-logic pieces (`localReview.ts`,
  `resumeTrimSuggestions.ts`) were exercised with hand-written Node
  test cases against the compiled output, but nothing here has been run
  end to end in an actual browser session.

## Unified Product Acceptance Checklist

The checklist is intentionally unchecked until the dedicated verification
phase. A feature is accepted only when the user-visible result and persisted
data are both confirmed.

### Account and isolation

- [ ] A new user can register, log in, refresh the browser, and remain signed in
- [ ] Invalid credentials and invalid registration data show safe messages
- [ ] User A cannot read, edit, or delete User B's private records
- [ ] Logout removes access to protected pages and APIs

### Application workflow

- [ ] Create, view, edit, archive, restore, search, filter, export, and delete an
  application
- [ ] Save and reload New Zealand role classification fields
- [ ] Add, edit, complete, reopen, postpone, and delete timeline events
- [ ] Confirm timeline changes synchronize the current application status
- [ ] Confirm Dashboard counts, reminders, inactivity, and status links reflect
  saved data

### Resume and review workflow

- [ ] Create, edit, duplicate, delete, and select multiple resume versions
- [ ] Import readable PDF, DOCX, and TXT resume and job-description files
- [ ] Run an explainable review and inspect matched, transferable, and missing
  evidence
- [ ] Save a review and reopen it from Review History, Application Detail, and
  Dashboard
- [ ] Accept or ignore resume actions and create learning priorities
- [ ] Build a truthful bullet, preview insertion, undo it, and save a separate
  resume version

### Interview preparation

- [ ] Save Candidate Profile context and multiple STAR examples
- [ ] Confirm a relevant STAR example is recommended without inventing evidence
- [ ] Draft, clear, save, and change readiness status for interview answers
- [ ] Use read-aloud, timer, and private voice recording in a supported browser
- [ ] Confirm recordings remain local and disappear when the page session ends

### Feedback and reminders

- [ ] Save workflow feedback and verify rating, reuse, category, and page
  summaries
- [ ] Complete and postpone a follow-up directly from Dashboard
- [ ] Enable and disable local browser reminders
- [ ] Export an `.ics` file and import it into a calendar application

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
