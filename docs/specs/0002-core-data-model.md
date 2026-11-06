# 0002. Core Data Model

**Date**: 2026-11-06
**Status**: Proposed

## Summary

This specification defines the complete core data model for TT Student Timetable across device local SQLite and remote Supabase PostgreSQL. We establish thirteen normalized domain entities and a local sync outbox queue with standard UUID identifiers, ISO date formats, soft deletion tracking, and strict foreign keys. This architecture ensures students can manage courses, view daily occurrences, check attendance, and organize assignments without network access, while enabling course representatives to publish timetables and broadcast updates cleanly.

## Context

Nigerian university students face daily timetable uncertainties including sudden lecture hall shifts, unexpected class cancellations, and prolonged academic disruptions such as strikes. Student smartphones in target federal and state universities are predominantly entry tier Android devices running Android 8 or newer with two gigabytes of memory and metered mobile connectivity. These operational constraints demand an offline first data architecture where schedules, attendance records, and assignments live in an embedded on device database that never freezes the user interface or relies on active internet connectivity to function.

At the same time, timetables are inherently collaborative. Course representatives produce master timetables that hundreds of course mates import and follow. The data architecture must bridge two separate database environments: a local SQLite database managed by Drizzle ORM on student phones, and a remote cloud PostgreSQL database managed by Supabase for multi user synchronization. In addition, the Nigeria Data Protection Act 2023 requires strict handling of student personal data, necessitating explicit isolation and consent verification records for students under eighteen years of age before their data can be stored in the cloud.

Failing to establish a comprehensive data model at this foundation stage risks breaking database migrations later, creating data loss on student devices during app upgrades, or causing synchronization conflicts between course representatives and class followers. This decision defines the unified relational schema, synchronization metadata, lifecycle state machines, and access rules that all subsequent feature slices will rely upon.

## Requirements

**User stories**:
- As a student, I want my timetable, attendance records, and assignments stored locally on my phone so that I can access my daily schedule and receive alarms without an internet connection.
- As a course representative, I want to publish a master course group schedule with lecture rules and venue changes so that my classmates can follow and receive verified timetable updates.
- As a student follower, I want to join a shared course group while keeping my personal attendance check ins, private notes, and custom tasks completely private.
- As a student under eighteen years old, I want to generate a guardian consent link so that my parent can approve cloud account synchronization without blocking my local timetable preview.

**Acceptance criteria**:
- **AC-1**: Local SQLite tables and schema definitions exist in TypeScript using Drizzle ORM for thirteen core domain entities (students, guardian consents, semesters, courses, course groups, course memberships, class rules, class occurrences, attendance records, assignments, student assignment progress, assignment groups, assignment group members) and a dedicated sync outbox queue.
- **AC-2**: All syncable domain entities generate client side UUID v4 strings for primary keys and maintain standard sync metadata (created at, updated at, deleted at, and is deleted).
- **AC-3**: Dates are serialized as ISO 8601 calendar strings (YYYY-MM-DD), timestamps as ISO 8601 UTC strings, and daily recurring times as 24 hour HH:MM strings across local SQLite and remote PostgreSQL.
- **AC-4**: Weekly class recurrence rules expand dynamically in memory for schedule views, while concrete class occurrence rows are persisted only for schedule overrides (venue shifts, cancellations, relocated times) or attendance links using deterministic identifiers.
- **AC-5**: Attendance check ins record attendance status, link to specific occurrences, and enforce a 7 day expiration window from the class occurrence date.
- **AC-6**: Solo and group assignments share a unified schema supporting personal and shared visibility, individual student completion progress tracking, suggestion review workflows (pending, approved, rejected), and group member capacity enforcement.
- **AC-7**: Minor students are identified via date of birth and is minor flag, with guardian verification details, approval status, and tokens tracked in students and dedicated guardian consents tables.
- **AC-8**: Device local mutations record into sync outbox with entity type, action type, and JSON payload, retrying with exponential backoff on failure and moving to dead letter status after five non retriable failures to protect battery life.
- **AC-9**: Conflict resolution follows row level Last Write Wins anchored by remote updated at timestamp.
- **AC-10**: Supabase PostgreSQL schemas and Row Level Security policies enforce user isolation on private student records, membership checks on shared course tables, a staging exception for initial minor consent creation, and write blocks for unapproved minor accounts on subsequent tables.
- **AC-11**: Local SQLite schema migrations execute automatically and safely inside SQLiteProvider in client.native.ts on application startup using SQLite user version tracking in a single transaction, while client.web.ts remains an in memory dummy client.

