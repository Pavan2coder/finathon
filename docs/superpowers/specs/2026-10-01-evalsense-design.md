# EvalSense — Design Spec

**Date:** 2026-10-01
**Problem statement:** HRM-05 — AI-Based Performance & Promotion Intelligence
**Status:** Approved in brainstorming; pending written-spec review

## 1. Goal

A performance-intelligence platform that turns simulated goals, projects, deliverables, feedback, training, attendance and business-impact data into evidence-based performance profiles, skill assessments, development gaps and career-path suggestions — and that **detects inconsistent evaluations across managers instead of ranking employees**. Final decisions stay with people.

It is a fresh rebuild. It mirrors the layout and interaction patterns of the Aczen Connect workspace (reference only; no Aczen branding), re-skinned in neo-brutalism with the Clustr palette.

**Success criteria**

- A judge can sign in as employee, manager or HR in one click and see a role-appropriate app.
- Seeded data contains planted lenient / strict / inconsistent managers and evidence-contradiction cases; the engine finds exactly those.
- Every statement on a profile links to the evidence rows behind it.
- No leaderboard or ranked employee list exists anywhere.
- Every rating change and pipeline move is recorded in the audit trail with a reason.
- Deployed to a public Vercel URL backed by Neon Postgres.

## 2. Scope

**In:** the 12 pages in §4, demo-account auth, CSV evidence import, deterministic scoring and consistency engine, audit trail, light + dark theme.

**Out (YAGNI):** Chat, Email, Social (Aczen pages with no HRM-05 role); real sign-up / SSO; live LLM calls (Evidence Assistant is deterministic, template-explained from engine output); notifications; mobile-native app.

## 3. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| DB | Neon Postgres via Vercel Marketplace (`DATABASE_URL` auto-injected) |
| ORM | Drizzle (`db:push` for schema, `db:seed` for data) |
| Styling | Tailwind CSS with design tokens as CSS variables |
| Charts | Recharts (restyled, §5.3) + hand-built SVG diagrams |
| Motion | `motion` (Framer Motion) + CSS keyframes (§5.2) |
| Fonts | Newsreader, Inter, JetBrains Mono via `next/font/google` (§5.1) |
| Validation | zod at every server-action boundary |
| CSV | papaparse |
| Tests | `node --test` (via tsx), no framework |
| Hosting | Vercel; local dev on a Neon dev branch |

Location: this repo (`Pavan2coder/finathon`), on branch `rebuild-nextjs`. The Next.js app replaces the Vite app at the repo root; the old Vite code remains in git history on `main`.

## 4. Roles and pages

Auth: Aczen-style login page with three "Sign in as" buttons for seeded users — **Priya (employee)**, **Ravi (manager)**, **Elena (HR)**. A signed HTTP-only session cookie holds `userId`. Middleware redirects unauthenticated requests to `/login`; `requireRole(...roles)` guards every page and server action. A topbar role switcher signs out and back in as another demo user.

