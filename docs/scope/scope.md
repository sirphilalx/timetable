# Scope: TT Student Timetable

A calm mobile timetable app for Nigerian university students to manage classes, reminders, check ins, and assignments through shared course links.

**Build approach:** Tracer Bullet (vertical slices where each feature connects every layer end to end).
**Workflow:** Beta (after develop, run check verify then test). The project default level of rigor. /architect is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. · GA) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| #   | Feature                                                    | Phase      | Status |
| --- | ---------------------------------------------------------- | ---------- | ------ |
| 1   | Stack & architecture                                       | Foundation | done   |
| 2   | Coding standards & tooling                                 | Foundation | done   |
| 3   | Core data model                                            | Foundation | done   |
| 4   | Design system & UI foundation                              | Foundation | done   |
| 5   | Core timetable loop                                        | Slice 1    | done   |
| 6   | Class sharing & import                                     | Slice 2    | done   |
| 7   | Parental consent web companion                             | Slice 3    | done   |
| 8   | Local class reminders & reliable scheduling                | Slice 4    | done   |
| 9   | Post class check in & attendance tracking                  | Slice 5    | done   |
| 10  | Assignments & follower suggestions                         | Slice 6    | done   |
| 11  | Group assignments & sign up polls                          | Slice 7    | done   |
| 12  | Class management, rollover & offline sync                  | Slice 8    | done   |
| 13  | Multi calendar Today, Exams, Others & course subscriptions | Slice 9    | done   |
| 14  | Reading timetable & personal study sessions                | Slice 10   | done   |
| 15  | App switcher sidebar & hamburger navigation                | Slice 11   | done   |

## Foundations

### 1. Stack & architecture · done

Lock in Expo with React Native as chosen, decide the local database and backend sync service, and scaffold a runnable project.
**Done when:** the stack is recorded in a spec and the Expo scaffold boots locally on iOS and Android simulators and passes build.

- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture`
      Spec [0001](../specs/0001-stack-architecture.md) · code in `src/`

### 2. Coding standards & tooling · done

Capture project conventions and set up code quality tooling from the real scaffolded project.
**Done when:** root `AGENTS.md` reflects the real stack, and lint, format, typecheck, and pre-commit checks run clean.

- [x] Capture conventions + tooling choices: `/audit`
- [x] Install the tooling: `/develop tooling`
- [x] Check it runs clean: `/test`
      Plan [02-tooling](../../prompts/02-tooling.md) · verified with `npm run check`

### 3. Core data model · done

Define local SQLite schemas and remote entities for students, semesters, courses, class schedules, assignments, memberships, and sync state.
**Done when:** schema definitions and migrations support both device storage and cloud sync without breaking changes.

- [x] Design it (spec): `/architect core data model`
- [x] Build it: `/develop core data model`
  - [x] Local SQLite Drizzle schema and native migration runner, satisfies AC-1, AC-2, AC-3, AC-11
  - [x] Domain logic for virtual recurrence, attendance 7 day expiry, and assignment progress, satisfies AC-4, AC-5, AC-6, AC-7
  - [x] Offline sync outbox queue with dead letter transitions and Last Write Wins comparator, satisfies AC-8, AC-9
  - [x] Remote Supabase PostgreSQL schema migrations and Row Level Security policies, satisfies AC-2, AC-10
- [x] Verify it: `/check verify core data model`
- [x] Test it: verified with unit test suite
      Spec [0002](../specs/0002-core-data-model.md) · code in `src/db/` and `src/lib/`

### 4. Design system & UI foundation · done

Establish design tokens, typography, dark and light theme styles, and core user interface components adapted from Cadence Academy.
**Done when:** base components render consistently across light and dark themes and meet accessibility color contrast standards.

- [x] Design it (spec): `/architect design system & UI foundation`
- [x] Build it: `/develop design system & UI foundation`
  - [x] Styling tokens and dark mode theme pipeline, satisfies AC-1, AC-4
  - [x] Inter font loading pipeline and accessible Text wrapper, satisfies AC-2, AC-3
  - [x] Action, input, and overlay primitives, satisfies AC-5, AC-6
  - [x] System banners, empty states, and timetable cards, satisfies AC-7, AC-8
- [x] Verify it: `/check verify design system & UI foundation`
- [x] Test it: `/test design system & UI foundation`
      Spec [0003](../specs/0003-design-system-ui-foundation/index.md) · code in `src/components/`, `src/theme/`, and `src/app/ui-showcase.tsx`

## Slice 1: Core timetable loop

### 5. Core timetable loop · done

Complete the walking skeleton with user sign in, manual semester and course setup, recurring class entry, and viewing on Today and Classes lists.
**Done when:** a student can sign in, enter semester courses and weekly classes, and see them correctly displayed on the Today screen.

- [x] Design it (spec): `/architect core timetable loop`
- [x] Build it: `/develop core timetable loop`
  - [x] Canonical CSC 300L UNIBEN SQLite seeder and TanStack Query timetable hooks, satisfies AC-1, AC-4
  - [x] Classes tab with List view, 7 day week strip, Month calendar grid, and Day hour timeline, satisfies AC-5
  - [x] Class detail and Course detail screens with attendance bar and note persistence, satisfies AC-6
  - [x] Avatar menu sheet and Welcome, Semester, Add Course, and Add Class setup flows, satisfies AC-2, AC-3
- [x] Verify it: `/check verify core timetable loop`
- [x] Test it: `/test core timetable loop`
      Spec [0004](../specs/0004-core-timetable-loop/index.md) · Plan [06-core-timetable-loop](../../prompts/06-core-timetable-loop.md) · code in `src/db/seed.ts`, `src/hooks/useTimetable.ts`, `src/app/(tabs)/`, `src/app/class/[id].tsx`, `src/app/course/[id].tsx`, and `src/app/setup/`

## Slice 2: Class sharing & import

### 6. Class sharing & import · done

Allow course reps to share a class via unique links, short codes, and QR cards, letting classmates preview and follow with one tap.
**Done when:** an unauthenticated student can view an import preview from a shared link or QR scan, follow the class, and merge courses without duplicate clashes.

- [x] Design it (spec): `/architect class sharing & import`
- [x] Build it: `/develop class sharing & import`
  - [x] Vector QR matrix, Share class bottom sheet, and Class switcher bottom sheet, satisfies AC-2, AC-5
  - [x] Rep share form, WhatsApp QR card, and high contrast Projector mode, satisfies AC-1, AC-2
  - [x] QR scanner viewfinder, 6 character share code entry, class preview, and course clash resolution sheet, satisfies AC-3, AC-4
- [x] Verify it: `/check verify class sharing & import`
- [x] Test it: `/test class sharing & import`
      Spec [0005](../specs/0005-class-sharing-import/index.md) · Plan [07-class-sharing-import](../../prompts/07-class-sharing-import.md) · code in `src/app/share/`, `src/app/join/`, and `src/components/timetable/`

## Slice 3: Parental consent web companion

### 7. Parental consent web companion · done · GA

Provide age verification during sign up and a web approval page for parents or guardians of students under 18 in compliance with the Nigeria Data Protection Act.
**Done when:** students under 18 trigger a guardian consent notice, external parents can approve or decline on the web, and unapproved accounts stay restricted to previews.

- [x] Design it (spec): `/architect parental consent web companion`
- [x] Build it: `/develop parental consent web companion`
  - [x] Date of birth age gate and display name collision check (`Screens/10–12`), satisfies AC-1
  - [x] Under 18 guardian consent request and waiting for consent restricted preview (`Screens/13–14`), satisfies AC-2
  - [x] Zero native dependency static web approval route `/consent/[token]` (`Screens/15`), satisfies AC-3
- [x] Verify it: `/check verify parental consent web companion`
- [x] Test it: `/test parental consent web companion`
      Spec [0006](../specs/0006-parental-consent-web-companion/index.md) · Plan [08-parental-consent-web-companion](../../prompts/08-parental-consent-web-companion.md) · code in `src/app/setup/profile.tsx`, `src/app/consent/[token].tsx`, and `src/lib/consent.ts`

## Slice 4: Local class reminders & reliable scheduling

### 8. Local class reminders & reliable scheduling · done

Schedule reliable local notifications before class starts, handling Android exact alarms, battery optimization guidance, and reminder setup checks.
**Done when:** reminders trigger on time offline across test devices, leading with class venue, and reschedule cleanly when timetable entries change.

- [x] Design it (spec): `/architect local class reminders & reliable scheduling`
- [x] Build it: `/develop local class reminders & reliable scheduling`
  - [x] Venue first reminder payload builder and wall clock trigger scheduler (`src/lib/reminders.ts`), satisfies AC-1
  - [x] Reminder preferences, quiet hours, and Tecno/Infinix battery optimization setup check (`Screens/17`, `82`, `83`), satisfies AC-2, AC-3
  - [x] Notifications inbox and complete Settings suite (`Screens/32`, `80–88`), satisfies AC-4, AC-5
- [x] Verify it: `/check verify local class reminders & reliable scheduling`
- [x] Test it: `/test local class reminders & reliable scheduling`
      Spec [0007](../specs/0007-local-class-reminders/index.md) · Plan [09-local-class-reminders](../../prompts/09-local-class-reminders.md) · code in `src/lib/reminders.ts`, `src/app/notifications.tsx`, and `src/app/settings/`

## Slice 5: Post class check in & attendance tracking

### 9. Post class check in & attendance tracking · done

Prompt students with a post lecture check in to record attendance or add an assignment, tracking semester attendance percentages against a 75 percent target.
**Done when:** students can log attendance from notifications or pending lists, unknown check ins expire after 7 days, and attendance reports show course percentages.

- [x] Design it (spec): `/architect post class check in & attendance tracking`
- [x] Build it: `/develop post class check in & attendance tracking`
  - [x] Post class check in bottom sheet (`Screens/44–46`) for single class, overlapping classes, and rep posted notice, satisfies AC-1
  - [x] 7 day pending check ins screen (`Screens/49`) with one tap attended/missed resolution, satisfies AC-2
  - [x] Attendance reports, 2x2 stat grid, course progress bars, and MTH 301 drill down (`Screens/77–79`), satisfies AC-3
- [x] Verify it: `/check verify post class check in & attendance tracking`
- [x] Test it: `/test post class check in & attendance tracking`
      Spec [0008](../specs/0008-post-class-check-in-attendance/index.md) · Plan [10-post-class-check-in-attendance](../../prompts/10-post-class-check-in-attendance.md) · code in `src/components/timetable/PostClassCheckInSheet.tsx`, `src/app/check-ins/pending.tsx`, and `src/app/reports/index.tsx`

## Slice 6: Assignments & follower suggestions

### 10. Assignments & follower suggestions · done

Manage solo assignments by due date, allowing followers to suggest assignments from check ins and course reps to review, approve, or reject suggestions.
**Done when:** assignments display in Due soon, Missing, and Done lists with date markers, and approved suggestions broadcast while rejected ones remain personal.

- [x] Design it (spec): `/architect assignments & follower suggestions`
- [x] Build it: `/develop assignments & follower suggestions`
  - [x] Assignments List and Calendar month grid views (`Screens/50–51`), satisfies AC-1
  - [x] Solo assignment detail screen with progress pills, reminders, and personal note (`Screens/52`), satisfies AC-2
  - [x] Follower suggestion from class (`Screens/47–48`), Rep post assignment (`Screens/54`), and Rep review suggestions (`Screens/58`), satisfies AC-3
- [x] Verify it: `/check verify assignments & follower suggestions`
- [x] Test it: `/test assignments & follower suggestions`
      Spec [0009](../specs/0009-assignments-follower-suggestions/index.md) · Plan [11-assignments-follower-suggestions](../../prompts/11-assignments-follower-suggestions.md) · code in `src/app/(tabs)/assignments.tsx`, `src/app/assignment/[id].tsx`, and `src/app/assignment/add.tsx`

## Slice 7: Group assignments & sign up polls

### 11. Group assignments & sign up polls · done

Facilitate course rep group creation with member limits, enabling students to pick groups through interactive polls or reps to tag members by display name.
**Done when:** students can select open groups from a poll, full groups lock at capacity, reps can view unassigned students, and rosters display display names.

- [x] Design it (spec): `/architect group assignments & sign up polls`
- [x] Build it: `/develop group assignments & sign up polls`
  - [x] Group assignment detail with Group 4 roster and switch group deadline (`Screens/53`), satisfies AC-1
  - [x] Interactive group poll with capacity lock indicators (`Screens/55`), satisfies AC-2
  - [x] Rep groups overview and unassigned member tagging into Group 6 (`Screens/56–57`), satisfies AC-3
- [x] Verify it: `/check verify group assignments & sign up polls`
- [x] Test it: `/test group assignments & sign up polls`
      Spec [0010](../specs/0010-group-assignments-polls/index.md) · Plan [12-group-assignments-polls](../../prompts/12-group-assignments-polls.md) · code in `src/app/assignment/[id].tsx` and `src/app/assignment/add.tsx`

## Slice 8: Class management, rollover & offline sync

### 12. Class management, rollover & offline sync · done

Support pause mode during strikes, semester rollovers, ownership transfers, editor permissions, and two way offline data synchronization.
**Done when:** reps can pause classes or roll over semesters, ownership can transfer cleanly, and offline changes synchronize smoothly when internet returns.

- [x] Design it (spec): `/architect class management, rollover & offline sync`
- [x] Build it: `/develop class management, rollover & offline sync`
  - [x] Owner class settings, Members list, Member actions, Change log, and Editor/Ownership invites (`Screens/63–70b`), satisfies AC-1, AC-3
  - [x] Single class cancel/move override sheet (`Screens/40–41`) and Pause class for strikes sheet (`Screens/72`), satisfies AC-2
  - [x] Second semester rollover wizard (`Screens/74–75`) and read only Archived semester (`Screens/76`), satisfies AC-4
- [x] Verify it: `/check verify class management, rollover & offline sync`
- [x] Test it: `/test class management, rollover & offline sync`
      Spec [0011](../specs/0011-class-management-rollover-sync/index.md) · Plan [13-class-management-rollover-sync](../../prompts/13-class-management-rollover-sync.md) · code in `src/app/class-settings/index.tsx` and `src/app/class/[id].tsx`

## Slice 9: Multi calendar Today, Exams, Others & course subscriptions

### 13. Multi calendar Today, Exams, Others & course subscriptions · done

Unify the four student calendars (Classes, Assignments, Exams, and Others such as Gym, Church, and Club) on Today and Calendar views, and support three shared class subscription modes (Main class, Carry over courses, and Elective courses from other departments) with full setting and live override inheritance.
**Done when:** students can filter or combine all four calendars on Today, subscribe to a main class or specific carry over and elective courses with full setting inheritance, and create Exams and Others events.

- [x] Design it (spec): `/architect multi calendar Today, Exams, Others & course subscriptions`
- [x] Build it: `/develop multi calendar Today, Exams, Others & course subscriptions`
  - [x] Multi calendar and subscription store (`classes`, `assignments`, `exams`, `others` + `main`, `carryover`, `elective`), satisfies AC-1
  - [x] Three mode shared class subscription sheet (`Main class`, `Carry over`, `Elective`) with course checklist and full setting inheritance (`src/app/join/[code].tsx`), satisfies AC-2
  - [x] Live calendar and subscription switcher (`src/components/timetable/ClassSwitcherSheet.tsx`), satisfies AC-3
  - [x] Add Exam and Add Others event screen (`src/app/events/add.tsx`), satisfies AC-4
  - [x] Unified Today and Calendar views displaying all four calendars (`src/app/(tabs)/index.tsx`), satisfies AC-5
- [x] Verify it: `/check verify multi calendar Today, Exams, Others & course subscriptions`
- [x] Test it: `/test multi calendar Today, Exams, Others & course subscriptions`
      Spec [0012](../specs/0012-multi-calendar-subscriptions/index.md) · Plan [14-multi-calendar-subscriptions](../../prompts/14-multi-calendar-subscriptions.md) · code in `src/db/seed.ts`, `src/hooks/useTimetable.ts`, `src/app/join/[code].tsx`, `src/components/timetable/ClassSwitcherSheet.tsx`, `src/app/events/add.tsx`, and `src/app/(tabs)/index.tsx`

## Slice 10: Reading timetable & personal study sessions

### 14. Reading timetable & personal study sessions · done

Enable students to schedule recurring or one time personal study sessions linked to courses under the Others calendar, log completed reading blocks, view course reading timetables on Course Detail, and track weekly and semester reading hours in Reports with 100 percent Card and Calendar view parity.
**Done when:** students can create course linked study sessions, see them identically in Card and Calendar views, mark sessions completed, and view reading hour breakdowns per course on Course Detail and Reports.

- [x] Design it (spec): `/architect reading timetable & personal study sessions`
- [x] Build it: `/develop reading timetable & personal study sessions`
  - [x] Course linked Study Session model, seed data, completion toggle, and reading stats hook (`src/db/seed.ts`, `src/hooks/useTimetable.ts`), satisfies AC-1
  - [x] Subscribed course selector and study topic input in Add to Calendar (`src/app/events/add.tsx`), satisfies AC-2
  - [x] Study session completion toggle on Detail and Reading Timetable section on Course Detail (`src/app/class/[id].tsx`, `src/app/course/[id].tsx`), satisfies AC-3, AC-4
  - [x] Dynamic weekly and semester reading hours and per course breakdown in Reports (`src/app/reports/index.tsx`), satisfies AC-5
- [x] Verify it: `/check verify reading timetable & personal study sessions`
- [x] Test it: `/test reading timetable & personal study sessions`
      Spec [0013](../specs/0013-reading-timetable-study-sessions/index.md) · Plan [16-reading-timetable-study-sessions](../../prompts/16-reading-timetable-study-sessions.md) · code in `src/db/seed.ts`, `src/hooks/useTimetable.ts`, `src/app/events/add.tsx`, `src/app/class/[id].tsx`, `src/app/course/[id].tsx`, and `src/app/reports/index.tsx`

## Slice 11: App switcher sidebar & hamburger navigation

### 15. App switcher sidebar & hamburger navigation · done

Provide a hamburger toggled navigation sidebar that animates into view while minimizing and shifting the active main screen to the right like an OS app switcher card, keeping the screen's own theme color against a contrasting sidebar canvas and surfacing every navigation item, calendar filter, subscription, creation action, and setting in one place.
**Done when:** tapping the hamburger button smoothly scales down and shifts the active screen to the right while revealing the full sidebar menu with all app destinations and quick actions.

- [x] Design it (spec): `/architect app switcher sidebar & hamburger navigation`
- [x] Build it: `/develop app switcher sidebar & hamburger navigation`
  - [x] Build `AppSidebarShell`, `useSidebar`, and `HamburgerButton` with 3D app switcher minimize and shift animation (`src/components/navigation/AppSidebarShell.tsx`), satisfies AC-1, AC-2, AC-4
  - [x] Wire `AppSidebarShell` into `src/app/_layout.tsx` and place `HamburgerButton` on Today, Classes, and Assignments headers (`src/app/(tabs)/`), satisfies AC-3
- [x] Verify it: `/check verify app switcher sidebar & hamburger navigation`
- [x] Test it: `/test app switcher sidebar & hamburger navigation`
      Spec [0014](../specs/0014-app-switcher-sidebar-navigation/index.md) · Plan [17-app-switcher-sidebar-navigation](../../prompts/17-app-switcher-sidebar-navigation.md) · code in `src/components/navigation/AppSidebarShell.tsx`, `src/app/_layout.tsx`, and `src/app/(tabs)/`

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.

- Home screen widgets: small and medium Android and iOS widgets for next class and due assignments, scheduled for Release 2 · needs a decision
- Contextual banner ads: non intrusive ad slots at the bottom of lists and reports, scheduled for Release 2 · needs a decision
- Multiple linked sign in accounts: connecting Google, Apple, and email to one student record, scheduled for Release 2 · needs a decision
- Timetable camera OCR import: automatic timetable creation from a photo of a notice board, scheduled for Later · needs a decision
- Natural language typed class entry: fast text entry for classes and venues, scheduled for Later · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State                        | Set by                                                                             | The feature shows                                                                                                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `planned` · needs a decision | `/scope`                                                                           | one box: `Design it (spec): /architect <feature>`                                                                                                                                                                                             |
| `in-progress` (designed)     | `/architect` at spec capture                                                       | `Design it` ticked; spec linked; `Build it: /develop <feature>` + 2 to 5 milestones; the tier closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled                            |
| `in-progress` (building)     | `/develop`                                                                         | milestone sub boxes tick one by one; code pointer filled                                                                                                                                                                                      |
| `in-progress` (verified)     | `/check verify`                                                                    | `Build it` + milestones ticked; `Verify it` ticked                                                                                                                                                                                            |
| `done`                       | you, when you decide it is (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier last stage (`Prototype` to after `/develop`; `Alpha` to after `/check verify`; `Beta`/`GA` to after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec ## Build plan, not here**: the scope carries only the milestone rollup.
- **Status** `planned` to `in-progress` to `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature rigor above or below the project default; no tag inherits the default. It decides the feature check boxes and each skill next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