## Options considered

### Option 1: Unified relational schema with virtual recurrence, client UUIDs, soft deletes, and progress tracking (Recommended)

This option establishes thirteen relational tables in local SQLite with Drizzle ORM and mirror tables in Supabase PostgreSQL. Primary keys are client generated UUID strings. Weekly class rules generate calendar occurrences dynamically in memory, persisting concrete occurrence rows only for exceptions, relocations, or attendance records. Syncable entities include soft delete tombstones, ISO 8601 UTC timestamps, and dead letter outbox protections.

**Pros**:
- Client generated UUIDs eliminate key collisions and identifier remapping during offline writes.
- Virtual recurrence with override records prevents database bloat on budget devices with two gigabytes of memory.
- Dedicated progress tracking table allows hundreds of followers to independently track assignment completion on shared class assignments.
- Dead letter queue prevents battery draining infinite loops when non retriable errors occur.
- Strict foreign keys maintain relational integrity across courses, schedules, and attendance.

**Cons**:
- Requires maintaining matching schema definitions across Drizzle SQLite and Supabase PostgreSQL.

### Option 2: Pre materialized calendar occurrences with local auto increment identifiers

This option uses standard integer auto increment primary keys in local SQLite, pre generating every individual lecture occurrence for the entire sixteen week semester upon semester creation. Cloud synchronization maintains a translation map linking local integer IDs to remote UUIDs.

**Pros**:
- Fast local queries using compact integer indexing in SQLite.
- Immediate availability of all semester calendar dates without runtime recurrence expansion logic.

**Cons**:
- Identifier translation tables introduce significant sync complexity and failure points during offline mutations.
- Pre generating hundreds of occurrence rows consumes unnecessary flash memory on low end phones.
- Changing a recurring class rule requires updating dozens of pre generated future rows.

### Option 3: Document oriented JSON payloads inside minimal SQLite tables

This option stores complete semester timetables as single serialized JSON documents inside SQLite text columns, syncing the entire document blob to Supabase on change.

**Pros**:
- Extremely simple initial schema with very few tables and no foreign key coordination.
- Rapid prototyping without designing granular table structures.

**Cons**:
- Impossible to run efficient relational queries such as Today schedule filtering or attendance percentages without parsing large JSON strings in memory.
- Concurrency conflicts are catastrophic because any small change overwrites the entire semester document.
- Heavy data transfer over metered Nigerian mobile cellular connections.

## Decision

**Chosen option**: Option 1: Unified relational schema with virtual recurrence, client UUIDs, soft deletes, and progress tracking.

We select a fully normalized relational schema across local SQLite and remote PostgreSQL using client generated UUID identifiers, virtual recurrence with override records, soft delete columns, dead letter sync queues, and separate assignment progress tracking.

**Implementation skills**: `expo-router` (`expo/skills`, `.agents/skills/expo-router/`) · `supabase` (`supabase/agent-skills`, `.agents/skills/supabase/`)

## Rationale

University schedules in Nigeria require an architecture that handles both deep relational complexity and extreme operational instability. Option 1 addresses these demands directly.

First, student schedules involve natural hierarchies and many to many relationships: semesters contain courses, courses define weekly recurring rules, rules produce concrete class instances, and instances collect student attendance check ins and assignment suggestions. Relational tables represent these connections faithfully. Drizzle ORM provides complete TypeScript type safety across queries without runtime overhead.

Second, network drops and long offline periods make server assigned IDs impractical. By using client generated UUID strings, any student or course representative can create semesters, courses, and assignments completely offline. When connectivity returns, the records upload directly without requiring identifier translation or foreign key rewrites.

Third, the virtual recurrence model with override persistence protects budget device flash memory and CPU. Instead of writing hundreds of concrete rows into SQLite for an entire semester, weekly rules define the rhythm, and concrete occurrence rows are stored only when a lecture moves hall, changes time, gets cancelled, or collects an attendance check in.

Fourth, followers and course representatives have distinct needs. Storing student assignment progress in a dedicated progress table allows a course representative to publish a single shared assignment while every student follower independently tracks whether their copy is not started, in progress, or completed.

