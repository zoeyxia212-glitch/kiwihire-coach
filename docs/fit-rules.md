# Fit rules

KiwiHire's fit summary is built from rules you can read. Nothing is sent to a
paid service and nothing is predicted. The code lives in `frontend/src/utils`.

## Gates (run first, not scored)

**Work rights** (`eligibilityGate.ts`). Runs only when the Candidate Profile says
the user is not a citizen or resident.

| Posting says | Result |
|---|---|
| Citizenship, permanent residence or a security clearance is required | Not eligible. The role is not scored. The sentence is quoted. |
| Names visa holders, international applicants or sponsorship | Eligible. The sentence is quoted. A general welcome adds a reminder to confirm this role is covered. |
| Says nothing | Not confirmed. Silence is not permission, so check the employer's own page. |
| Says "right to work" without more | Not confirmed. It may mean any permit or citizens only. |

"Preferred" wording is never a failure. A refusal to sponsor is a note, not a failure.

**Languages** (`languageRequirements.ts`). KiwiHire does not store the languages a
person speaks, so it quotes the requirement and leaves the judgement to the user.

## Score (`fitSummary.ts`)

| Dimension | Weight | Source |
|---|---|---|
| Skills match | 50 | Resume analysis: matched skills count fully, transferable ones half |
| Role alignment | 30 | Role title against the target roles in the Candidate Profile |
| Level fit | 20 | Career stage against the role's career level |

Dimensions with no data are left out and the remaining weights are rebalanced.
They are never counted as zero. Without a skills result there is no score.

| Score | Band | Advice |
|---|---|---|
| 75+ | Strong | Tailor your resume and cover letter closely |
| 60 to 74 | Good | Apply, and speak to the gaps in your cover letter |
| 45 to 59 | Moderate | Decide deliberately; gaps may need real evidence first |
| 30 to 44 | Weak | Only apply with a strategic reason |
| Under 30 | Poor | Time is better spent elsewhere |

Location is a note, not a weight.

## Attention rules (`applicationAttention.ts`)

- A saved role that was never submitted is never "quiet".
- A saved role whose closing date has passed is listed as closed before applying.
- A submitted, open application is due a follow-up after 10 days and is stale
  after 60 days.
- Offers, rejections and withdrawals are finished.

## Job text safety (`jobTextSanitizer.ts`)

Pasted job text has invisible characters removed before it is stored. Lines that
read like instructions to an AI tool, and words that mix look-alike letters, are
reported but never deleted, and the user is never blocked.

## Credit

The gates, thresholds, follow-up rules and text clean-up were adapted from ideas in
[MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search)
(MIT licence). The wording and code here are KiwiHire's own.

## Interview preparation, skill gaps and evidence checks

- **Question priority** (`questionPriority.ts`): prior interview feedback first, then skill gaps, then job requirements, then general questions. Questions are not reordered on screen because saved answers are stored by position; a "Practise these first" list is shown instead.
- **Consistency brief** (`consistencyBrief.ts`): up to 8 resume claims that match a job requirement or contain a figure, so you can check you can speak to each one.
- **Weighted skill gaps** (`skillGapPriority.ts`): the latest review per application counts, weighted by its fit score (score / 100). Gaps from roles you are close to fit weigh more. Unscored reviews are skipped and counted in a note.
- **Grounding check** (`groundingCheck.ts`): a cover letter that names a technical skill (from a fixed whitelist) not found in the profile, submitted resume or evidence items shows an "Evidence check" notice. It warns and never blocks.

## Interview round, gap questions

- **Interview round** (`interviewFocus.ts`): business or HR. It does not reorder questions (saved answers are stored by position). It shows which listed questions suit the round, and adds fixed HR questions for the HR round.
- **Gap questions** (`gapChallenges.ts`): each skill gap becomes one question with an honest answer frame (say you have not used it, name the closest thing you have done, give a learning step). Limit 3 for business, 2 for HR. A skill that already has a question is skipped, so each topic is asked once.
- Idea source: XiaqiuOO/interview-ready-skill (no licence file, so only the idea is used).

## Languages, pre-submit checks, claim trace

- **Language gate**: the profile now stores "Languages you speak" (V2 migration, `spoken_languages`). A language the posting asks for at fluent or native level, not marked as a bonus, and not on the profile fails the gate and the role is not scored. Everything else is shown with its quoted wording. With no languages saved, the requirement is shown as unchecked and never fails. "Chinese" is met by Mandarin or Cantonese.
- **Pre-submit checks** (`submitChecks.ts`): closing date, work rights, language, cover letter claims, hidden text in the saved posting, and CV review. Fail means fix first, warn means take a look. Nothing blocks submitting.
- **Claim trace** (`claimTrace.ts`): each cover letter sentence that names a tracked skill lists the sources that mention it (profile, submitted resume, named evidence item), or "no evidence".
- **Timeline notes** now count as prior feedback for the "practise first" list, and the chosen interview round is remembered in the browser.

## Insights, offers, work rights pointers

- **Insights** (`insights.ts`): sent, responded, interviewed and offers by source and by resume sent. Uses the current status only. "Responded" means moved past Applied; Withdrawn is not a response. Groups under 5 are marked as small samples, and no source is called best or worst unless at least two groups have 5 or more.
- **Offer comparison** (`offerCompare.ts`): each criterion is scored within the offers compared, weighted by the person's own 0 to 5 priorities. A blank figure is skipped and weights rebalance, so missing never means zero. Offers are kept in the browser only.
- **Work rights pointers** (`visaHints.ts`): general pointers with links to Immigration New Zealand pages (AEWV, accredited employer list, post-study work visa). Not immigration advice and not a verdict.
