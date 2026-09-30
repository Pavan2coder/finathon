# EvalSense Implementation Plan (lean)

**Spec:** `docs/superpowers/specs/2026-10-01-evalsense-design.md`
**Execution:** native, one commit per task, on branch `rebuild-nextjs`.

**Stack:** Next.js App Router + TS, Tailwind v4, Drizzle (pg dialect), Neon in prod / PGlite locally, zod, papaparse, motion, Recharts, `node --test` via tsx.

## Review focus (inputs the spec implies)

1. Manager with < 4 ratings → `insufficient_data`, never lenient/strict.
2. Employee missing a whole evidence component (e.g. no training) → weight redistributed, profile says so.
3. Manager opening a non-report's profile URL → redirect, not data.
4. CSV with one bad row among good rows → nothing inserted, bad row listed.
5. Empty reason on rating adjust / pipeline move → rejected with inline error.

## Tasks

- [ ] **1. Scaffold** — remove Vite app; create Next.js app at repo root; tokens, fonts, keyframes in `globals.css`; `npm run dev` shows placeholder. Test: `npm run build`.
- [ ] **2. DB** — `src/db/schema.ts` (16 tables), `src/db/index.ts` (Neon via `pg` when `DATABASE_URL` set, else PGlite at `.pglite/`), `drizzle.config.ts`, `db:push`. Test: push succeeds against PGlite.
- [ ] **3. Engine** — `src/lib/engine/{thresholds,evidence,consistency,skills,readiness,career,index}.ts` pure functions. Test: `engine.test.ts` covers lenient, strict, inconsistent, contradiction, insufficient data, missing component, readiness with known missing criterion.
- [ ] **4. Seed + seed-check** — `scripts/seed.ts` deterministic with planted patterns; `scripts/seed-check.ts` asserts engine finds exactly them. Test: `npm test`.
- [ ] **5. Auth + shell** — signed cookie session (`src/lib/session.ts`), `middleware.ts`, `requireRole`, scope helper (`visibleUserIds`), login page (echo logo, outline word, marquee), sidebar + topbar + role switcher + theme toggle. Test: Playwright sign-in as each role.
- [ ] **6. UI kit** — `src/components/ui/*`: Card, Button, Badge, StatTile (count-up), Reveal (stagger), ChartCard (grid paper), EmptyState, Drawer, Tabs; Recharts theme. Test: build.
- [ ] **7. Overview + People + Profile** — role-specific tiles, log-evidence action, evidence profile with linked claims + evidence-flow diagram, trend + breakdown charts. Test: Playwright profile shows cited evidence; manager blocked from non-report.
- [ ] **8. Skills + Development + career graph** — radar, gaps, recommendations, dev-plan progress action, calendar, career node graph.
- [ ] **9. Pipeline + Feedback** — kanban with drag, reason dialog, layout animation, table toggle; feedback status tabs + send/follow-up/respond actions. Audit rows written.
- [ ] **10. Calibration + Audit** — manager distributions, badges, scatter with band, flagged queue, adjust-rating drawer; audit trail page with filters.
- [ ] **11. Import + Calendar + Assistant** — CSV all-or-nothing import with row errors; review calendar + HR create event; deterministic assistant with quick actions citing evidence.
- [ ] **12. Deploy** — Vercel link, Neon via Marketplace, env, push + seed, deploy, smoke all roles in light/dark.