## Feature design

**Local identity storage**:
The active student UUID is stored on the physical device in Expo SecureStore under the key `current_student_id`. On initial application launch or profile creation, a UUID v4 identifier is generated, written to SecureStore, and inserted into the local `students` table. All local schedule, attendance, and assignment queries filter by `student_id = SecureStore.getItem('current_student_id')`.

**Data model sketch**:

1. `students`:
   - `id`: text, primary key (UUID v4)
   - `supabase_user_id`: text, nullable (foreign key to auth.users in Supabase, unique)
   - `display_name`: text, not null
   - `email`: text, nullable
   - `institution`: text, nullable
   - `date_of_birth`: text, nullable (ISO date YYYY-MM-DD)
   - `is_minor`: integer, not null, default 0 (0 for adult, 1 for minor under 18)
   - `guardian_consent_status`: text, not null, default 'none' ('none', 'pending', 'approved', 'declined')
   - `created_at`: text, not null (ISO 8601 UTC)
   - `updated_at`: text, not null (ISO 8601 UTC)
   - `deleted_at`: text, nullable (ISO 8601 UTC)
   - `is_deleted`: integer, not null, default 0

2. `guardian_consents`:
   - `id`: text, primary key (UUID v4)
   - `student_id`: text, not null, references students(id) ON DELETE CASCADE
   - `guardian_name`: text, not null
   - `guardian_contact`: text, not null (email address or phone number)
   - `consent_token`: text, not null, unique (web approval token)
   - `status`: text, not null, default 'pending' ('pending', 'approved', 'declined')
   - `requested_at`: text, not null (ISO 8601 UTC)
   - `responded_at`: text, nullable (ISO 8601 UTC)
   - `expires_at`: text, not null (ISO 8601 UTC, 14 days after request)
   - `created_at`: text, not null (ISO 8601 UTC)
   - `updated_at`: text, not null (ISO 8601 UTC)
   - `deleted_at`: text, nullable (ISO 8601 UTC)
   - `is_deleted`: integer, not null, default 0

3. `semesters`:
   - `id`: text, primary key (UUID v4)
   - `student_id`: text, not null, references students(id) ON DELETE CASCADE
   - `name`: text, not null (e.g. "First Semester 2025/2026")
   - `start_date`: text, not null (ISO date YYYY-MM-DD)
   - `end_date`: text, not null (ISO date YYYY-MM-DD)
   - `is_current`: integer, not null, default 1
   - `is_paused`: integer, not null, default 0 (1 when classes are suspended during strike)
   - `created_at`: text, not null (ISO 8601 UTC)
   - `updated_at`: text, not null (ISO 8601 UTC)
   - `deleted_at`: text, nullable (ISO 8601 UTC)
   - `is_deleted`: integer, not null, default 0

4. `courses`:
   - `id`: text, primary key (UUID v4)
   - `semester_id`: text, not null, references semesters(id) ON DELETE CASCADE
   - `code`: text, not null (e.g. "CSC 301")
   - `title`: text, not null (e.g. "Operating Systems")
   - `units`: integer, not null, default 2
   - `color`: text, not null, default '#4F46E5' (Cadence Academy indigo default)
   - `lecturer_name`: text, nullable
   - `lecturer_phone`: text, nullable
   - `lecturer_email`: text, nullable
   - `shared_group_id`: text, nullable (UUID reference to course_groups if imported)
   - `is_archived`: integer, not null, default 0
   - `created_at`: text, not null (ISO 8601 UTC)
   - `updated_at`: text, not null (ISO 8601 UTC)
   - `deleted_at`: text, nullable (ISO 8601 UTC)
   - `is_deleted`: integer, not null, default 0

5. `course_groups`:
   - `id`: text, primary key (UUID v4)
   - `owner_student_id`: text, not null, references students(id)
   - `name`: text, not null (e.g. "Computer Science Level 300")
   - `institution`: text, not null
   - `share_code`: text, not null, unique (alphanumeric short code e.g. "CS300A")
   - `created_at`: text, not null (ISO 8601 UTC)
   - `updated_at`: text, not null (ISO 8601 UTC)
   - `deleted_at`: text, nullable (ISO 8601 UTC)
   - `is_deleted`: integer, not null, default 0

