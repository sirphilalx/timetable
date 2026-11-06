-- TT Student Timetable: Core Data Model PostgreSQL Migration
-- Migration: 20261106000000_core_data_model.sql

-- Helper function to extract Clerk User ID from JWT claims
CREATE OR REPLACE FUNCTION current_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    AUTH.JWT() ->> 'sub',
    CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'sub'
  );
END;
$$ LANGUAGE PLPGSQL STABLE SECURITY DEFINER;

-- 1. Students profile
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY, -- UUID v4
  clerk_user_id TEXT UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT,
  institution TEXT,
  date_of_birth TEXT, -- YYYY-MM-DD
  is_minor INTEGER NOT NULL DEFAULT 0, -- 0=adult, 1=minor under 18
  guardian_consent_status TEXT NOT NULL DEFAULT 'none', -- none, pending, approved, declined
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS students_clerk_user_idx ON students (clerk_user_id);
CREATE INDEX IF NOT EXISTS students_is_deleted_idx ON students (is_deleted);

-- Helper function to check if student is an adult or approved minor
CREATE OR REPLACE FUNCTION is_student_approved_adult(p_student_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM students
    WHERE id = p_student_id
      AND (is_minor = 0 OR guardian_consent_status = 'approved')
  );
END;
$$ LANGUAGE PLPGSQL STABLE SECURITY DEFINER;

-- 2. Minor guardian consents
CREATE TABLE IF NOT EXISTS guardian_consents (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  guardian_name TEXT NOT NULL,
  guardian_contact TEXT NOT NULL,
  consent_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, declined, expired
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS guardian_consents_student_idx ON guardian_consents (student_id);
CREATE INDEX IF NOT EXISTS guardian_consents_token_idx ON guardian_consents (consent_token);

-- 3. Semesters
CREATE TABLE IF NOT EXISTS semesters (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL, -- YYYY-MM-DD
  end_date TEXT NOT NULL, -- YYYY-MM-DD
  is_current INTEGER NOT NULL DEFAULT 1,
  is_paused INTEGER NOT NULL DEFAULT 0, -- strike pause mode
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS semesters_student_idx ON semesters (student_id);
CREATE INDEX IF NOT EXISTS semesters_is_current_idx ON semesters (is_current);

-- 4. Shared master course groups (published by course rep)
CREATE TABLE IF NOT EXISTS course_groups (
  id TEXT PRIMARY KEY,
  owner_student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  share_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS course_groups_owner_idx ON course_groups (owner_student_id);
CREATE INDEX IF NOT EXISTS course_groups_share_code_idx ON course_groups (share_code);

-- 5. Course memberships
CREATE TABLE IF NOT EXISTS course_memberships (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES course_groups(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'follower', -- rep, editor, follower
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  UNIQUE(group_id, student_id)
);

CREATE INDEX IF NOT EXISTS course_memberships_student_idx ON course_memberships (student_id);

-- 6. Courses
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  semester_id TEXT REFERENCES semesters(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 2,
  color TEXT NOT NULL DEFAULT '#4F46E5',
  lecturer_name TEXT,
  lecturer_phone TEXT,
  lecturer_email TEXT,
  shared_group_id TEXT REFERENCES course_groups(id) ON DELETE SET NULL,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS courses_semester_idx ON courses (semester_id);
CREATE INDEX IF NOT EXISTS courses_shared_group_idx ON courses (shared_group_id);

-- 7. Recurring weekly class rules
CREATE TABLE IF NOT EXISTS class_rules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL, -- 1=Monday to 7=Sunday
  start_time TEXT NOT NULL, -- HH:MM
  end_time TEXT NOT NULL, -- HH:MM
  venue TEXT NOT NULL,
  class_type TEXT NOT NULL DEFAULT 'lecture', -- lecture, tutorial, lab, seminar
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS class_rules_course_idx ON class_rules (course_id);

-- 8. Class occurrences
CREATE TABLE IF NOT EXISTS class_occurrences (
  id TEXT PRIMARY KEY,
  rule_id TEXT REFERENCES class_rules(id) ON DELETE SET NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  start_time TEXT NOT NULL, -- HH:MM
  end_time TEXT NOT NULL, -- HH:MM
  venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, moved, cancelled, completed
  override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS class_occurrences_course_date_idx ON class_occurrences (course_id, date);

-- 9. Attendance records
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  occurrence_id TEXT NOT NULL REFERENCES class_occurrences(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unknown', -- present, absent, cancelled, unknown, expired
  answered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  UNIQUE(occurrence_id, student_id)
);

CREATE INDEX IF NOT EXISTS attendance_records_student_idx ON attendance_records (student_id);

-- 10. Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  creator_student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'solo', -- solo, group
  visibility TEXT NOT NULL DEFAULT 'personal', -- personal, shared
  suggestion_status TEXT NOT NULL DEFAULT 'none', -- none, pending, approved, rejected
  suggested_by_student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS assignments_course_idx ON assignments (course_id);

-- 11. Individual student progress on assignments
CREATE TABLE IF NOT EXISTS student_assignment_progress (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS student_assignment_progress_student_idx ON student_assignment_progress (student_id);

-- 12. Group assignment pools
CREATE TABLE IF NOT EXISTS assignment_groups (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  group_number INTEGER NOT NULL,
  label TEXT NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  UNIQUE(assignment_id, group_number)
);

-- 13. Group assignment membership sign ups
CREATE TABLE IF NOT EXISTS assignment_group_members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES assignment_groups(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  UNIQUE(group_id, student_id)
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assignment_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_group_members ENABLE ROW LEVEL SECURITY;

-- POLICIES: students
CREATE POLICY "Students can read their own profile"
  ON students FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Students can insert their own profile"
  ON students FOR INSERT
  WITH CHECK (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Students can update their own profile"
  ON students FOR UPDATE
  USING (clerk_user_id = current_clerk_user_id());

-- POLICIES: guardian_consents (Explicit staging exception for minors before approval)
CREATE POLICY "Students can view their guardian consent"
  ON guardian_consents FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id()));

CREATE POLICY "Students can stage guardian consent request"
  ON guardian_consents FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id()));

-- POLICIES: semesters (Requires adult or approved minor)
CREATE POLICY "Students can view their semesters"
  ON semesters FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id()));

CREATE POLICY "Approved students can insert semesters"
  ON semesters FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id())
    AND is_student_approved_adult(student_id)
  );

CREATE POLICY "Approved students can update semesters"
  ON semesters FOR UPDATE
  USING (
    student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id())
    AND is_student_approved_adult(student_id)
  );

