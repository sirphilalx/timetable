CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`due_at` text NOT NULL,
	`type` text DEFAULT 'solo' NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`occurrence_id` text NOT NULL,
	`status` text DEFAULT 'unknown' NOT NULL,
	`answered_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `class_occurrences` (
	`id` text PRIMARY KEY NOT NULL,
	`rule_id` text,
	`date` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`override_time` text,
	`override_venue` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `class_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`class_type` text DEFAULT 'lecture' NOT NULL,
	`weekday` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`venue` text NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`units` integer DEFAULT 2 NOT NULL,
	`color` text DEFAULT '#2563EB' NOT NULL,
	`lecturer` text,
	`is_archived` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `semesters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_current` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`email` text,
	`institution` text,
	`date_of_birth` text,
	`is_minor` integer DEFAULT 0 NOT NULL,
	`guardian_consent_status` text DEFAULT 'none' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`action_type` text NOT NULL,
	`entity_type` text NOT NULL,
	`payload` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer NOT NULL
);