6. `course_memberships`:
   - `id`: text, primary key (UUID v4)
   - `group_id`: text, not null, references course_groups(id) ON DELETE CASCADE
   - `student_id`: text, not null, references students(id) ON DELETE CASCADE
   - `role`: text, not null, default 'follower' ('rep', 'editor', 'follower')
   - `joined_at`: text, not null (ISO 8601 UTC)
   - `created_at`: text, not null (ISO 8601 UTC)
   - `updated_at`: text, not null (ISO 8601 UTC)
   - `deleted_at`: text, nullable (ISO 8601 UTC)
   - `is_deleted`: integer, not null, default 0

7. `class_rules`:
   - `id`: text, primary key (UUID v4)
   - `course_id`: text, not null, references courses(id) ON DELETE CASCADE
   - `weekday`: integer, not null (1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday)
   - `start_time`: text, not null (HH:MM e.g. "08:00")
   - `end_time`: text, not null (HH:MM e.g. "10:00")
   - `venue`: text, not null (e.g. "Hall 1, Faculty of Science")
   - `class_type`: text, not null, default 'lecture' ('lecture', 'tutorial', 'lab', 'seminar')
   - `created_at`: text, not null (ISO 8601 UTC)
   - `updated_at`: text, not null (ISO 8601 UTC)
   - `deleted_at`: text, nullable (ISO 8601 UTC)
   - `is_deleted`: integer, not null, default 0

8. `class_occurrences` (persisted override instances and attendance anchors):
   - `id`: text, primary key (deterministic UUID v5 from rule_id + date for rule overrides, or UUID v4 for ad hoc lectures)
   - `rule_id`: text, nullable, references class_rules(id) ON DELETE SET NULL
   - `course_id`: text, not null, references courses(id) ON DELETE CASCADE
   - `date`: text, not null (ISO date YYYY-MM-DD)
   - `start_time`: text, not null (HH:MM)
   - `end_time`: text, not null (HH:MM)
   - `venue`: text, not null
   - `status`: text, not null, default 'scheduled' ('scheduled', 'moved', 'cancelled', 'completed')
   - `override_reason`: text, nullable
   - `created_at`: text, not null (ISO 8601 UTC)
   - `updated_at`: text, not null (ISO 8601 UTC)
   - `deleted_at`: text, nullable (ISO 8601 UTC)
   - `is_deleted`: integer, not null, default 0

9. `attendance_records`:
   - `id`: text, primary key (UUID v4)
   - `occurrence_id`: text, not null, references class_occurrences(id) ON DELETE CASCADE
   - `student_id`: text, not null, references students(id) ON DELETE CASCADE
   - `status`: text, not null, default 'unknown' ('present', 'absent', 'cancelled', 'unknown', 'expired')
   - `answered_at`: text, nullable (ISO 8601 UTC)
   - `expires_at`: text, not null (ISO 8601 UTC, occurrence date at 23:59:59 WAT plus 7 days)
   - `notes`: text, nullable
   - `created_at`: text, not null (ISO 8601 UTC)
   - `updated_at`: text, not null (ISO 8601 UTC)
   - `deleted_at`: text, nullable (ISO 8601 UTC)
   - `is_deleted`: integer, not null, default 0

10. `assignments`:
    - `id`: text, primary key (UUID v4)
    - `course_id`: text, not null, references courses(id) ON DELETE CASCADE
    - `creator_student_id`: text, not null, references students(id) ON DELETE CASCADE
    - `title`: text, not null
    - `description`: text, nullable
    - `due_at`: text, not null (ISO 8601 UTC)
    - `type`: text, not null, default 'solo' ('solo', 'group')
    - `visibility`: text, not null, default 'personal' ('personal', 'shared')
    - `suggestion_status`: text, not null, default 'none' ('none', 'pending', 'approved', 'rejected')
    - `suggested_by_student_id`: text, nullable, references students(id) ON DELETE SET NULL
    - `created_at`: text, not null (ISO 8601 UTC)
    - `updated_at`: text, not null (ISO 8601 UTC)
    - `deleted_at`: text, nullable (ISO 8601 UTC)
    - `is_deleted`: integer, not null, default 0

