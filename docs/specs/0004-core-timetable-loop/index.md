# 0004. Core timetable loop

**Date**: 2026-11-07
**Status**: Accepted

## Summary

This specification defines the end to end walking skeleton for the TT student timetable application (Slice 1). It connects local SQLite persistence, virtual recurring class expansion, TanStack Query reactive state, local first student profile and optional Clerk authentication, the manual semester and course setup wizard, and the Today and Classes screens (list view, week strip, month grid, day timeline, class detail, and course detail).

## Requirements

**User stories**:

- As a student opening TT for the first time, I want an immediately functional timetable preloaded with realistic CSC 300L UNIBEN courses and classes, while still being able to walk through the Welcome, Sign in, and Semester setup wizard at any time.
- As a student setting up my own semester, I want to enter my institution, semester dates, mid semester breaks, registered courses with color codes, and weekly recurring lectures, tutorials, and labs.
- As a student checking my schedule on the Today tab, I want the Next class hero card, Rest of today list, and Due in the next 3 days assignment preview to reflect my live SQLite database and update optimistically when I add or edit classes.
- As a student browsing the Classes tab, I want to switch between List view (with an interactive 7 day week strip) and Calendar view (Month grid and Day hour timeline), tap any class occurrence to see its detail screen, or tap a course to inspect its schedule and attendance summary.

**Acceptance criteria**:

- **AC-1**: On cold start, a database seeder (`src/db/seed.ts`) checks if local SQLite has an active student and semester; if empty, it seeds the canonical Chioma Okafor (`CSC 300L · UNIBEN`) profile, semester, courses (`CSC 301`, `MTH 301`, `CSC 305`, `GST 301`, `CSC 307`, `STA 311`), weekly class rules, concrete moved/attended occurrences, and upcoming assignments matching Screens 27 and 35.
- **AC-2**: A local first auth and profile context (`src/hooks/useStudentProfile.ts`) works offline in Expo Go without blocking on Clerk credentials, while supporting Welcome (`Screens/02 Welcome.png`), Create account (`Screens/07 Create account.png`), Sign in (`Screens/08 Sign in.png`), Display name (`Screens/11 Display name.png`), and the Avatar menu sheet (`Screens/33 Avatar menu.png`).
- **AC-3**: The manual timetable setup and CRUD routes support Semester setup (`Screens/22 Setup · semester.png`), Courses list (`Screens/23 Setup · courses.png`), Add/Edit Course with 8 course color swatches (`Screens/24 Add course.png`), Add/Edit Class with multi day pill selection (`Screens/25 Add class.png`), and Setup complete summary (`Screens/26 Setup complete.png`), persisting directly to SQLite and queueing mutations in `sync_outbox`.
- **AC-4**: The Today screen (`src/app/(tabs)/index.tsx`) reads live SQLite data via TanStack Query hooks (`useTodayTimetable`), computing the Next class hero card, Rest of today occurrences, Due in the next 3 days assignments, Free day empty state (`Screens/28 Today · nothing on.png`), and Paused semester banner (`Screens/29 Today · class paused.png`), plus opening the Avatar menu sheet (`Screens/33 Avatar menu.png`) and Notifications screen (`Screens/32 Notifications.png`).
- **AC-5**: The Classes tab (`src/app/(tabs)/classes.tsx`) matches `Screens/35 Classes.png`, `Screens/36 Classes · month.png`, `Screens/37 Classes · day.png`, and `Screens/42 Classes · empty.png`, featuring the `List | Calendar` segmented control, `Day | Week | Month` sub toggle, interactive 7 day week strip with class indicator dots, month grid with selected date ring/fill, and day hour grid (`8 am` to `5 pm`) with a live red time indicator line.
- **AC-6**: Tapping any class card or day block navigates to Class detail (`src/app/class/[id].tsx`, matching `Screens/38 Class detail.png`) with course tag, time, venue, lecturer, recurrence summary, reminder lead time, check in toggle, personal note input persisted to SQLite, and course attendance summary card (which links to Course detail `src/app/course/[id].tsx` matching `Screens/39 Course detail.png`).

## Decision

**Chosen option**: Local first SQLite repository hooks with TanStack Query cache invalidation and pre seeded CSC 300L UNIBEN dataset.

See [rationale.md](rationale.md) for the option comparison and reasoning.

**Implementation skills**: `expo-router` (`.agents/skills/expo-router/`), `supabase` (`.agents/skills/supabase/`)

## Feature design

**Routes and surfaces**:

| Route                          | Screen asset                                                                                     | Purpose                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `src/app/(tabs)/index.tsx`     | `27 Today.png`, `28 Today · nothing on.png`, `29 Today · class paused.png`, `33 Avatar menu.png` | Authoritative daily timetable with live SQLite query, avatar sheet, and notifications link            |
| `src/app/(tabs)/classes.tsx`   | `35 Classes.png`, `36 Classes · month.png`, `37 Classes · day.png`, `42 Classes · empty.png`     | Weekly list view, 7 day strip, month calendar grid, and day hour timeline                             |
| `src/app/class/[id].tsx`       | `38 Class detail.png`                                                                            | Occurrence detail, personal note editor, check in toggle, and attendance bar                          |
| `src/app/course/[id].tsx`      | `39 Course detail.png`                                                                           | Course overview, attendance status card, weekly classes, and course assignments                       |
| `src/app/setup/welcome.tsx`    | `02 Welcome.png`, `07 Create account.png`, `08 Sign in.png`                                      | Onboarding welcome and account sign in / creation                                                     |
| `src/app/setup/semester.tsx`   | `22 Setup · semester.png`                                                                        | Institution, semester name, start/end dates, and mid semester break form                              |
| `src/app/setup/courses.tsx`    | `23 Setup · courses.png`                                                                         | Registered semester courses list with Add course button                                               |
| `src/app/setup/add-course.tsx` | `24 Add course.png`                                                                              | Course code, units, title, lecturer, description, and 8 color swatch picker                           |
| `src/app/setup/add-class.tsx`  | `25 Add class.png`                                                                               | Course picker, Lecture/Tutorial/Lab pills, multi day selector (`Mon` to `Sat`), time range, and venue |
| `src/app/setup/complete.tsx`   | `26 Setup complete.png`                                                                          | Summary counters (courses, classes a week, break) and navigation to Today                             |

