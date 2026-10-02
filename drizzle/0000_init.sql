CREATE TYPE "public"."cycle_status" AS ENUM('closed', 'active');--> statement-breakpoint
CREATE TYPE "public"."dev_kind" AS ENUM('training', 'stretch');--> statement-breakpoint
CREATE TYPE "public"."dev_status" AS ENUM('todo', 'in_progress', 'done');--> statement-breakpoint
CREATE TYPE "public"."event_kind" AS ENUM('deadline', 'calibration', 'holiday');--> statement-breakpoint
CREATE TYPE "public"."feedback_kind" AS ENUM('peer', 'manager');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('not_sent', 'sent', 'responded', 'followed_up', 'failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('employee', 'manager', 'hr');--> statement-breakpoint
CREATE TYPE "public"."promotion_stage" AS ENUM('not_ready', 'developing', 'near_ready', 'ready', 'promoted');--> statement-breakpoint
CREATE TYPE "public"."training_status" AS ENUM('planned', 'in_progress', 'done');--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"cycle_id" integer NOT NULL,
	"month" text NOT NULL,
	"work_days" integer NOT NULL,
	"present_days" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer NOT NULL,
	"field" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"reason" text NOT NULL,
	"actor_id" integer NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start" date NOT NULL,
	"end" date NOT NULL,
	"status" "cycle_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"cycle_id" integer NOT NULL,
	"title" text NOT NULL,
	"due" date NOT NULL,
	"delivered" date,
	"quality" real NOT NULL,
	"skills" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_plan_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"kind" "dev_kind" NOT NULL,
	"title" text NOT NULL,
	"skill" text NOT NULL,
	"due" date NOT NULL,
	"status" "dev_status" DEFAULT 'todo' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"kind" "event_kind" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"kind" "feedback_kind" NOT NULL,
	"cycle_id" integer NOT NULL,
	"score" real NOT NULL,
	"text" text NOT NULL,
	"skills" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"cycle_id" integer NOT NULL,
	"status" "request_status" DEFAULT 'not_sent' NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"cycle_id" integer NOT NULL,
	"title" text NOT NULL,
	"target" real NOT NULL,
	"actual" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impact" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"cycle_id" integer NOT NULL,
	"metric" text NOT NULL,
	"value" real NOT NULL,
	"note" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"details" text NOT NULL,
	"at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"skills" text[] NOT NULL,
	"content" text NOT NULL,
	"status" text NOT NULL,
	"scheduled_at" timestamp with time zone,
	"at" timestamp with time zone NOT NULL,
	"cheers" integer[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"contribution" real NOT NULL,
	CONSTRAINT "project_members_project_id_user_id_pk" PRIMARY KEY("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cycle_id" integer NOT NULL,
	"outcome_score" real NOT NULL,
	"skills" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"cycle_id" integer NOT NULL,
	"manager_id" integer NOT NULL,
	"rating" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_matrix" (
	"track" text NOT NULL,
	"level" integer NOT NULL,
	"skill" text NOT NULL,
	"required_level" integer NOT NULL,
	CONSTRAINT "skill_matrix_track_level_skill_pk" PRIMARY KEY("track","level","skill")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"assignee_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"due" date NOT NULL,
	"priority" text NOT NULL,
	"notes" text NOT NULL,
	"status" text NOT NULL,
	"kind" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course" text NOT NULL,
	"skill" text NOT NULL,
	"status" "training_status" NOT NULL,
	"completed_at" date
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "role" NOT NULL,
	"manager_id" integer,
	"dept" text NOT NULL,
	"level" integer NOT NULL,
	"title" text NOT NULL,
	"track" text NOT NULL,
	"promotion_stage" "promotion_stage" DEFAULT 'not_ready' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