11. `student_assignment_progress`:
    - `id`: text, primary key (UUID v4)
    - `assignment_id`: text, not null, references assignments(id) ON DELETE CASCADE
    - `student_id`: text, not null, references students(id) ON DELETE CASCADE
    - `status`: text, not null, default 'not_started' ('not_started', 'in_progress', 'completed')
    - `completed_at`: text, nullable (ISO 8601 UTC)
    - `created_at`: text, not null (ISO 8601 UTC)
    - `updated_at`: text, not null (ISO 8601 UTC)
    - `deleted_at`: text, nullable (ISO 8601 UTC)
    - `is_deleted`: integer, not null, default 0

12. `assignment_groups`:
    - `id`: text, primary key (UUID v4)
    - `assignment_id`: text, not null, references assignments(id) ON DELETE CASCADE
    - `group_number`: integer, not null
    - `label`: text, not null (e.g. "Group 1")
    - `max_capacity`: integer, not null, default 5
    - `created_at`: text, not null (ISO 8601 UTC)
    - `updated_at`: text, not null (ISO 8601 UTC)
    - `deleted_at`: text, nullable (ISO 8601 UTC)
    - `is_deleted`: integer, not null, default 0

13. `assignment_group_members`:
    - `id`: text, primary key (UUID v4)
    - `group_id`: text, not null, references assignment_groups(id) ON DELETE CASCADE
    - `student_id`: text, not null, references students(id) ON DELETE CASCADE
    - `joined_at`: text, not null (ISO 8601 UTC)
    - `created_at`: text, not null (ISO 8601 UTC)
    - `updated_at`: text, not null (ISO 8601 UTC)
    - `deleted_at`: text, nullable (ISO 8601 UTC)
    - `is_deleted`: integer, not null, default 0

14. `sync_outbox` (device local queue only):
    - `id`: text, primary key (UUID v4)
    - `action_type`: text, not null ('insert', 'update', 'delete')
    - `entity_type`: text, not null (target table name)
    - `entity_id`: text, not null (UUID of target entity)
    - `payload`: text, not null (JSON string of row values)
    - `status`: text, not null, default 'pending' ('pending', 'processing', 'failed', 'dead_letter')
    - `attempts`: integer, not null, default 0
    - `max_attempts`: integer, not null, default 5
    - `last_error`: text, nullable
    - `created_at`: text, not null (ISO 8601 UTC)
    - `updated_at`: text, not null (ISO 8601 UTC)

**State transitions**:

1. Guardian consent lifecycle:
   `pending` -> `approved` (guardian submits web approval form with valid token)
   `pending` -> `declined` (guardian declines consent on web form)
   `pending` -> `expired` (token passes 14 days without action, requiring student to request a fresh link)

2. Class occurrence override lifecycle:
   `scheduled` -> `moved` (time or venue overridden by course rep or student)
   `scheduled` -> `cancelled` (class cancelled for the day)
   `scheduled` | `moved` -> `completed` (occurrence time has passed)

3. Attendance record lifecycle:
   `unknown` -> `present` (student checks in positively)
   `unknown` -> `absent` (student indicates non attendance)
   `unknown` -> `cancelled` (class occurrence was cancelled)
   `unknown` -> `expired` (7 days elapse past occurrence without response)

4. Assignment progress lifecycle:
   `not_started` -> `in_progress` (student begins task)
   `in_progress` -> `completed` (student marks done)

5. Assignment suggestion lifecycle:
   `none` (standard personal or published assignment)
   `pending` (follower student submits suggestion from check in) -> `approved` (rep accepts and broadcasts)
   `pending` -> `rejected` (rep declines suggestion; assignment remains private to the follower)

6. Sync outbox item lifecycle:
   `pending` -> `processing` (worker attempts network dispatch)
   `processing` -> dequeued and removed (HTTP 200/201 success)
   `processing` -> `failed` (network drop or 5xx server error, backoff incremented)
   `failed` -> `dead_letter` (attempts reach 5 or non retriable 4xx client error like 403/422 received)

**API surface**:

