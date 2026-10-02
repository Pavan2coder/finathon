import { date, integer, pgEnum, pgTable, primaryKey, real, serial, text, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["employee", "manager", "hr"]);
export const stageEnum = pgEnum("promotion_stage", ["not_ready", "developing", "near_ready", "ready", "promoted"]);
export const cycleStatusEnum = pgEnum("cycle_status", ["closed", "active"]);
export const feedbackKindEnum = pgEnum("feedback_kind", ["peer", "manager"]);
export const requestStatusEnum = pgEnum("request_status", ["not_sent", "sent", "responded", "followed_up", "failed"]);
export const trainingStatusEnum = pgEnum("training_status", ["planned", "in_progress", "done"]);
export const devKindEnum = pgEnum("dev_kind", ["training", "stretch"]);
export const devStatusEnum = pgEnum("dev_status", ["todo", "in_progress", "done"]);
export const eventKindEnum = pgEnum("event_kind", ["deadline", "calibration", "holiday"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  managerId: integer("manager_id"),
  dept: text("dept").notNull(),
  level: integer("level").notNull(),
  title: text("title").notNull(),
  track: text("track").notNull(),
  promotionStage: stageEnum("promotion_stage").notNull().default("not_ready"),
});

export const cycles = pgTable("cycles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  start: date("start").notNull(),
  end: date("end").notNull(),
  status: cycleStatusEnum("status").notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cycleId: integer("cycle_id").notNull(),
  title: text("title").notNull(),
  target: real("target").notNull(),
  actual: real("actual").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cycleId: integer("cycle_id").notNull(),
  outcomeScore: real("outcome_score").notNull(),
  skills: text("skills").array().notNull(),
});

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: integer("project_id").notNull(),
    userId: integer("user_id").notNull(),
    contribution: real("contribution").notNull(),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.userId] })],
);

export const deliverables = pgTable("deliverables", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id"),
  cycleId: integer("cycle_id").notNull(),
  title: text("title").notNull(),
  due: date("due").notNull(),
  delivered: date("delivered"),
  quality: real("quality").notNull(),
  skills: text("skills").array().notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  authorId: integer("author_id").notNull(),
  kind: feedbackKindEnum("kind").notNull(),
  cycleId: integer("cycle_id").notNull(),
  score: real("score").notNull(),
  text: text("text").notNull(),
  skills: text("skills").array().notNull(),
});

export const feedbackRequests = pgTable("feedback_requests", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  cycleId: integer("cycle_id").notNull(),
  status: requestStatusEnum("status").notNull().default("not_sent"),
  sentAt: timestamp("sent_at", { mode: "string", withTimezone: true }),
});

export const trainings = pgTable("trainings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  course: text("course").notNull(),
  skill: text("skill").notNull(),
  status: trainingStatusEnum("status").notNull(),
  completedAt: date("completed_at"),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cycleId: integer("cycle_id").notNull(),
  month: text("month").notNull(),
  workDays: integer("work_days").notNull(),
  presentDays: integer("present_days").notNull(),
});

export const impact = pgTable("impact", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cycleId: integer("cycle_id").notNull(),
  metric: text("metric").notNull(),
  // normalised 0–100 contribution against the metric's target
  value: real("value").notNull(),
  note: text("note").notNull(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cycleId: integer("cycle_id").notNull(),
  managerId: integer("manager_id").notNull(),
  rating: real("rating").notNull(),
});

export const skillMatrix = pgTable(
  "skill_matrix",
  {
    track: text("track").notNull(),
    level: integer("level").notNull(),
    skill: text("skill").notNull(),
    requiredLevel: integer("required_level").notNull(),
  },
  (t) => [primaryKey({ columns: [t.track, t.level, t.skill] })],
);

export const devPlanItems = pgTable("dev_plan_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  kind: devKindEnum("kind").notNull(),
  title: text("title").notNull(),
  skill: text("skill").notNull(),
  due: date("due").notNull(),
  status: devStatusEnum("status").notNull().default("todo"),
  progress: integer("progress").notNull().default(0),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: date("date").notNull(),
  kind: eventKindEnum("kind").notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  entity: text("entity").notNull(),
  entityId: integer("entity_id").notNull(),
  field: text("field").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  reason: text("reason").notNull(),
  actorId: integer("actor_id").notNull(),
  at: timestamp("at", { mode: "string", withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  assigneeId: integer("assignee_id").notNull(),
  creatorId: integer("creator_id").notNull(),
  due: date("due").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] }).notNull(),
  notes: text("notes").notNull(),
  status: text("status", { enum: ["open", "done"] }).notNull(),
  kind: text("kind", { enum: ["task", "stretch"] }).notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  skills: text("skills").array().notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: ["draft", "scheduled", "published"] }).notNull(),
  scheduledAt: timestamp("scheduled_at", { mode: "string", withTimezone: true }),
  at: timestamp("at", { mode: "string", withTimezone: true }).notNull(),
  cheers: integer("cheers").array().notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  authorId: integer("author_id").notNull(),
  kind: text("kind", { enum: ["note", "activity"] }).notNull(),
  title: text("title").notNull(),
  details: text("details").notNull(),
  at: timestamp("at", { mode: "string", withTimezone: true }).notNull(),
});

export type User = typeof users.$inferSelect;