-- POLICIES: course_groups
CREATE POLICY "Course groups are viewable by share code or membership"
  ON course_groups FOR SELECT
  USING (TRUE);

CREATE POLICY "Reps can manage course groups"
  ON course_groups FOR ALL
  USING (owner_student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id()));

-- POLICIES: course_memberships
CREATE POLICY "Members can view group members"
  ON course_memberships FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM course_memberships
      WHERE student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id())
    )
  );

CREATE POLICY "Students can join or leave course groups"
  ON course_memberships FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id()));

CREATE POLICY "Students can delete own membership"
  ON course_memberships FOR DELETE
  USING (student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id()));

-- POLICIES: attendance_records
CREATE POLICY "Students view own attendance"
  ON attendance_records FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id()));

CREATE POLICY "Approved students can log attendance"
  ON attendance_records FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id())
    AND is_student_approved_adult(student_id)
  );

CREATE POLICY "Approved students can update attendance"
  ON attendance_records FOR UPDATE
  USING (
    student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id())
    AND is_student_approved_adult(student_id)
  );

-- POLICIES: student_assignment_progress
CREATE POLICY "Students manage own progress"
  ON student_assignment_progress FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id()))
  WITH CHECK (
    student_id IN (SELECT id FROM students WHERE clerk_user_id = current_clerk_user_id())
    AND is_student_approved_adult(student_id)
  );