| Operation | Target Layer | Key inputs | Key outputs | Auth requirement | Key error handling |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `getTodaySchedule` | Local SQLite + virtual recurrence | `studentId: text`, `date: text` | `occurrences: array` | Local device access | Expands rules in memory, overlays stored occurrences, returns empty if semester paused |
| `recordAttendanceCheckIn` | Local SQLite + outbox | `occurrenceId: text`, `status: text`, `notes: text` | `recordId: text` | Local device access | Materializes occurrence row if virtual, rejects updates after 7 day expiration window |
| `joinCourseGroup` | Local SQLite + outbox | `shareCode: text`, `activeSemesterId: text` | `membershipId: text` | Supabase bearer token | Imports shared group rules and links courses to active local semester id |
| `enqueueSyncMutation` | Local SQLite outbox | `entityType: text`, `actionType: text`, `payload: text` | `outboxId: text` | Local device access | Transactional commit with the local entity mutation |
| `processSyncOutbox` | Background queue worker | None (reads pending `sync_outbox` rows) | `processedCount: integer` | Supabase bearer token | Exponential retry backoff on network failure, dead letters non retriable 4xx errors |
| `syncPullChanges` | Supabase REST / RPC | `lastPulledAt: text` | `records: object` | Supabase bearer token | Ingests rows in topological dependency order to avoid foreign key failures |
| `submitGuardianConsentWeb` | Static web route + RPC | `token: text`, `decision: text` | `success: boolean` | Public (token authenticated) | 404 on expired or invalid token, 409 if already answered |

**Value sourcing**:

| Action | Value produced / displayed | Source |
| :--- | :--- | :--- |
| Resolve active user | `current_student_id` | Read from Expo SecureStore on device |
| Create student profile | `id` | Client generated UUID v4 on device |
| Determine minor status | `is_minor` | Computed: difference between `date_of_birth` and current date < 18 years |
| Generate guardian consent | `consent_token` | Client generated cryptographically random 32 character hex string |
| Compute virtual occurrence | `id`, `start_time`, `end_time`, `venue` | Derived in memory from `class_rules` row plus calendar date |
| Materialize class override | `id` | Deterministic UUID v5 generated from `rule_id` and `date` |
| Link imported shared course | `semester_id` | Follower active local `semesters.id` |
| Record check in | `answered_at` | Current device ISO 8601 UTC timestamp |
| Check in expiry calculation | `expires_at` | Computed: occurrence date at 23:59:59 WAT plus 7 days in ISO 8601 UTC |
| Compute attendance metric | `attendance_percentage` | Computed: `(present_count / total_occurrences) * 100` where `date <= today` |
| Track individual assignment | `status` | Read from `student_assignment_progress` row for current student |
| Enforce group capacity | `is_group_full` | Computed: count of `assignment_group_members` >= `assignment_groups.max_capacity` |
| Resolve sync conflict | Winning record state | Compared: row with the most recent `updated_at` timestamp takes precedence |

**Key invariants**:

- Every student entity must have a valid UUID v4 primary key.
- A student cannot join the same `course_groups` more than once (enforced by unique index on `group_id` and `student_id` in `course_memberships`).
- An imported shared course row on a follower device must link to a valid local `semesters.id` belonging to the follower.
- An assignment group member cannot exceed the group capacity (enforced by application check and database trigger).
- A class rule start time must precede end time (`start_time < end_time`).
- An attendance check in cannot be recorded after seven days from the occurrence date.
- Minor student accounts with `guardian_consent_status != 'approved'` cannot push private rows to cloud tables beyond initial consent staging.
- Deletions are never physical hard deletes on synced tables; they set `is_deleted = 1` and `deleted_at = ISO_TIMESTAMP`.
- When `semesters.is_paused = 1`, Today schedule views display a semester pause banner, alarms are silenced, and attendance check in prompts are suspended.

**Security model**:

- Local SQLite storage resides within application private sandbox storage, protected by Android and iOS operating system file permissions.
- Remote Supabase PostgreSQL enforces strict Row Level Security (RLS) on all tables:
  - `students`: authenticated users can read and update their own record (`auth.uid() = supabase_user_id`).
  - `guardian_consents`: unapproved minor accounts have an explicit RLS insert exception to stage initial guardian requests before approval; updates are restricted to the token verified web consent endpoint.
  - `semesters`, `attendance_records`, `student_assignment_progress`: restricted to `auth.uid() = supabase_user_id`. Minor accounts without `guardian_consent_status = 'approved'` are denied cloud insert and update access on these tables.
  - `courses`, `class_rules`, `class_occurrences`: readable by course group members; writable only by course group owners (course representatives) or designated editors.
  - `course_groups`: public read for matching share codes; updates restricted to group owner.

**Configuration required**:

