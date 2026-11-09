# 0013. Reading timetable & personal study sessions

**Date**: 2026-11-07
**Status**: Accepted

## Summary

This specification defines Slice 10: a personal **Reading Timetable & Study Sessions** system that lets students link recurring or one-time reading blocks (under the `Others · Study` calendar) directly to subscribed courses (Main, Carry-over, or Elective), set study topic/focus goals, log completed study sessions, and track weekly and semester reading hours per course in Course Detail and Reports while maintaining 100% parity between Card view and Calendar view.

## Requirements

**User stories**:

- As a student preparing for tests and exams, I want to schedule recurring or one-time personal **Study / Reading sessions** linked to a specific course (e.g., `MTH 301`, `CSC 301`, or carry-over `STA 211`) with a target study topic (e.g., _"Eigenvalues & past questions"_) and location (e.g., _"John Harris Library"_).
- As a student viewing Today or the Classes tab in either **Card view** or **Calendar view**, I want my course-linked reading sessions to appear faithfully in both views with the linked course code, study topic, time range, and venue.
- As a student viewing a course (`src/app/course/[id].tsx`) or a study session (`src/app/class/[id].tsx`), I want to see my scheduled reading blocks for that course, log/mark a study session as completed, or tap **Add study session** with that course pre-selected.
- As a student checking my **Reports** (`src/app/reports/index.tsx`), I want the **Reading** stat card and a new **Reading hours by course** breakdown to dynamically compute my real weekly and semester study hours across my courses.

**Acceptance criteria**:

- **AC-1**: `PersonalOtherItem` (`src/db/seed.ts` and `src/hooks/useTimetable.ts`) supports optional `linkedCourseId: string | null`, `studyTopic: string`, `weeklyGoalHours: number`, and `completedDates: string[]` (persisted in `tt_persistent_timetable_v1`), with canonical seeded reading sessions linked to `MTH 301`, `CSC 301`, and `STA 211`.
- **AC-2**: When creating a `Study` event in `src/app/events/add.tsx` (or launching `/events/add?category=Study&courseId=...`), students can pick a linked course from their subscribed courses (Main, Carry-over, or Elective) and enter a study focus/topic; the created reading block uses the course badge (`STUDY · MTH 301`) and appears identically in both Card view and Calendar view.
- **AC-3**: On the item detail screen (`src/app/class/[id].tsx`), opening a `Study` session displays its linked course badge, study focus/goal, completion toggle (**Mark session completed** / **Completed** for that date), and a link to open the parent course.
- **AC-4**: On the Course Detail screen (`src/app/course/[id].tsx`), a dedicated **Reading timetable** section lists the student's scheduled reading blocks for that course, shows weekly study hours, and provides a `+ Add study session` action that routes to `/events/add?category=Study&courseId=<id>`.
- **AC-5**: On the Reports screen (`src/app/reports/index.tsx`), the **Reading** summary stat card and a **Reading by course** section dynamically reflect the student's scheduled and completed reading hours from `useTimetable()`.

## Decision

**Chosen option**: Extend `PersonalOtherItem` (`category === "Study"`) with `linkedCourseId`, `studyTopic`, and `completedDates`, projecting course-linked reading sessions through `getOccurrencesForDate` in `useTimetable.ts` so they automatically inherit 100% Card view / Calendar view parity, persistence via `tt_persistent_timetable_v1`, and subscription filtering when linked to a subscribed course.

See [rationale.md](rationale.md) for the option comparison and reasoning.

**Implementation skills**: `expo-router` (`.agents/skills/expo-router/`)

## Feature design

**Routes and surfaces**:

| Route / Component           | Purpose                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/db/seed.ts`            | Extend `PersonalOtherItem` with `linkedCourseId`, `studyTopic`, and `completedDates`; seed canonical reading timetable blocks     |
| `src/hooks/useTimetable.ts` | Project course-linked study sessions, expose `useToggleStudySessionComplete`, and compute weekly/semester reading hours by course |
| `src/app/events/add.tsx`    | Support URL params (`?category=Study&courseId=...`) and render a Course Link picker + Study Topic input when `Study` is selected  |
| `src/app/class/[id].tsx`    | Show linked course card, study topic, and one-tap **Mark study session completed** toggle for `Study` items                       |
| `src/app/course/[id].tsx`   | Add **Reading timetable** section per course with weekly study hours badge and `+ Add study session` shortcut                     |
| `src/app/reports/index.tsx` | Compute live weekly and semester reading hours and render a **Reading by course** progress breakdown                              |

**Key invariants**:

- Whatever reading sessions appear in **Card/List view** on Today or Classes must appear identically in **Calendar view** (`Day`, `Week`, `Month`).
- All newly created reading sessions and completion logs persist across app reloads via `tt_persistent_timetable_v1`.

## Build plan

1. Extend `PersonalOtherItem` in `src/db/seed.ts` and `src/hooks/useTimetable.ts` with `linkedCourseId`, `studyTopic`, `completedDates`, `useToggleStudySessionComplete`, and reading-hour aggregation helpers, satisfies **AC-1**.
2. Upgrade `src/app/events/add.tsx` to accept `category` and `courseId` route params and display a Subscribed Course selector and Study Focus input when `Study` category is active, satisfies **AC-2**.
3. Upgrade `src/app/class/[id].tsx` and `src/app/course/[id].tsx` with study session completion logging, course-linked reading blocks list, and `+ Add study session` deep link, satisfies **AC-3**, **AC-4**.
4. Upgrade `src/app/reports/index.tsx` to display live weekly/semester reading hours and a **Reading by course** breakdown, satisfies **AC-5**.
