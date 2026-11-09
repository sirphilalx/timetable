# 14 · Multi-Calendar Today, Exams, Others & Course Subscriptions (Slice 9)

Status: done
Spec: `docs/specs/0012-multi-calendar-subscriptions/index.md`

## Goal

Enable the Today and Calendar views to display and filter all 4 student calendars (**Classes**, **Assignments**, **Exams**, and **Others** like Gym, Church, and Club) and support 3 shared-class subscription modes (**Main class**, **Carry-over courses**, and **Elective courses from other departments**) with selective course picking and full inheritance of all course and class settings.

## Decisions

- **Four unified calendars (`Classes`, `Assignments`, `Exams`, `Others`)**: Today merges all four calendars into both Card view (with the live horizontal curtain bar on the ongoing item and cascading `Time -> Pill + Title -> Venue` compact cards) and Calendar day view (proportional duration height + side-by-side collision columns).
- **Three shared-class subscription modes (`Main class`, `Carry-over`, `Elective`)**: When joining a shared class (`/join/[code]`), students choose whether to follow the entire class (**Main class**), pick specific **Carry-over course(s)** from a lower level (e.g. `STA 211` from `200L`), or pick specific **Elective course(s)** from another department (e.g. `ECO 303` from `Economics 300L`).
- **Full inheritance of settings & live updates**: Subscribed courses (whether Main, Carry-over, or Elective) automatically inherit all course metadata (code, title, units, color, lecturer name/email/phone), per-day recurring or one-time schedules, durations, venues, single-occurrence move/cancel overrides, assignments, exams, rep notes, and class pause/break settings.
- **Interactive filtering in `ClassSwitcherSheet`**: Tapping the Today header opens `ClassSwitcherSheet` with live filters for both calendar categories (**All calendars**, **Classes**, **Assignments**, **Exams**, **Others**) and followed class subscriptions (**All followed classes**, **Main class · CSC 300L**, **Carry-over · STA 211 · 200L**, **Elective · ECO 303 · ECO 300L**, and **Others / My own events**), plus a course picker to adjust selected carry-over or elective courses at any time.
- **Dedicated creation flow for Exams & Others**: Students can add **Exams** (course, exam date, start time, duration, exam hall/venue, seat/instructions) and **Others** items (Gym, Church, Club, Study, etc., with recurring days or one-time date, duration, and location) via `/events/add` (reachable from Today, Classes, and Add Class).

## Out of scope

- Camera OCR timetable import from notice board photos (Deferred).
- External third-party Google Calendar / Apple iCal OAuth sync.

## Steps

### 1. Multi-Calendar & Subscription Store (`src/db/seed.ts` & `src/hooks/useTimetable.ts`)

Extend `src/db/seed.ts` and `src/hooks/useTimetable.ts` to store:

- Shared class catalogs (`CSC 300L · Computer Science`, `CSC 200L · Lower Level`, `ECO 300L · Economics`) with full course metadata, per-day rules, concrete overrides, exams, and assignments.
- Active subscriptions (`followedSubscriptions`) with `mode: "main" | "carryover" | "elective"` and `selectedCourseIds: string[]`, seeded with `CSC 300L` (main), `STA 211` (carry-over from 200L), and `ECO 303` (elective from Economics 300L).
- Canonical `exams` and `personalEvents` (`Others`: e.g. `Gym`, `Church`, `Tech Club`) and mutations (`useCreateExam`, `useCreatePersonalEvent`, `useSubscribeSharedClass`, `useUpdateCalendarFilters`).
- Unified `getOccurrencesForDate(isoDate)` projection that merges Classes (main + carry-over + elective), Exams, Others, and due-today Assignments while respecting the active calendar and subscription filters. Satisfies AC-1, AC-5.

### 2. Three-Mode Class Subscription & Course Checklist (`src/app/join/[code].tsx`)

Upgrade `src/app/join/[code].tsx` so tapping **Follow class** opens a subscription sheet with three modes:

1. **Main class (Follow entire class)** — subscribes to all courses in the class and triggers duplicate course clash resolution if needed.
2. **Carry-over course(s) (Lower level)** — opens an interactive checklist of courses in that shared class so only the checked carry-over course(s) are added to the student's timetable, labeled `From <Code> carryover · <Level>`.
3. **Elective course(s) (Other department)** — opens an interactive checklist of courses from that department's shared class so only the checked elective course(s) are added, labeled `From <Code> elective · <Dept>`.
   Ensure all course settings, lecturer info, per-day times, durations, venues, moved/cancelled overrides, exams, and assignments carry on to the subscriber. Satisfies AC-2.

