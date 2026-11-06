import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";

// 1. Student account profile
export const students = sqliteTable(
  "students",
  {
    id: text("id").primaryKey(), // UUID v4
    clerkUserId: text("clerk_user_id").unique(),
    displayName: text("display_name").notNull(),
    email: text("email"),
    institution: text("institution"),
    dateOfBirth: text("date_of_birth"), // ISO date YYYY-MM-DD
    isMinor: integer("is_minor").notNull().default(0), // 0=adult, 1=minor under 18
    guardianConsentStatus: text("guardian_consent_status").notNull().default("none"), // 'none' | 'pending' | 'approved' | 'declined'
    createdAt: text("created_at").notNull(), // ISO 8601 UTC
    updatedAt: text("updated_at").notNull(), // ISO 8601 UTC
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    index("students_clerk_user_idx").on(table.clerkUserId),
    index("students_is_deleted_idx").on(table.isDeleted),
  ],
);

// 2. Minor guardian consent records (NDPA 2023 compliance)
export const guardianConsents = sqliteTable(
  "guardian_consents",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    guardianName: text("guardian_name").notNull(),
    guardianContact: text("guardian_contact").notNull(),
    consentToken: text("consent_token").notNull().unique(),
    status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'declined' | 'expired'
    requestedAt: text("requested_at").notNull(),
    respondedAt: text("responded_at"),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    index("guardian_consents_student_idx").on(table.studentId),
    index("guardian_consents_token_idx").on(table.consentToken),
    index("guardian_consents_is_deleted_idx").on(table.isDeleted),
  ],
);

// 3. Academic semester
export const semesters = sqliteTable(
  "semesters",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startDate: text("start_date").notNull(), // YYYY-MM-DD
    endDate: text("end_date").notNull(), // YYYY-MM-DD
    isCurrent: integer("is_current").notNull().default(1),
    isPaused: integer("is_paused").notNull().default(0), // strike pause mode
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    index("semesters_student_idx").on(table.studentId),
    index("semesters_is_current_idx").on(table.isCurrent),
    index("semesters_is_deleted_idx").on(table.isDeleted),
  ],
);

// 4. Registered courses
export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    semesterId: text("semester_id")
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    title: text("title").notNull(),
    units: integer("units").notNull().default(2),
    color: text("color").notNull().default("#4F46E5"),
    lecturerName: text("lecturer_name"),
    lecturerPhone: text("lecturer_phone"),
    lecturerEmail: text("lecturer_email"),
    sharedGroupId: text("shared_group_id"),
    isArchived: integer("is_archived").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    index("courses_semester_idx").on(table.semesterId),
    index("courses_shared_group_idx").on(table.sharedGroupId),
    index("courses_is_deleted_idx").on(table.isDeleted),
  ],
);

// 5. Shared master course group (published by course rep)
export const courseGroups = sqliteTable(
  "course_groups",
  {
    id: text("id").primaryKey(),
    ownerStudentId: text("owner_student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    institution: text("institution").notNull(),
    shareCode: text("share_code").notNull().unique(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    index("course_groups_owner_idx").on(table.ownerStudentId),
    index("course_groups_share_code_idx").on(table.shareCode),
    index("course_groups_is_deleted_idx").on(table.isDeleted),
  ],
);

// 6. Course group memberships (followers and reps)
export const courseMemberships = sqliteTable(
  "course_memberships",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => courseGroups.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("follower"), // 'rep' | 'editor' | 'follower'
    joinedAt: text("joined_at").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    uniqueIndex("course_memberships_group_student_uniq").on(table.groupId, table.studentId),
    index("course_memberships_student_idx").on(table.studentId),
    index("course_memberships_is_deleted_idx").on(table.isDeleted),
  ],
);

// 7. Recurring weekly class schedule rules
export const classRules = sqliteTable(
  "class_rules",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(), // 1=Monday to 7=Sunday
    startTime: text("start_time").notNull(), // HH:MM (e.g. 08:00)
    endTime: text("end_time").notNull(), // HH:MM (e.g. 10:00)
    venue: text("venue").notNull(),
    classType: text("class_type").notNull().default("lecture"), // 'lecture' | 'tutorial' | 'lab' | 'seminar'
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    index("class_rules_course_idx").on(table.courseId),
    index("class_rules_weekday_idx").on(table.weekday),
    index("class_rules_is_deleted_idx").on(table.isDeleted),
  ],
);

