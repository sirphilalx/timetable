CREATE TABLE `assignment_group_members` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`student_id` text NOT NULL,
	`joined_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `assignment_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assignment_group_member_uniq` ON `assignment_group_members` (`group_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `assignment_group_member_student_idx` ON `assignment_group_members` (`student_id`);--> statement-breakpoint
CREATE INDEX `assignment_group_member_is_deleted_idx` ON `assignment_group_members` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `assignment_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`group_number` integer NOT NULL,
	`label` text NOT NULL,
	`max_capacity` integer DEFAULT 5 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assignment_groups_num_uniq` ON `assignment_groups` (`assignment_id`,`group_number`);--> statement-breakpoint
CREATE INDEX `assignment_groups_assignment_idx` ON `assignment_groups` (`assignment_id`);--> statement-breakpoint
CREATE INDEX `assignment_groups_is_deleted_idx` ON `assignment_groups` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`creator_student_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`due_at` text NOT NULL,
	`type` text DEFAULT 'solo' NOT NULL,
	`visibility` text DEFAULT 'personal' NOT NULL,
	`suggestion_status` text DEFAULT 'none' NOT NULL,
	`suggested_by_student_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creator_student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`suggested_by_student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `assignments_course_idx` ON `assignments` (`course_id`);--> statement-breakpoint
CREATE INDEX `assignments_creator_idx` ON `assignments` (`creator_student_id`);--> statement-breakpoint
CREATE INDEX `assignments_is_deleted_idx` ON `assignments` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`occurrence_id` text NOT NULL,
	`student_id` text NOT NULL,
	`status` text DEFAULT 'unknown' NOT NULL,
	`answered_at` text,
	`expires_at` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`occurrence_id`) REFERENCES `class_occurrences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_occurrence_student_uniq` ON `attendance_records` (`occurrence_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `attendance_student_idx` ON `attendance_records` (`student_id`);--> statement-breakpoint
CREATE INDEX `attendance_is_deleted_idx` ON `attendance_records` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `class_occurrences` (
	`id` text PRIMARY KEY NOT NULL,
	`rule_id` text,
	`course_id` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`venue` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`override_reason` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `class_rules`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `class_occurrences_course_date_idx` ON `class_occurrences` (`course_id`,`date`);--> statement-breakpoint
CREATE INDEX `class_occurrences_rule_idx` ON `class_occurrences` (`rule_id`);--> statement-breakpoint
CREATE INDEX `class_occurrences_is_deleted_idx` ON `class_occurrences` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `class_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`weekday` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`venue` text NOT NULL,
	`class_type` text DEFAULT 'lecture' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `class_rules_course_idx` ON `class_rules` (`course_id`);--> statement-breakpoint
CREATE INDEX `class_rules_weekday_idx` ON `class_rules` (`weekday`);--> statement-breakpoint
CREATE INDEX `class_rules_is_deleted_idx` ON `class_rules` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `course_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_student_id` text NOT NULL,
	`name` text NOT NULL,
	`institution` text NOT NULL,
	`share_code` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`owner_student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_groups_share_code_unique` ON `course_groups` (`share_code`);--> statement-breakpoint
CREATE INDEX `course_groups_owner_idx` ON `course_groups` (`owner_student_id`);--> statement-breakpoint
CREATE INDEX `course_groups_share_code_idx` ON `course_groups` (`share_code`);--> statement-breakpoint
CREATE INDEX `course_groups_is_deleted_idx` ON `course_groups` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `course_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`student_id` text NOT NULL,
	`role` text DEFAULT 'follower' NOT NULL,
	`joined_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `course_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_memberships_group_student_uniq` ON `course_memberships` (`group_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `course_memberships_student_idx` ON `course_memberships` (`student_id`);--> statement-breakpoint
CREATE INDEX `course_memberships_is_deleted_idx` ON `course_memberships` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`semester_id` text NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`units` integer DEFAULT 2 NOT NULL,
	`color` text DEFAULT '#4F46E5' NOT NULL,
	`lecturer_name` text,
	`lecturer_phone` text,
	`lecturer_email` text,
	`shared_group_id` text,
	`is_archived` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `courses_semester_idx` ON `courses` (`semester_id`);--> statement-breakpoint
CREATE INDEX `courses_shared_group_idx` ON `courses` (`shared_group_id`);--> statement-breakpoint
CREATE INDEX `courses_is_deleted_idx` ON `courses` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `guardian_consents` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`guardian_name` text NOT NULL,
	`guardian_contact` text NOT NULL,
	`consent_token` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`requested_at` text NOT NULL,
	`responded_at` text,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guardian_consents_consent_token_unique` ON `guardian_consents` (`consent_token`);--> statement-breakpoint
CREATE INDEX `guardian_consents_student_idx` ON `guardian_consents` (`student_id`);--> statement-breakpoint
CREATE INDEX `guardian_consents_token_idx` ON `guardian_consents` (`consent_token`);--> statement-breakpoint
CREATE INDEX `guardian_consents_is_deleted_idx` ON `guardian_consents` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `semesters` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_current` integer DEFAULT 1 NOT NULL,
	`is_paused` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `semesters_student_idx` ON `semesters` (`student_id`);--> statement-breakpoint
CREATE INDEX `semesters_is_current_idx` ON `semesters` (`is_current`);--> statement-breakpoint
CREATE INDEX `semesters_is_deleted_idx` ON `semesters` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `student_assignment_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`student_id` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assignment_progress_uniq` ON `student_assignment_progress` (`assignment_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `assignment_progress_student_idx` ON `student_assignment_progress` (`student_id`);--> statement-breakpoint
CREATE INDEX `assignment_progress_is_deleted_idx` ON `student_assignment_progress` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_user_id` text,
	`display_name` text NOT NULL,
	`email` text,
	`institution` text,
	`date_of_birth` text,
	`is_minor` integer DEFAULT 0 NOT NULL,
	`guardian_consent_status` text DEFAULT 'none' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_clerk_user_id_unique` ON `students` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `students_clerk_user_idx` ON `students` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `students_is_deleted_idx` ON `students` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `sync_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`action_type` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 5 NOT NULL,
	`last_error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sync_outbox_status_idx` ON `sync_outbox` (`status`);--> statement-breakpoint
CREATE INDEX `sync_outbox_created_idx` ON `sync_outbox` (`created_at`);