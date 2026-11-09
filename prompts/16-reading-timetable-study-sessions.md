# 16 · Reading timetable & personal study sessions

Status: done

## Goal

Enable students to schedule recurring or one-time personal **Study / Reading sessions** linked to specific courses (Main, Carry-over, or Elective) under the `Others` calendar, log completed study sessions, view course reading timetables on Course Detail, and track weekly/semester reading hours in Reports with 100% Card view and Calendar view parity.

## Decisions

- Keep the 4-calendar architecture (`1. Classes`, `2. Assignments`, `3. Exams`, `4. Others`): reading sessions live under `Others` (`category: "Study"`) and link to a `Course` via `linkedCourseId`.
- Display course-linked reading blocks with a clear badge (`STUDY · MTH 301`) and the course's accent color (or teal `#0D9488` for unlinked general study) in both Card view and Calendar view.
- Persist all created reading sessions, linked courses, study topics, and completed session dates in `tt_persistent_timetable_v1` via `useTimetable.ts`.
- Expose a `+ Add study session` button on `CourseDetailScreen` (`src/app/course/[id].tsx`) that pre-fills `category=Study` and `courseId=<course.id>` in `src/app/events/add.tsx`.
- Compute live weekly and semester reading hours per course in `src/app/reports/index.tsx` instead of static placeholder numbers.

## Out of scope

- Pomodoro countdown timer with background audio.
- Shared group study rooms over WebRTC.

## Steps

### 1. Course-linked Study Session data model, seed data & hooks

Extend `PersonalOtherItem` in `src/db/seed.ts` with `linkedCourseId?: string | null`, `studyTopic?: string`, and `completedDates?: string[]`. Seed canonical recurring reading blocks for `MTH 301` (_"Eigenvalues & Linear Transformations"_), `CSC 301` (_"Process Scheduling & Deadlocks"_), and carry-over `STA 211` (_"Confidence Intervals Practice"_). Update `getOccurrencesForDate`, `useCreatePersonalEvent`, and add `useToggleStudySessionComplete` + `getReadingStats()` in `src/hooks/useTimetable.ts`.

### 2. Course Link & Study Focus in Add Calendar Event screen

Update `src/app/events/add.tsx` to read optional `category` and `courseId` query parameters from `useLocalSearchParams`. When `otherCategory === "Study"`, display a **Linked course (optional)** chip selector across the student's subscribed courses (`Main`, `Carry-over`, `Elective`, or `General study`) and a **Study focus / topic** input, automatically adapting the default title and color to the chosen course.

### 3. Study session completion & Course Detail Reading Timetable

Update `src/app/class/[id].tsx` so opening a `Study` session displays its linked course badge, study focus note, a **Mark study session completed** toggle button for that date, and a shortcut to view the linked course. Update `src/app/course/[id].tsx` to include a **Reading timetable** section showing all scheduled study blocks for that course, total weekly reading hours, and a `+ Add study session` button.

### 4. Dynamic Reading Hours in Reports screen

Update `src/app/reports/index.tsx` to connect `useTimetable()` and render live weekly and semester reading hours in the 2x2 summary grid, plus a **Reading by course** breakdown card list below attendance reports.

## Verification

- Create a new Study session linked to `CSC 301` or `STA 211` on `/events/add` and verify it appears identically in **Card view** and **Calendar view** on both Today (`src/app/(tabs)/index.tsx`) and Classes (`src/app/(tabs)/classes.tsx`).
- Open the Study session on `/class/[id]`, toggle **Mark study session completed**, and verify completion state persists across reloads and updates `/reports`.
- Open `/course/course-mth-301`, verify the **Reading timetable** section lists its study sessions, and tap `+ Add study session` to confirm it pre-selects `Study` + `MTH 301`.
- Run `npm run format && npm run check` (`npx tsc --noEmit`, `npx expo lint`, Prettier) with zero errors.

## AGENTS.md updates

- Document Spec `0013` (Reading Timetable & Personal Study Sessions) in `AGENTS.md` under `Specs & Plans` and `Local Database & Offline Store`.

## Result

- Extended `PersonalOtherItem` in `src/db/seed.ts` and `src/hooks/useTimetable.ts` with `linkedCourseId`, `studyTopic`, and `completedDates`, seeding canonical reading blocks for `MTH 301`, `CSC 301`, and `STA 211` and adding `useToggleStudySessionComplete`.
- Upgraded `src/app/events/add.tsx` to accept `category` and `courseId` route params and display a Subscribed Course selector and Study Focus input when creating `Study` events.
- Upgraded `src/app/class/[id].tsx` with one-tap study session completion logging and `src/app/course/[id].tsx` with a per-course **Reading timetable** section and `+ Add study session` shortcut.
- Upgraded `src/app/reports/index.tsx` to dynamically compute weekly and semester reading hours and render a **Reading by course** breakdown.