### 3. Live Calendar & Subscription Switcher (`src/components/timetable/ClassSwitcherSheet.tsx`)

Upgrade `src/components/timetable/ClassSwitcherSheet.tsx` to:

- Let students filter by the 4 calendars (**All**, **Classes**, **Assignments**, **Exams**, **Others**) and by followed subscription (**All followed classes**, **CSC 300L · Main class**, **STA 211 · Carry-over (200L)**, **ECO 303 · Elective (ECO 300L)**, **Others · Only you**).
- Allow editing which specific courses are ticked inside any Carry-over or Elective subscription directly from the sheet.
- Provide quick actions to **+ Join another class / course** and **+ Add Exam or Other event**. Satisfies AC-3.

### 4. Add Exam & Add "Others" Event Screen (`src/app/events/add.tsx`)

Create `src/app/events/add.tsx` (and register in `src/app/_layout.tsx` + link from `src/app/setup/add-class.tsx`, `src/app/(tabs)/index.tsx`, and `src/app/(tabs)/classes.tsx`) supporting:

- **Exam** creation: Course selector, paper type (`Written`, `CBT`, `Practical`), date picker, start time picker, duration selector (`1 hr` to `4 hrs`), exam hall/venue input, and instructions/seat note.
- **Others** creation: Quick category presets (`Gym`, `Church`, `Club`, `Study`, `Custom`), title input, color swatch picker, multi-day recurring or one-time date selector, per-day start time & duration pickers, and venue/location input. Satisfies AC-4.

### 5. Unified Today & Calendar Views (`src/app/(tabs)/index.tsx` & `src/app/(tabs)/classes.tsx`)

Update `src/app/(tabs)/index.tsx`, `src/hooks/useLiveClassProgress.ts`, and `src/app/(tabs)/classes.tsx` so:

- Today displays the active filter pill in the header (`All calendars` or specific calendar/subscription) and renders **Classes** (Main, Carry-over, Elective), **Exams**, **Others** (Gym, Church, Club), and **Assignments** in both Card view and Calendar day view.
- Ongoing items of any calendar type use the Hero card (with the traveling horizontal curtain bar) and native iOS Live Activity / Dynamic Island integration.
- Run `npm run format && npm run check` and `npx expo export -p web`. Satisfies AC-5.

## Verification

- On **Today**, tap the header (`Friday 6 November · ...`) to open `ClassSwitcherSheet` and toggle between **All calendars**, **Classes**, **Assignments**, **Exams**, and **Others**, as well as between **All classes**, **Main class (`CSC 300L`)**, **Carry-over (`STA 211`)**, and **Elective (`ECO 303`)**.
- Verify that both **Card view** and **Calendar day view** on Today show Main classes, Carry-over classes (`From STA 211 carryover · 200L`), Elective classes (`From ECO 303 elective · ECO 300L`), Exams, Others (`Gym`, `Church`), and Assignments.
- Open `/join/CSC200` or `/join/ECO300` (or tap **Join another class** in the switcher), select **Carry-over course(s)** or **Elective course(s)**, check a single course from the list, and verify that only that course (along with all its times, venues, lecturer details, and overrides) appears on Today.
- Open **Add Exam / Other event** (`/events/add`), create a `Gym` or `Church` item and an `Exam` item, and confirm both save to SQLite / `memoryStore` and render immediately on Today.
- Run `npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check .`) and `npx expo export -p web` with 0 errors.

## AGENTS.md updates

- Add `[0012. Multi-Calendar Today, Exams, Others & Course Subscriptions](docs/specs/0012-multi-calendar-subscriptions/index.md)` to `## Specs & Plans`.
- Document the 4 calendars (`Classes`, `Assignments`, `Exams`, `Others`) and 3 shared-class subscription modes (`Main class`, `Carry-over`, `Elective`) under `## Who owns what`.

## Result

Implemented unified 4-calendar support (**Classes**, **Assignments**, **Exams**, **Others**) and 3-mode shared class subscriptions (**Main class**, **Carry-over courses**, **Elective courses from other departments**) with selective course checklists and full inheritance of course metadata, per-day schedules, venues, occurrence overrides, exams, and assignments across `src/db/seed.ts`, `src/hooks/useTimetable.ts`, `src/app/join/[code].tsx`, `src/components/timetable/ClassSwitcherSheet.tsx`, `src/app/events/add.tsx`, and `src/app/(tabs)/index.tsx`.
