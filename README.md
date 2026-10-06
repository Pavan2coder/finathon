# EvalSense

Evidence over opinion. A performance and promotion app (HRM-05) that puts every rating next to the goals, deliverables and feedback behind it, and flags managers whose scores drift from the evidence.

Three demo roles, each seeing a different slice of the same data: employee (Priya Sharma), manager (Ravi Kumar) and HR (Elena Rostova).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 and pick a person on the sign-in page.

## Databases
We can Set mongo db or supabase
Set `DATABASE_URL` to a Supabase Postgres connection string (use the transaction pooler URI, port 6543). On first request an empty database is seeded with the simulated dataset. Without `DATABASE_URL`, the app uses an embedded PGlite database in `.pglite/`.

The schema lives in `src/db/schema.ts`; the initial migration is in `drizzle/`.

## Deploy

On Vercel, add `DATABASE_URL` (and `SESSION_SECRET`) as environment variables before deploying.

## Test

```bash
npm test
```