No additional environment variables or third party secrets are required for this schema specification beyond existing `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

**Critical test scenarios**:

- Happy path: A student creates a semester, course, and weekly class rule while completely offline; the data persists in SQLite, displays a virtual occurrence on the Today schedule, and queues an outbox row, verifying **AC-1**, **AC-2**, **AC-3**, **AC-4**, and **AC-8**.
- Failure case: An outbox sync mutation fails due to intermittent mobile data loss; the mutation increments its attempt counter, backs off exponentially, and moves to dead letter status after five non retriable attempts, verifying **AC-8**.
- Concurrency case: A course rep updates a class time in the cloud while an offline student has a local cached copy; upon reconnection, the newer remote `updated_at` updates the local override cleanly, verifying **AC-9**.
- Minor privacy gate: An unapproved minor stages their profile and guardian consent token successfully, but any attempt to push semester or attendance records to Supabase is rejected with HTTP 403 until the guardian approves via the web endpoint, verifying **AC-7** and **AC-10**.
- Attendance expiry: A student attempts to check in to a class occurrence that occurred eight days ago; the system marks the check in expired and preserves existing attendance statistics, verifying **AC-5**.
- Application upgrade: A user upgrades the application to a new version; the bundled SQLite migration runs inside client.native.ts in a single transaction, updates the schema cleanly, and increments `user_version`, verifying **AC-11**.

## Build plan

The build plan follows our Tracer Bullet approach, standing up the complete data layer with typed schemas, local migrations, domain calculation helpers, and remote Supabase tables so every subsequent feature slice has an unshakeable persistence layer.

1. Implement complete Drizzle SQLite schema definitions in `src/db/schema.ts` for all thirteen domain tables, sync metadata columns, and dead letter sync outbox queue, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-6**, **AC-8**.
2. Configure Drizzle migration bundling in `drizzle.config.ts` and generate the initial SQL migration file, satisfies **AC-1**, **AC-11**.
3. Implement native SQLite migration runner in `src/db/client.native.ts` using SQLite user version pragmas inside `SQLiteProvider`, keeping `src/db/client.web.ts` as an in memory dummy client for web export compatibility, satisfies **AC-11**.
4. Create TypeScript domain models, UUID generation helpers, and virtual recurrence expansion utilities in `src/lib/timetable.ts` with deterministic UUID v5 override helpers, satisfies **AC-2**, **AC-3**, **AC-4**.
5. Implement attendance calculation, 7 day check in expiry logic, and semester percentage computation utilities in `src/lib/attendance.ts`, satisfies **AC-5**.
6. Implement assignment progress tracking, suggestion workflow transitions, and group member capacity validation in `src/lib/assignments.ts`, satisfies **AC-6**.
7. Implement student age validation, SecureStore identity helpers, and guardian consent token generation utilities in `src/lib/consent.ts`, satisfies **AC-7**.
8. Implement sync outbox repository functions (enqueue, dequeue, record attempt, dead letter transition) and Last Write Wins timestamp comparator in `src/lib/sync.ts`, satisfies **AC-8**, **AC-9**.
9. Write Supabase PostgreSQL migration file defining matching cloud tables, indexes, and Row Level Security policies with minor staging exceptions and membership access rules, satisfies **AC-2**, **AC-10**.

## Consequences

**Positive**:
- Complete offline reliability: students can run schedules, check ins, and assignments during total cellular outages.
- Virtual recurrence efficiency: computing daily schedules in memory eliminates database bloat on two gigabyte RAM devices.
- Multi follower assignment tracking: separate assignment progress table lets followers track individual completion on shared assignments.
- Resilient sync outbox: dead letter state prevents battery draining infinite loops when non retriable errors occur.
- Strict compliance: isolates minor data with an explicit staging path for parental consent before full cloud persistence.

**Negative / tradeoffs**:
- Dual schema maintenance: developers must keep local Drizzle SQLite schemas and remote Supabase PostgreSQL definitions synchronized.
- Virtual recurrence logic: client application code must maintain in memory recurrence calculation and override merging logic.

**Neutral**:
- Soft delete columns require queries to filter with `where(eq(isDeleted, 0))` to exclude deleted records.

## Follow-up

- [ ] Run `npx drizzle-kit generate` to generate the initial local SQLite migration file once schema.ts is updated.
- [ ] Create corresponding Supabase SQL migration script in `supabase/migrations/` ready for cloud deployment.
