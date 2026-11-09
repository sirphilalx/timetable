# 15 · Exam & Others Detail Screens + Classes Tab Multi-Calendar Integration

Status: done
Spec: `docs/specs/0012-multi-calendar-subscriptions/index.md`

## Goal

Ensure tapping any **Exam**, **Others** (`Gym`, `Church`, `Club`), **Carry-over**, or **Elective** card opens an accurate, dynamic detail screen (`src/app/class/[id].tsx`) with real date/time, exam instructions/countdown, subscription attribution, and delete/edit support, and upgrade the **Classes / Calendar** tab (`src/app/(tabs)/classes.tsx`) with 4-calendar filtering and a dynamic Day timeline.

## Decisions

- **Dynamic Item Resolution in `src/app/class/[id].tsx`**: Resolve `matched` across all dates (`calendarFilter: "all"`) using `matched.courseCode`, `matched.courseTitle`, `matched.courseColor`, `matched.displayTime`, and `matched.venue` rather than falling back to hardcoded `CSC 301 · Fri 6 Nov · 10:00 am – 12:00 pm`.
- **Calendar-Aware Detail Cards (`Class`, `Exam`, `Others`)**:
  - **Exams**: Display red Exam pill, paper type (`CBT` / `Written` / `Practical`), exam countdown badge, exam hall, and seat/batch instructions, plus a **Delete exam** option.
  - **Others (`Gym`, `Church`, `Club`, `Study`, `Personal`)**: Display category badge (`Others · Only you`), recurrence schedule, location, personal note, and a **Delete event** option.
  - **Carry-over & Elective Classes**: Display the subscription inheritance banner (`From STA 211 carryover · 200L` or `From ECO 303 elective · Economics 300L`) showing that lecturer info, venues, and rep overrides are synced.
- **Multi-Calendar Filtering & Dynamic Day Timeline on `src/app/(tabs)/classes.tsx`**:
  - Add the 4-calendar filter pills (`All`, `Classes`, `Assignments`, `Exams`, `Others`) to the **Classes** tab so students can filter the Week list, Month calendar, and Day timeline.
  - Replace the static 2-item Day timeline on `src/app/(tabs)/classes.tsx` with dynamic blocks rendered from `dayClasses` (`getOccurrencesForDate(selectedDate)`).

## Out of scope

- Cloud push notifications for deleted personal events.

## Steps

### 1. Delete Mutations for Exams & Others (`src/hooks/useTimetable.ts`)

Add `useDeleteExam()` and `useDeletePersonalEvent()` mutations to `src/hooks/useTimetable.ts` so students can remove Exams or Others items from the detail screen.

### 2. Upgrade Item Detail Screen (`src/app/class/[id].tsx`)

Update `src/app/class/[id].tsx` to:

- Display the exact `matched.courseTitle`, `matched.courseCode`, `matched.displayTime`, `matched.date`, `matched.venue`, and `matched.sourceAttribution` for Classes, Carry-overs, Electives, Exams, and Others.
- Render Exam-specific details (paper type, countdown, seat/batch instructions, delete action) when `matched.calendarKind === "exams"`, and Others-specific details (category, recurrence, delete action) when `matched.calendarKind === "others"`.

### 3. Upgrade Classes / Calendar Tab (`src/app/(tabs)/classes.tsx`)

Update `src/app/(tabs)/classes.tsx` to:

- Show the 4-calendar filter bar (`All`, `Classes`, `Assignments`, `Exams`, `Others`) and active subscription subtitle (`ClassSwitcherSheet` trigger).
- Render all items for `selectedDate` dynamically on the **Calendar -> Day** timeline.
- Let the floating `+` button open a quick chooser or navigate to add a Course Class (`/setup/add-class`) or an Exam / Other event (`/events/add`).

## Verification

- Tap an **Exam** card (`CSC 301 · EXAM`), an **Others** card (`GYM` or `CHURCH`), a **Carry-over** card (`STA 211`), and an **Elective** card (`ECO 303`) on Today and verify that `/class/[id]` displays each item's real title, time, venue, and calendar-specific details.
- Switch to the **Classes** tab, filter between `All`, `Classes`, `Exams`, and `Others`, and check both **List** and **Calendar -> Day / Month** views.
- Run `npm run format && npm run check` with 0 errors and 0 warnings.

## AGENTS.md updates

None

## Result

Implemented `useDeleteExam()` and `useDeletePersonalEvent()` in `src/hooks/useTimetable.ts`, upgraded `src/app/class/[id].tsx` with dynamic resolution and delete/attribution support for Classes, Carry-overs, Electives, Exams, and Others (`Gym`, `Church`, `Club`), and upgraded `src/app/(tabs)/classes.tsx` with the 4-calendar filter bar, `ClassSwitcherSheet` integration, and a dynamic Day timeline.