| Page | Route | Employee | Manager | HR | Aczen pattern | Contents |
|---|---|---|---|---|---|---|
| Overview | `/` | ✓ | ✓ | ✓ | Dashboard | Purple hero slab, 4 stat tiles (role-specific), "Log evidence" box (deliverable / impact note), my review tasks, cycle calendar |
| Profile | `/people/[id]` | own | direct reports | all | — | Evidence profile: achievements vs goals, each sentence linked to source rows; performance trend across 3 cycles; evidence score breakdown |
| People | `/people` | — | team | all | CRM table view | Filterable table (dept, level, manager, flag). **Sorted by name, never by score.** |
| Skills & Gaps | `/skills` | own | team | all | — | Radar: demonstrated vs current-level vs next-level expectation; gap list; skill growth over cycles |
| Development Plan | `/development` | own | team | — | Assignments + My Calendar | Recommended training and stretch items per gap; progress tracking; calendar of due dates |
| Promotion Pipeline | `/pipeline` | — | team | all | CRM kanban | Columns: Not ready → Developing → Near ready → Ready → Promoted. Card shows readiness %; drag to move requires a reason; kanban/table toggle |
| Feedback Requests | `/feedback` | respond | send | all | Automations | Status tabs: Not sent · Sent · Responded · Followed up · Failed; send/follow-up actions; employees answer requests addressed to them |
| Calibration | `/calibration` | — | own ratings | all | — | Manager rating distributions; lenient/strict/inconsistent badges; evidence-vs-rating scatter; flagged-case queue with adjust-rating drawer (reason required) |
| Evidence Import | `/import` | — | — | ✓ | Uploads | Pick evidence type (goals, projects, deliverables, training, attendance, impact, feedback), upload CSV, per-row validation report, all-or-nothing commit |
| Review Calendar | `/calendar` | ✓ | ✓ | ✓ | Company calendar | Cycle deadlines, calibration sessions, holidays; HR creates events |
| Audit Trail | `/audit` | — | — | ✓ | — | Chronological log: entity, field, old → new, reason, actor, time; filter by entity/actor |
| Evidence Assistant | `/assistant` | ✓ | ✓ | ✓ | AI / Support | Chat-style panel with quick actions ("Why was this rating flagged?", "What do I need for next level?"); answers are templates filled from engine output, each citing evidence rows |

Managers see only their direct reports; employees only themselves. Enforced in queries, not just UI.

## 5. Visual design — neo-brutalism

**Tokens**

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ink` | `#0F1417` | `#EBEBED` | text, borders, hard shadows |
| `--bg` | `#EBEBED` | `#0F1417` | page background |
| `--card` | `#FFFFFF` | `#1A2024` | card surfaces |
| `--primary` | `#6045F4` | `#6045F4` | primary buttons, active nav, main series |
| `--accent` | `#53E6D4` | `#53E6D4` | highlights, "ready" states, secondary series |
| `--alert` | `#FF5A4E` | `#FF5A4E` | **only** evidence-contradiction flags |

`--ink-rgb` holds the ink colour as space-separated RGB channels for alpha use (grid paper, muted axes). Tints of primary/accent (e.g. 15%, 40%) supply additional chart and status shades. Alert is reserved for flags so it keeps meaning.

**Rules**

- 3px solid `--ink` borders on cards, inputs, buttons, kanban columns.
- Hard offset shadow `4px 4px 0 var(--ink)`, zero blur. Radius ≤ 6px.
- Buttons: on press translate(4px, 4px) and drop shadow (physical press). Cards lift 2px on hover.
- Layout from Aczen: fixed carbon sidebar with mint active item and badge counts; top bar with page title, role switcher, notifications; content max-width with hero slab on Overview; stat tiles in a 4-up grid; mint "sticker" badges.
- Light/dark via `prefers-color-scheme` plus a manual toggle; both themes checked for contrast (WCAG AA on text).
- Works at phone width: sidebar collapses to a drawer; kanban scrolls horizontally inside its container only.

### 5.1 Typography — from CogniSwitch

Loaded via `next/font/google`.

| Role | Font | Spec |
|---|---|---|
| Display / headings | **Newsreader** | 400 weight; H1 72–96px, line-height 0.85, tracking −0.025em; H2 48–60px |
| Body | **Inter** | 400 at 14–16px; 300 for large lead text (18–24px, line-height 1.6) |
| Labels, numbers, IDs, nav, chips | **JetBrains Mono** | 400–600, 12–14px, UPPERCASE, tracking 0.1em |

Stat-tile values and evidence scores use JetBrains Mono (tabular) so digits align.

### 5.2 Motion — from mlritcie.in and Equinox 2.0

Library: `motion` (Framer Motion) for enter/stagger/layout animations; CSS keyframes for loops. No GSAP, no Lenis smooth-scroll (the app is a scrolling dashboard with inner scroll containers where hijacked scroll hurts usability).