**Data flow and value sourcing**:

| Action / Render        | Value produced or displayed                 | Source                                                                                                                                      |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| App cold start         | Initial CSC 300L UNIBEN dataset             | `ensureSeeded()` in `src/db/seed.ts` executed after SQLite migrations in `src/app/_layout.tsx`                                              |
| Today screen load      | Next class, Rest of today, Due in 3 days    | `useTodayTimetable(referenceDate)` in `src/hooks/useTimetable.ts` querying `courses`, `class_rules`, `class_occurrences`, and `assignments` |
| Classes week strip     | 7 days (`Mon` to `Sun`) with dot indicators | `expandWeeklyClassRules` + `mergeVirtualAndConcreteOccurrences` in `src/lib/timetable.ts`                                                   |
| Add course submit      | New `courses` row + `sync_outbox` entry     | `useCreateCourse()` mutation invalidating `['courses']` and `['timetable']` queries                                                         |
| Add class submit       | One `class_rules` row per selected weekday  | `useCreateClassRules()` mutation inserting a rule for each picked day (`Mon`, `Wed`, etc.)                                                  |
| Class detail note edit | Updated note in local storage / occurrence  | `useUpdateClassNote()` mutation persisting student note                                                                                     |

**Key invariants**:

- All database queries run asynchronously and fall back gracefully on web export (`db.web.ts`) using an in memory store seeded with the same canonical CSC 300L UNIBEN dataset so both native (SQLite) and web companion render identically.
- Every UI component uses explicit React Native `style` flex layouts alongside `Text` typography variants (`title-page`, `title-section`, `title-card`, `time`, `body-lg`, `body`, `label`, `label-sm`, `caption`) so no NativeWind className interop quirk can break row alignment or font weights.
- Course tags always use `6px` border radius (`radius/sm`), cards use `16px` border radius (`radius/xl`) with `4px` left course stripes, and past classes fade to `0.6` opacity.

## Build plan

1. Create the cross platform timetable repository and seeder (`src/db/seed.ts` and `src/hooks/useTimetable.ts`) that seeds the canonical CSC 300L UNIBEN dataset into SQLite on native (and in memory fallback on web) and exposes TanStack Query hooks for Today, Classes, Courses, and mutations, satisfies **AC-1**, **AC-4**.
2. Build the Classes tab (`src/app/(tabs)/classes.tsx`) with `List | Calendar` segmented tabs, `Day | Week | Month` sub toggle, interactive 7 day week strip (`Screens/35 Classes.png`), Month calendar grid (`Screens/36 Classes · month.png`), Day hour timeline (`Screens/37 Classes · day.png`), and floating `+` action to add a class or course, satisfies **AC-5**.
3. Build Class detail (`src/app/class/[id].tsx`, matching `Screens/38 Class detail.png`) and Course detail (`src/app/course/[id].tsx`, matching `Screens/39 Course detail.png`) with attendance progress bar (`AttendanceBar`), personal note editor, and navigation from Today and Classes cards, satisfies **AC-6**.
4. Build the Avatar menu bottom sheet (`Screens/33 Avatar menu.png`) and the Onboarding & Setup flows (`src/app/setup/welcome.tsx`, `semester.tsx`, `courses.tsx`, `add-course.tsx`, `add-class.tsx`, `complete.tsx` matching Screens `02`, `07`, `08`, `22–26`), wired to SQLite mutations, satisfies **AC-2**, **AC-3**.
5. Wire `src/app/(tabs)/index.tsx` to `useTimetable` hooks so adding or modifying a course or class in the setup/add forms immediately reflects on Today and Classes, and verify with `npm run check` and `npx expo export -p web`, satisfies **AC-1** through **AC-6**.

## Consequences

**Positive**:

- Today and Classes become 100 percent data driven from SQLite on native and in memory state on web while preserving the exact Screen 27 and Screen 35 visual appearance on first launch.
- Students can add courses, pick from the 8 course colors, schedule multi day classes, inspect class and course details, and browse their timetable by week, month, or day.

**Negative / tradeoffs**:

- Maintaining an in memory fallback in `src/db/` for web alongside SQLite on native requires keeping both adapter interfaces aligned inside `src/hooks/useTimetable.ts`.

## Follow-up

- [ ] Connect shared class codes and QR scanner in Slice 2 (`Class sharing & import`).
- [ ] Schedule real `expo-notifications` triggers when class rules are created in Slice 4 (`Local class reminders`).

## Rationale

See [rationale.md](rationale.md).