// 8. Specific class occurrences (persisted overrides and attendance anchors)
export const classOccurrences = sqliteTable(
  "class_occurrences",
  {
    id: text("id").primaryKey(),
    ruleId: text("rule_id").references(() => classRules.id, { onDelete: "set null" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // ISO date YYYY-MM-DD
    startTime: text("start_time").notNull(), // HH:MM
    endTime: text("end_time").notNull(), // HH:MM
    venue: text("venue").notNull(),
    status: text("status").notNull().default("scheduled"), // 'scheduled' | 'moved' | 'cancelled' | 'completed'
    overrideReason: text("override_reason"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    index("class_occurrences_course_date_idx").on(table.courseId, table.date),
    index("class_occurrences_rule_idx").on(table.ruleId),
    index("class_occurrences_is_deleted_idx").on(table.isDeleted),
  ],
);

// 9. Attendance check in records
export const attendanceRecords = sqliteTable(
  "attendance_records",
  {
    id: text("id").primaryKey(),
    occurrenceId: text("occurrence_id")
      .notNull()
      .references(() => classOccurrences.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("unknown"), // 'present' | 'absent' | 'cancelled' | 'unknown' | 'expired'
    answeredAt: text("answered_at"),
    expiresAt: text("expires_at").notNull(), // 7 days after occurrence at 23:59:59 WAT
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    uniqueIndex("attendance_occurrence_student_uniq").on(table.occurrenceId, table.studentId),
    index("attendance_student_idx").on(table.studentId),
    index("attendance_is_deleted_idx").on(table.isDeleted),
  ],
);

// 10. Assignments
export const assignments = sqliteTable(
  "assignments",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    creatorStudentId: text("creator_student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    dueAt: text("due_at").notNull(), // ISO 8601 UTC
    type: text("type").notNull().default("solo"), // 'solo' | 'group'
    visibility: text("visibility").notNull().default("personal"), // 'personal' | 'shared'
    suggestionStatus: text("suggestion_status").notNull().default("none"), // 'none' | 'pending' | 'approved' | 'rejected'
    suggestedByStudentId: text("suggested_by_student_id").references(() => students.id, {
      onDelete: "set null",
    }),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    index("assignments_course_idx").on(table.courseId),
    index("assignments_creator_idx").on(table.creatorStudentId),
    index("assignments_is_deleted_idx").on(table.isDeleted),
  ],
);

// 11. Individual student progress on assignments (personal or shared)
export const studentAssignmentProgress = sqliteTable(
  "student_assignment_progress",
  {
    id: text("id").primaryKey(),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("not_started"), // 'not_started' | 'in_progress' | 'completed'
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    uniqueIndex("assignment_progress_uniq").on(table.assignmentId, table.studentId),
    index("assignment_progress_student_idx").on(table.studentId),
    index("assignment_progress_is_deleted_idx").on(table.isDeleted),
  ],
);

// 12. Group assignment pools
export const assignmentGroups = sqliteTable(
  "assignment_groups",
  {
    id: text("id").primaryKey(),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    groupNumber: integer("group_number").notNull(),
    label: text("label").notNull(),
    maxCapacity: integer("max_capacity").notNull().default(5),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    uniqueIndex("assignment_groups_num_uniq").on(table.assignmentId, table.groupNumber),
    index("assignment_groups_assignment_idx").on(table.assignmentId),
    index("assignment_groups_is_deleted_idx").on(table.isDeleted),
  ],
);

// 13. Group assignment membership sign ups
export const assignmentGroupMembers = sqliteTable(
  "assignment_group_members",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => assignmentGroups.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    joinedAt: text("joined_at").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
    isDeleted: integer("is_deleted").notNull().default(0),
  },
  (table) => [
    uniqueIndex("assignment_group_member_uniq").on(table.groupId, table.studentId),
    index("assignment_group_member_student_idx").on(table.studentId),
    index("assignment_group_member_is_deleted_idx").on(table.isDeleted),
  ],
);

// 14. Device local sync outbox queue (never synced to cloud)
export const syncOutbox = sqliteTable(
  "sync_outbox",
  {
    id: text("id").primaryKey(),
    actionType: text("action_type").notNull(), // 'insert' | 'update' | 'delete'
    entityType: text("entity_type").notNull(), // table name
    entityId: text("entity_id").notNull(), // UUID of the record
    payload: text("payload").notNull(), // serialized JSON payload
    status: text("status").notNull().default("pending"), // 'pending' | 'processing' | 'failed' | 'dead_letter'
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    lastError: text("last_error"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("sync_outbox_status_idx").on(table.status),
    index("sync_outbox_created_idx").on(table.createdAt),
  ],
);

// Export types inferred from Drizzle schemas
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

export type GuardianConsent = typeof guardianConsents.$inferSelect;
export type NewGuardianConsent = typeof guardianConsents.$inferInsert;

export type Semester = typeof semesters.$inferSelect;
export type NewSemester = typeof semesters.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type CourseGroup = typeof courseGroups.$inferSelect;
export type NewCourseGroup = typeof courseGroups.$inferInsert;

export type CourseMembership = typeof courseMemberships.$inferSelect;
export type NewCourseMembership = typeof courseMemberships.$inferInsert;

export type ClassRule = typeof classRules.$inferSelect;
export type NewClassRule = typeof classRules.$inferInsert;

export type ClassOccurrence = typeof classOccurrences.$inferSelect;
export type NewClassOccurrence = typeof classOccurrences.$inferInsert;

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;

export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;

export type StudentAssignmentProgress = typeof studentAssignmentProgress.$inferSelect;
export type NewStudentAssignmentProgress = typeof studentAssignmentProgress.$inferInsert;

export type AssignmentGroup = typeof assignmentGroups.$inferSelect;
export type NewAssignmentGroup = typeof assignmentGroups.$inferInsert;

export type AssignmentGroupMember = typeof assignmentGroupMembers.$inferSelect;
export type NewAssignmentGroupMember = typeof assignmentGroupMembers.$inferInsert;

export type SyncOutboxItem = typeof syncOutbox.$inferSelect;
export type NewSyncOutboxItem = typeof syncOutbox.$inferInsert;