| Token / effect | Value | Source | Where used |
|---|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | mlritcie | all hovers, drawer/sidebar, card lift |
| Durations | 180ms (colour), 250ms (hover/press), 450ms (panels), 600ms (enters) | mlritcie | global |
| Section reveal | fade + 24px rise, stagger 60ms, once, on viewport enter | mlritcie | Overview tiles, profile sections, calibration cards |
| `float` | translateY 0 → −12px → 0, 6s loop | both | mint sticker badges, login hero illustration |
| `pulse-ring` | box-shadow ring 0 → 18px fading, 2s loop | mlritcie (`pulse-orange`, recoloured) | coral flag dots, unread notification bell |
| `ping` | scale 1 → 2 fade, 1s | Equinox | "live cycle" status dot, Assistant "online" dot |
| `shimmer` | background-position sweep | mlritcie | loading skeletons |
| `marquee` | translateX 0 → −50%, 42s linear loop | both | login page ticker of HRM-05 evidence sources; audit-trail live ticker on HR Overview |
| `twinkle` | opacity .35→1, scale .85→1.35 | Equinox | a few sparkle glyphs on the login hero only |
| Layered-echo logo | wordmark stacked 3× in purple / mint / ink, offset 4px each, settles on load | Equinox logo mask stack | login hero, sidebar brand on hover |
| Outline word | one hero word rendered with `-webkit-text-stroke` and transparent fill | mlritcie ("BUILD") | login hero: "EVIDENCE **OVER** OPINION" |
| Kanban move | `layout` animation + spring when a card changes column | — | Promotion Pipeline |
| Number count-up | 0 → value over 600ms on first view | — | stat tiles |

All non-essential motion is disabled under `prefers-reduced-motion: reduce` (loops stop, enters become instant fades).

### 5.3 Charts and diagrams — from CogniSwitch "blueprint" style

**Chart surface**

- Every chart sits on a card with the neo-brutal border and hard shadow, over a grid-paper background:
  `linear-gradient(to right, rgb(var(--ink-rgb) / .07) 1px, transparent 1px), linear-gradient(rgb(var(--ink-rgb) / .07) 1px, transparent 1px)`, 24px cells.
- Chart header: JetBrains Mono uppercase label with a small square bullet (`■ LAYER 02: ACTIVE` pattern), Newsreader title below.

**Marks (Recharts, restyled)**

- Lines 1.5–2px, square end dots; no gradients or area glows.
- Bars flat-filled with a 2px ink outline (brutal bars), no rounded tops.
- No chart gridlines (the paper grid replaces them); axes in JetBrains Mono 11px, ink at 60%.
- Reference lines (org mean, level threshold) dashed 1.5px.
- Tooltips are small brutal cards (border + hard shadow), mono values.
- Series order: primary purple → mint → ink → purple 40% tint → mint 40% tint. Coral only for flagged points.

**Chart-by-page**

| Page | Chart |
|---|---|
| Overview | Evidence-score trend (line), readiness distribution (brutal bars) |
| Profile | Evidence breakdown (horizontal brutal bars per component), 3-cycle trend (line) |
| Skills & Gaps | Radar: demonstrated vs current-level vs next-level |
| Calibration | Per-manager rating distribution (strip / dot plot with org-mean dashed line); evidence-vs-rating scatter with the expected-rating band shaded and coral flagged points |

**Blueprint diagrams** (hand-built SVG, CogniSwitch "layer" pattern)

- **Evidence flow** on Profile and login: four stacked layer cards — *Performance evidence → Skill assessment → Development gaps → Career path* — joined by cubic-bezier connector paths (`M x1,100 C x1,50 x2,50 x2,0`), 1.5px purple at 25% opacity, with an animated dash flowing along the path (`stroke-dashoffset` loop, 3s) to show evidence moving upward.
- **Evidence links** on Profile: hovering a claim draws bezier connectors from that sentence to the evidence cards it cites.
- **Career paths**: a node graph of the next level plus lateral tracks, edges labelled with % skill overlap.
- Diagrams are built with `dataviz` and `artifact-diagramming` guidance at implementation time.

## 6. Data model

