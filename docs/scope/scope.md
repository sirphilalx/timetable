# Scope: TT Student Timetable

A calm mobile timetable app for Nigerian university students to manage classes, reminders, check ins, and assignments through shared course links.

**Build approach:** Tracer Bullet (vertical slices where each feature connects every layer end to end).
**Workflow:** Beta (after develop, run check verify then test). The project default level of rigor. /architect is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. · GA) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| #   | Feature                                     | Phase      | Status      |
| --- | ------------------------------------------- | ---------- | ----------- |
| 1   | Stack & architecture                        | Foundation | done        |
| 2   | Coding standards & tooling                  | Foundation | done        |
| 3   | Core data model                             | Foundation | in-progress |
| 4   | Design system & UI foundation               | Foundation | planned     |
| 5   | Core timetable loop                         | Slice 1    | planned     |
| 6   | Class sharing & import                      | Slice 2    | planned     |
| 7   | Parental consent web companion              | Slice 3    | planned     |
| 8   | Local class reminders & reliable scheduling | Slice 4    | planned     |
| 9   | Post class check in & attendance tracking   | Slice 5    | planned     |
| 10  | Assignments & follower suggestions          | Slice 6    | planned     |
| 11  | Group assignments & sign up polls           | Slice 7    | planned     |
| 12  | Class management, rollover & offline sync   | Slice 8    | planned     |

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

### 3. Core data model · in-progress

Define local SQLite schemas and remote entities for students, semesters, courses, class schedules, assignments, memberships, and sync state.
**Done when:** schema definitions and migrations support both device storage and cloud sync without breaking changes.

- [x] Design it (spec): `/architect core data model`
- [x] Build it: `/develop core data model`
  - [x] Local SQLite Drizzle schema and native migration runner, satisfies AC-1, AC-2, AC-3, AC-11
  - [x] Domain logic for virtual recurrence, attendance 7 day expiry, and assignment progress, satisfies AC-4, AC-5, AC-6, AC-7
  - [x] Offline sync outbox queue with dead letter transitions and Last Write Wins comparator, satisfies AC-8, AC-9
  - [x] Remote Supabase PostgreSQL schema migrations and Row Level Security policies, satisfies AC-2, AC-10
- [ ] Verify it: `/check verify core data model`
- [ ] Test it: `/test core data model`
      Spec [0002](../specs/0002-core-data-model.md) · code in `src/db/` and `src/lib/`

### 4. Design system & UI foundation · needs a decision

Establish design tokens, typography, dark and light theme styles, and core user interface components adapted from Cadence Academy.
**Done when:** base components render consistently across light and dark themes and meet accessibility color contrast standards.

- [ ] Design it (spec): `/architect design system & UI foundation`

## Slice 1: Core timetable loop

### 5. Core timetable loop · needs a decision

Complete the walking skeleton with user sign in, manual semester and course setup, recurring class entry, and viewing on Today and Classes lists.
**Done when:** a student can sign in, enter semester courses and weekly classes, and see them correctly displayed on the Today screen.

- [ ] Design it (spec): `/architect core timetable loop`

## Slice 2: Class sharing & import

### 6. Class sharing & import · needs a decision

Allow course reps to share a class via unique links, short codes, and QR cards, letting classmates preview and follow with one tap.
**Done when:** an unauthenticated student can view an import preview from a shared link or QR scan, follow the class, and merge courses without duplicate clashes.

- [ ] Design it (spec): `/architect class sharing & import`

## Slice 3: Parental consent web companion

### 7. Parental consent web companion · needs a decision · GA

Provide age verification during sign up and a web approval page for parents or guardians of students under 18 in compliance with the Nigeria Data Protection Act.
**Done when:** students under 18 trigger a guardian consent notice, external parents can approve or decline on the web, and unapproved accounts stay restricted to previews.

- [ ] Design it (spec): `/architect parental consent web companion`

## Slice 4: Local class reminders & reliable scheduling

### 8. Local class reminders & reliable scheduling · needs a decision

Schedule reliable local notifications before class starts, handling Android exact alarms, battery optimization guidance, and reminder setup checks.
**Done when:** reminders trigger on time offline across test devices, leading with class venue, and reschedule cleanly when timetable entries change.

- [ ] Design it (spec): `/architect local class reminders & reliable scheduling`

## Slice 5: Post class check in & attendance tracking

### 9. Post class check in & attendance tracking · needs a decision

Prompt students with a post lecture check in to record attendance or add an assignment, tracking semester attendance percentages against a 75 percent target.
**Done when:** students can log attendance from notifications or pending lists, unknown check ins expire after 7 days, and attendance reports show course percentages.

- [ ] Design it (spec): `/architect post class check in & attendance tracking`

## Slice 6: Assignments & follower suggestions

### 10. Assignments & follower suggestions · needs a decision

Manage solo assignments by due date, allowing followers to suggest assignments from check ins and course reps to review, approve, or reject suggestions.
**Done when:** assignments display in Due soon, Missing, and Done lists with date markers, and approved suggestions broadcast while rejected ones remain personal.

- [ ] Design it (spec): `/architect assignments & follower suggestions`

## Slice 7: Group assignments & sign up polls

### 11. Group assignments & sign up polls · needs a decision

Facilitate course rep group creation with member limits, enabling students to pick groups through interactive polls or reps to tag members by display name.
**Done when:** students can select open groups from a poll, full groups lock at capacity, reps can view unassigned students, and rosters display display names.

- [ ] Design it (spec): `/architect group assignments & sign up polls`

## Slice 8: Class management, rollover & offline sync

### 12. Class management, rollover & offline sync · needs a decision

Support pause mode during strikes, semester rollovers, ownership transfers, editor permissions, and two way offline data synchronization.
**Done when:** reps can pause classes or roll over semesters, ownership can transfer cleanly, and offline changes synchronize smoothly when internet returns.

- [ ] Design it (spec): `/architect class management, rollover & offline sync`

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.

- Reading timetable and study sessions: personal reading sessions linked to courses, scheduled for Release 2 · needs a decision
- Exam timetable with countdowns: exam dates, venues, paper types, and reminders, scheduled for Release 2 · needs a decision
- Others private events tab: personal events such as church or gym that are never shared, scheduled for Release 2 · needs a decision
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
