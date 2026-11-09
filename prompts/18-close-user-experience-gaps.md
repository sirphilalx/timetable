# 18 · Close User Experience Gaps & Unify Live Data

Status: done

## Goal

Eliminate remaining static wireframe artifacts across the app so that the Assignments tab (both List and Calendar views), Add Assignment flow, Assignment Detail, Class Settings, Pending Check-Ins, and main Sidebar-driven navigation operate on live, persistent data with clean navigation chrome.

## Decisions

- Drive both the **List view** and **Calendar view** on `src/app/(tabs)/assignments.tsx` from `useTimetable().data.assignments` (joined with `data.allCatalogCourses`), respecting active sidebar subscription filters (`Main class`, `Carry-over`, `Elective`), completion status, and time-horizon chips (`This week`, `Next week`, `Later`), with interactive date selection in Calendar view.
- Route assignment cards under _"Due in the next 3 days"_ on `src/app/(tabs)/index.tsx` directly to `/assignment/${asg.id}` instead of the generic `/(tabs)/assignments` tab.
- Remove prototype wireframe switcher bars (`(47)`, `(52)`, `(63)`, etc.) from `src/app/assignment/[id].tsx`, `src/app/assignment/add.tsx`, and `src/app/class-settings/index.tsx`, replacing them with clean in-context navigation buttons and automatic Solo/Group detection.
- Populate the course selector in `src/app/assignment/add.tsx` from `data.allCatalogCourses` and convert the `DatePickerModal` selection into a real ISO `dueAt` timestamp passed to `useCreateAssignment()`.
- Filter `src/app/check-ins/pending.tsx` against `useTimetable().data.attendanceRecords` so resolved check-ins stay resolved across screen visits and update course attendance stats.
- Hide the redundant bottom tab bar (`tabBarStyle: { display: "none" }` in `src/app/(tabs)/_layout.tsx`) and remove redundant `ClassSwitcherSheet` title dropdown triggers on `Today`, `Classes & Calendar`, and `Assignments` now that the App Switcher Sidebar is the unified navigation hub.

## Out of scope

- Remote backend schema changes (all local SQLite and query-cache mutations already exist in `useTimetable.ts`).

## Steps

### 1. Live Assignments List & Interactive Calendar View + Today Deep Link

Update `src/app/(tabs)/assignments.tsx` to read live assignments from `useTimetable()`, filter by active subscription and horizon, and provide an interactive month grid in Calendar view where tapping any date displays its live assignments below. Update `src/app/(tabs)/index.tsx` so tapping an assignment card navigates directly to `/assignment/${asg.id}` and clean up the header chrome on `Today` and `Classes & Calendar`.

### 2. Clean Up Assignment Detail, Add Assignment & Class Settings Flows

Update `src/app/assignment/[id].tsx` to remove the `(52)..(57)` debug pill bar, auto-detect `"solo"` vs `"group"` mode from the matched assignment, and wire clean in-card actions for group polls, rep group management, and member tagging. Update `src/app/assignment/add.tsx` to remove the `(47)..(58)` debug bar, add a live course selector from `allCatalogCourses`, wire `DatePickerModal` to a real ISO `dueAt` timestamp, and provide a clean banner to review classmate suggestions. Update `src/app/class-settings/index.tsx` to remove the `(63)..(76)` debug bar and navigate via its existing settings rows and header Back button.

### 3. Persistent Pending Check-Ins & Sidebar-Only Tab Layout

Update `src/app/check-ins/pending.tsx` so pending items are filtered against `useTimetable().data.attendanceRecords` and persist across screen visits when marked attended or missed. Update `src/app/(tabs)/_layout.tsx` to hide the bottom tab bar (`tabBarStyle: { display: "none" }`).

## Verification

- Run `npm run format && npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check`) with zero errors.
- Run `npx expo export -p web` to confirm static web export succeeds with zero native compilation issues.
- Verify that creating an assignment in `/assignment/add` immediately appears in both the Assignments List view and Calendar view on its selected due date and course.
- Verify that resolving a pending check-in in `/check-ins/pending` persists when navigating away and returning.

## AGENTS.md updates

- Under **Who owns what → Styling & Design System / Navigation**: note that `AppSidebarShell` (`src/components/navigation/AppSidebarShell.tsx`) is the primary app switcher and navigation hub (opened via `HamburgerButton` or left-to-right swipe), with the bottom tab bar hidden (`tabBarStyle: { display: "none" }`) and all four calendars + subscription modes unified between List and Calendar views.

## Result

- Connected `src/app/(tabs)/assignments.tsx` (both List and interactive Calendar views) to `useTimetable().data.assignments` and `data.assignmentProgress`, with live subscription filtering, time-horizon chips, interactive date dots, and `Done` tracking.
- Updated `src/app/(tabs)/index.tsx` so assignment cards under _"Due in the next 3 days"_ deep-link directly to `/assignment/${asg.id}`.
- Removed prototype screen-number switcher bars from `src/app/assignment/[id].tsx`, `src/app/assignment/add.tsx`, and `src/app/class-settings/index.tsx`, wiring real course & date selection in `/assignment/add` and progress persistence in `/assignment/[id]`.
- Filtered `src/app/check-ins/pending.tsx` against `useTimetable().data.attendanceRecords` so resolved check-ins stay resolved across screen visits.
- Hid the redundant bottom tab bar in `src/app/(tabs)/_layout.tsx` and removed duplicate header switcher sheets on `Today`, `Classes & Calendar`, and `Assignments`.