| Table | Fields |
|---|---|
| `users` | id, name, email, role (`employee`\|`manager`\|`hr`), managerId → users, dept, level (1–5), title, promotionStage |
| `cycles` | id, name, start, end, status (`closed`\|`active`) |
| `goals` | id, userId, cycleId, title, target, actual, status |
| `projects` | id, name, outcomeScore (0–100), skills text[] |
| `project_members` | projectId, userId, contribution (0–1) |
| `deliverables` | id, userId, projectId, cycleId, title, due, delivered, quality (1–5), skills text[] |
| `feedback` | id, subjectId, authorId, kind (`peer`\|`manager`), cycleId, score (1–5), text, skills text[] |
| `feedback_requests` | id, subjectId, reviewerId, cycleId, status (`not_sent`\|`sent`\|`responded`\|`followed_up`\|`failed`), sentAt |
| `trainings` | id, userId, course, skill, status (`planned`\|`in_progress`\|`done`), completedAt |
| `attendance` | id, userId, month, workDays, presentDays |
| `impact` | id, userId, cycleId, metric, value, note |
| `ratings` | id, userId, cycleId, managerId, rating (1–5) |
| `skill_matrix` | level, skill, requiredLevel (1–5) |
| `dev_plan_items` | id, userId, kind (`training`\|`stretch`), title, due, status, progress (0–100), skill |
| `events` | id, title, date, kind (`deadline`\|`calibration`\|`holiday`) |
| `audit_log` | id, entity, entityId, field, oldValue, newValue, reason, actorId, at |

**Seed** (deterministic, fixed RNG seed): ~60 employees across 4 depts, 8 managers, 3 HR users (incl. Elena), 3 cycles (2 closed, 1 active). Planted patterns:

- 2 lenient managers (ratings ~+0.8 above evidence-expected)
- 1 strict manager (~−0.8)
- 1 inconsistent manager (residual SD ~2× org median)
- ~6 contradiction cases (|residual| ≥ 1.5) spread across otherwise-fair managers
- Priya has a clear next-level gap and 2 in-progress dev-plan items; Ravi's team includes one contradiction case

## 7. Engine (`lib/engine/`)

Pure TypeScript, no DB access; takes plain records, returns results. Computed per request from DB rows (≈60 employees, cheap). `ponytail:` computed on read; add a materialised cache if headcount grows past a few thousand.

1. **Evidence score (0–100)** per employee per cycle — weighted sum of normalised components:
   goals attainment 25%, project outcomes 15%, deliverables (on-time × quality) 15%, peer feedback 15%, business impact 15%, training completion 10%, attendance 5%.
   Each component returns `{ value, evidenceIds[] }` so the profile can cite rows. Missing component → weight redistributed, and the profile says so.
2. **Expected rating** — map evidence scores to the 1–5 scale via org-wide quantiles of the cycle's actual rating distribution. `residual = rating − expected`.
3. **Manager consistency** (requires n ≥ 4 ratings in the cycle, else `insufficient_data`):
   - `lenient` — mean residual > +0.5
   - `strict` — mean residual < −0.5
   - `inconsistent` — residual SD > 1.5 × org median SD, **or** Pearson r(evidence, rating) < 0.3
   A manager can be both lenient/strict and inconsistent.
4. **Case flags** — `|residual| ≥ 1.5` → contradiction flag, routed to the Calibration queue.
5. **Skill assessment** — per skill: weighted mean of deliverable quality and project outcome on items tagged with that skill, blended with feedback scores that tag it, mapped to 1–5. Compared to `skill_matrix` for current and next level → gaps. Growth = per-cycle series.
6. **Development recommendations** — for each next-level gap: matching trainings (by skill) and a stretch assignment template.
7. **Promotion readiness** — next-level criteria: every required skill ≥ requiredLevel, evidence score ≥ 75 in the last two cycles, required trainings done. Readiness % = criteria met / total; output lists each unmet criterion in plain language.
8. **Career paths** — from the level/skill matrix: next level on the current track plus lateral tracks whose skill profile overlaps ≥ 70% with demonstrated skills.

