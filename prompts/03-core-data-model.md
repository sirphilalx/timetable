# 03 · Core Data Model

Status: done

## Goal

Implement the complete core data model for TT Student Timetable across local SQLite and remote Supabase PostgreSQL. This establishes the persistence layer, domain calculation logic, and offline synchronization foundation for all subsequent feature slices.

## Decisions

- Define thirteen normalized domain tables in `src/db/schema.ts` using Drizzle ORM SQLite definitions.
- Use client generated standard UUID v4 strings for primary keys across all domain entities, with deterministic UUID v5 for class rule overrides.
- Model schedules using virtual recurrence: weekly `class_rules` expand in memory on demand, while `class_occurrences` stores specific overrides (cancellations, venue shifts, time relocations) or attendance anchors.
- Record attendance check ins with a 7 day expiration window computed from the occurrence date at 23:59:59 WAT.
- Support solo and group assignments with creator ownership, suggestion approval workflows, and independent per student progress tracking via `student_assignment_progress`.
- Manage student minor status with explicit guardian consent records; Supabase Row Level Security integrates with Clerk JWT authentication, allowing initial consent staging while blocking personal data writes until guardian approval.
- Map student authentication to `clerk_user_id` on the student profile.
- Maintain an offline `sync_outbox` table with status tracking, exponential retry backoff, and dead letter transitions after five non retriable failures.
- Execute SQLite schema migrations strictly in `src/db/client.native.ts` inside `SQLiteProvider` in a single transaction via SQLite `user_version` pragma, keeping `src/db/client.web.ts` an in memory dummy client for web export compatibility.
- Store current student identity in Expo SecureStore under `current_student_id`.
- Reconcile sync conflicts via row level Last Write Wins anchored by remote `updated_at` timestamps.

## Out of scope

- Timetable user interface screens (Today screen, Classes screen, Course creation forms, handled in Slice 1).
- Shared course link previews and QR code generation UI (handled in Slice 2).
- Parental consent web form user interface on Cloudflare Pages (handled in Slice 3).
- Local alarm scheduling with Android exact alarms (handled in Slice 4).
- Production deployment pipelines for Supabase cloud instances.

## Steps

### 1. Define complete Drizzle SQLite domain schemas and sync outbox queue

Update `src/db/schema.ts` to implement all thirteen domain tables with exact column types, foreign key relations, unique constraints, and soft delete metadata (`deleted_at`, `is_deleted`). Update `sync_outbox` with `status` ('pending', 'processing', 'failed', 'dead_letter') and `max_attempts`. Export typed schemas and Drizzle model types.

### 2. Configure Drizzle migration generator and native SQLite migration runner

Configure `drizzle.config.ts` to output migrations into `drizzle/` directory. Generate initial SQL migration file using Drizzle Kit. Implement the migration runner in `src/db/client.native.ts` to apply pending SQL statements on application startup in a single transaction while tracking `user_version`. Ensure `src/db/client.web.ts` remains a dummy client so `npx expo export -p web` never crashes on native SQLite imports.

### 3. Implement timetable domain logic, recurrence expansion, and attendance helpers

Create `src/lib/timetable.ts` with helper functions for generating client UUIDs, expanding weekly `class_rules` into virtual occurrences for a date range, and creating deterministic override occurrences. Create `src/lib/attendance.ts` with 7 day check in expiry calculations, attendance status transitions, and attendance percentage computation (`date <= today`).

### 4. Implement assignment progress, suggestion workflows, and minor consent validation

Create `src/lib/assignments.ts` with helpers to manage `student_assignment_progress` rows, validate group capacity limits, and transition assignment suggestion states. Create `src/lib/consent.ts` with age calculation helpers (< 18 years), guardian consent token generators, and SecureStore current student helpers.

### 5. Implement sync outbox repository and Last Write Wins conflict resolution

Create `src/lib/sync.ts` with functions to enqueue local mutations, query pending outbox items, record failure attempts, transition items to dead letter status, and dequeue acknowledged records. Implement a Last Write Wins comparator that compares local and remote `updated_at` timestamps to determine the winning state, and define topological entity ingestion order.

### 6. Create Supabase PostgreSQL migrations with Row Level Security policies

Create `supabase/migrations/20261106000000_core_data_model.sql` with matching PostgreSQL table definitions, foreign keys, indexes, and Row Level Security policies. Enforce user isolation on personal records, course rep permissions on shared courses, public read on course group share codes, and the unapproved minor write quarantine with the consent staging exception.

## Verification

- Type checking: `npx tsc --noEmit` passes with 0 errors.
- Linting: `npx expo lint` passes with 0 errors.
- Web export: `npx expo export -p web` succeeds with 0 errors and zero native library import crashes.
- Drizzle migrations: `drizzle/` directory contains valid generated SQL matching `schema.ts`.
- Domain verification: automated unit tests verify virtual recurrence expansion, 7 day attendance expiry, attendance percentage math, assignment progress, consent age validation, and sync outbox queue operations.

## AGENTS.md updates

- Document the thirteen core domain entities and their synchronization fields.
- Record the virtual recurrence model with override persistence.
- Document `current_student_id` in SecureStore as the local user identifier.
- Document `sync_outbox` dead letter error handling rules.

## Result

- Created complete Drizzle SQLite schemas in `src/db/schema.ts` for all thirteen domain entities plus `sync_outbox`.
- Generated initial Drizzle SQLite migration in `drizzle/0000_core_data_model.sql` and configured migration runner in `src/db/client.native.ts` inside `SQLiteProvider`.
- Built core domain logic in `src/lib/timetable.ts` (virtual recurrence expansion and deterministic overrides), `src/lib/attendance.ts` (7 day expiry and attendance metric calculators), `src/lib/assignments.ts` (capacity checks and suggestion state transitions), `src/lib/consent.ts` (minor age checks and consent tokens), and `src/lib/sync.ts` (sync outbox queue, backoff calculation, dead letter transitions, and Last Write Wins).
- Created Supabase PostgreSQL migration in `supabase/migrations/20261106000000_core_data_model.sql` with full table definitions, foreign keys, indexes, and Clerk JWT integrated Row Level Security policies.
- Verified: `npm run check` passes (0 type errors, 0 lint warnings, clean format), `npx expo export -p web` succeeds, and unit test suite passes 100%.
