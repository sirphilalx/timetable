import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Offline sync outbox queue
export const syncOutbox = sqliteTable("sync_outbox", {
  id: text("id").primaryKey(),
  actionType: text("action_type").notNull(),
  entityType: text("entity_type").notNull(),
  payload: text("payload").notNull(),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: integer("created_at").notNull()
});

// Student account profile
export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  institution: text("institution"),
  dateOfBirth: text("date_of_birth"),
  isMinor: integer("is_minor").notNull().default(0),
  guardianConsentStatus: text("guardian_consent_status").notNull().default("none"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});

// Academic semester
export const semesters = sqliteTable("semesters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isCurrent: integer("is_current").notNull().default(1),
  createdAt: integer("created_at").notNull()
});

// Registered courses
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  units: integer("units").notNull().default(2),
  color: text("color").notNull().default("#2563EB"),
  lecturer: text("lecturer"),
  isArchived: integer("is_archived").notNull().default(0),
  createdAt: integer("created_at").notNull()
});

// Recurring weekly class rules
export const classRules = sqliteTable("class_rules", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  classType: text("class_type").notNull().default("lecture"),
  weekday: integer("weekday").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  venue: text("venue").notNull(),
  source: text("source").notNull().default("manual"),
  createdAt: integer("created_at").notNull()
});

// Specific class occurrences
export const classOccurrences = sqliteTable("class_occurrences", {
  id: text("id").primaryKey(),
  ruleId: text("rule_id"),
  date: text("date").notNull(),
  status: text("status").notNull().default("scheduled"),
  overrideTime: text("override_time"),
  overrideVenue: text("override_venue"),
  createdAt: integer("created_at").notNull()
});

// Attendance records
export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey(),
  occurrenceId: text("occurrence_id").notNull(),
  status: text("status").notNull().default("unknown"),
  answeredAt: integer("answered_at"),
  createdAt: integer("created_at").notNull()
});

// Assignments
export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueAt: text("due_at").notNull(),
  type: text("type").notNull().default("solo"),
  status: text("status").notNull().default("not_started"),
  source: text("source").notNull().default("manual"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
