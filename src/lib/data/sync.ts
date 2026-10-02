import "server-only";
import type { PgTable } from "drizzle-orm/pg-core";
import { db, schema as s } from "@/db";
import type { Dataset } from "./generate";
import { store } from "./repo";

type Key = Exclude<keyof Dataset, "planted">;

const TABLES: Record<Key, PgTable> = {
  users: s.users, cycles: s.cycles, goals: s.goals, projects: s.projects, members: s.projectMembers,
  deliverables: s.deliverables, feedback: s.feedback, requests: s.feedbackRequests, trainings: s.trainings,
  attendance: s.attendance, impact: s.impact, ratings: s.ratings, matrix: s.skillMatrix,
  devItems: s.devPlanItems, events: s.events, audit: s.auditLog, tasks: s.tasks, posts: s.posts, notes: s.notes,
};
const KEYS = Object.keys(TABLES) as Key[];

// Postgres hands timestamps back as "2026-10-01 05:00:00+00"; the app compares ISO strings.
const ISO_FIELDS = ["sentAt", "at", "scheduledAt"];
const toIso = (row: Record<string, unknown>) => {
  for (const f of ISO_FIELDS) if (typeof row[f] === "string") row[f] = new Date(row[f] as string).toISOString();
  return row;
};

const saved = {} as Record<Key, string>;
const snap = (k: Key) => JSON.stringify(store[k]);

async function write(keys: Key[]) {
  await db.transaction(async (tx) => {
    for (const k of keys) {
      await tx.delete(TABLES[k]);
      if (store[k].length) await tx.insert(TABLES[k]).values(store[k] as never[]);
    }
  });
}

async function load() {
  const empty = (await db.select().from(s.users).limit(1)).length === 0;
  if (empty) await write(KEYS); // fresh database: seed it with the generated dataset
  else for (const k of KEYS) (store[k] as unknown[]) = ((await db.select().from(TABLES[k])) as Record<string, unknown>[]).map(toIso);
  for (const k of KEYS) saved[k] = snap(k);
}

const g = globalThis as unknown as { __ready?: Promise<void> };
/** Fills the in-memory store from Postgres once per server process. */
export const ready = () => (g.__ready ??= load().catch((e) => { g.__ready = undefined; throw e; }));

// ponytail: rewrites whole changed collections, last-write-wins across server instances.
// Fine at demo scale; move to per-row upserts in each action if data or instances grow.
let queue: Promise<void> = Promise.resolve();
/** Persists every collection that changed since the last sync. Runs one at a time: a request schedules it once per getViewer call. */
export const sync = () => (queue = queue.then(flush, flush));

async function flush() {
  await ready();
  const changed = KEYS.filter((k) => snap(k) !== saved[k]);
  if (!changed.length) return;
  const snaps = changed.map(snap);
  await write(changed);
  changed.forEach((k, i) => (saved[k] = snaps[i]));
}