**Guardrails:** engine never outputs a ranking; UI never sorts people by score. All thresholds live in one `thresholds.ts` constant object.

## 8. Server actions and data flow

- Pages are server components reading via Drizzle, then passing rows through the engine.
- Mutations are server actions, each: `requireRole` → zod parse → DB write in a transaction → `audit_log` insert when it changes a rating or pipeline stage → `revalidatePath`.
- Actions: `logEvidence`, `sendFeedbackRequest`, `followUpFeedbackRequest`, `respondToFeedback`, `movePipelineStage` (reason required), `adjustRating` (reason required), `updateDevPlanItem`, `createEvent` (HR), `importCsv` (HR).
- **CSV import:** papaparse → zod schema per evidence type → collect row errors. Any error: nothing is written; UI shows a table of row number, column, message. No errors: bulk insert in one transaction, show count.

## 9. Error and empty states

- `insufficient_data` badge for managers with < 4 ratings.
- Aczen-style empty states on every list ("No tasks scheduled for this date").
- DB unreachable → Next.js `error.tsx` boundary with a retry button.
- Forbidden route for a role → redirect to `/` with a toast.
- Calibration and pipeline actions reject empty reasons (zod) with inline field error.

## 10. Testing

- `lib/engine/engine.test.ts` (`node --test`): fixtures for a lenient manager, a strict one, an inconsistent one, a contradiction case, insufficient data, and a readiness calculation with a known missing criterion.
- `scripts/seed-check.ts`: runs the engine over the seeded dataset; asserts it flags exactly the planted managers and contradiction cases. Runs in `npm test`.
- Manual smoke: Playwright click-through of every page under each of the three roles, screenshots checked in light and dark.

## 11. Deployment

1. `vercel link`, add Neon via Vercel Marketplace (creates prod DB, sets `DATABASE_URL`).
2. Create a Neon dev branch for local work; `vercel env pull` for local `.env`.
3. `npm run db:push && npm run db:seed` against each branch.
4. `vercel deploy` → preview; promote to production once smoke passes.
5. `SESSION_SECRET` set in Vercel env for cookie signing.

## 12. Open items

None blocking. Product name "EvalSense" is a default and can be changed before implementation.

## 13. Addendum (2026-10-01): full Aczen Connect replica

Decision: replicate every Aczen Connect page and interaction, re-skinned in the neo-brutal system, with sales-specific pages pointed at HRM-05 content. This supersedes the §2 "Out" list for Chat, Email and Social.

| Aczen page | EvalSense route | Content |
|---|---|---|
| Dashboard | `/` | Punch in/out (rotating verification code + camera snapshot), daily work update, 6 stat tiles, My Assignments + Assign Task, tasks calendar + Add Task; role headline on top. Punches → attendance evidence, work updates → deliverable evidence |
| CRM | `/pipeline` | Talent pipeline: stat tiles, board/table, stage + owner filters, nominate, CSV import/export, detail drawer with notes, log activity and activity timeline |
| Automations | `/feedback` | Feedback automation: status tabs + Analytics tab (sent → opened → responded → followed up; personalised vs generic asks) |
| Social | `/recognition` | Recognition wall: kudos posts, calendar + list views, draft/schedule, skill tags → peer evidence |
| AI | `/assistant` | Evidence assistant |
| Assignments | `/assignments` | Tasks assigned to / by me, assign to coworker (incl. stretch assignments) |
| My Calendar | `/my-calendar` | Task + development-plan calendar, Add Task |
| Company | `/calendar` | Review-cycle calendar |
| Leaves | `/leaves` | Balances, request, history; manager/HR approve or reject |
| Chat | `/chat` | 1:1 in-app messaging |
| Email | `/email` | Inbox, Sent, Compose (To, CC, tag), reply threads |
| Uploads | `/import` | Evidence import |
| Support | `/support` | Help hub: tickets, "how is my score computed", knowledge base |

HRM-05 group in the sidebar: People, Profile, Skills & gaps, Development plan, Calibration, Audit trail.
