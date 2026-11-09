# 0012. Multi calendar Today, Exams, Others & course subscriptions

**Date**: 2026-11-07
**Status**: Accepted

## Summary

This specification defines Slice 9: unified multi calendar support across the four student calendars (**Classes**, **Assignments**, **Exams**, and **Others** such as Gym, Church, and Club) and the three shared class subscription modes (**Main class**, **Carry over courses**, and **Elective courses from other departments**) with full inheritance of course and class settings for subscribers.

## Requirements

**User stories**:

- As a student viewing the Today screen, I want to see all my scheduled items for today across all four calendars (**Classes**, **Assignments**, **Exams**, and **Others** like Gym, Church, or Club) in both Card view (with the live horizontal curtain bar on the ongoing item) and Calendar day view (with side by side collision columns).
- As a student tapping the Today header switcher, I want to filter my view by calendar category (**All calendars**, **Classes**, **Assignments**, **Exams**, **Others**) or by followed class subscription (**All followed classes**, **Main class**, **Carry over courses**, **Elective courses**, or **My own events**).
- As a student joining a shared class link or 6 character code, I want to choose whether I am following the **entire class (Main class)**, picking **Carry over course(s)** from a lower level, or picking **Elective course(s)** from another department, so my timetable only includes the exact courses I take.
- As a student subscribing to a shared class or specific carry over or elective courses, I want all course metadata, per day times, durations, venues, lecturer details, single occurrence move or cancel overrides, assignments, exams, and class pause or break settings to carry on automatically to my timetable.
- As a student managing my full week, I want a dedicated way to add **Exams** (course, date, start time, duration, exam hall, seat or instructions) and **Others** personal events (title, category like Gym, Church, or Club, recurring weekdays or one time date, start time, duration, and location).

**Acceptance criteria**:

- **AC-1**: The data store (`src/db/seed.ts` and `src/hooks/useTimetable.ts`) supports all four calendar categories (`classes`, `assignments`, `exams`, `others`) and three subscription modes (`main`, `carryover`, `elective`), seeding canonical examples for each (`CSC 300L` main class, `STA 211` 200L carry over course, `ECO 303` Economics 300L elective course, upcoming exams, and personal `Others` events such as Gym and Church).
- **AC-2**: On `/join/[code]` (`src/app/join/[code].tsx`), tapping **Follow class** opens a subscription mode sheet with three choices: **Main class (all courses)**, **Carry over course(s) (lower level)**, and **Elective course(s) (other department)**. Choosing Carry over or Elective opens an interactive course checklist so only selected courses are subscribed, while inheriting all course settings, per day schedules, venues, lecturer details, moved or cancelled overrides, assignments, exams, and semester pause or break settings.
- **AC-3**: `ClassSwitcherSheet` (`src/components/timetable/ClassSwitcherSheet.tsx`) provides live filtering across both followed class subscriptions (**All classes**, **Main class · CSC 300L**, **Carry over · STA 211 (200L)**, **Elective · ECO 303 (ECO 300L)**) and calendar types (**All calendars**, **Classes**, **Assignments**, **Exams**, **Others**), plus a quick action to manage subscribed carry over or elective courses.
- **AC-4**: A unified creation flow (`src/app/setup/add-class.tsx` and `src/app/events/add.tsx`) lets students create **Classes**, **Exams**, and **Others** items (Gym, Church, Club, Study, Personal) with per day or one time scheduling, duration picker, and venue or location input, persisting to SQLite and `memoryStore`.
- **AC-5**: The Today screen (`src/app/(tabs)/index.tsx`) and live progress hook (`src/hooks/useLiveClassProgress.ts`) merge today's active **Classes** (main + carry over + elective), **Exams**, **Others**, and due **Assignments** into both **Card view** (Hero card with traveling horizontal curtain bar + cascading compact cards) and **Calendar day view** (proportional duration blocks with side by side overlap columns).

## Decision

**Chosen option**: Unified local first calendar item projection in `useTimetable` combining `courses` + `class_rules` + `class_occurrences`, `assignments`, `exams`, and `personal_events` (`others`), paired with subscription records (`followedSubscriptions`) that filter imported shared courses by subscription mode (`main` | `carryover` | `elective`) while preserving 100 percent of upstream course and occurrence metadata.

See [rationale.md](rationale.md) for the option comparison and reasoning.

**Implementation skills**: `expo-router` (`.agents/skills/expo-router/`), `supabase` (`.agents/skills/supabase/`)

## Feature design

**Routes and surfaces**:

| Route / Component                                 | Purpose                                                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(tabs)/index.tsx`                        | Unified Today screen displaying all four calendars (Classes, Assignments, Exams, Others) in Card view and Calendar day view                  |
| `src/components/timetable/ClassSwitcherSheet.tsx` | Bottom sheet to filter by followed subscription (All, Main, Carry over, Elective, Personal) and calendar category (All, Classes, Exams, etc) |
| `src/app/join/[code].tsx`                         | Shared class preview and 3 mode subscription sheet (Main class, Carry over checklist, Elective checklist) with duplicate clash resolution    |
| `src/app/events/add.tsx`                          | Creation screen for **Exams** (course, date, time, duration, venue, instructions) and **Others** (Gym, Church, Club, recurring or one time)  |
| `src/hooks/useTimetable.ts`                       | Central data hook projecting Classes, Assignments, Exams, and Others for any date and active calendar/subscription filter                    |
| `src/db/seed.ts`                                  | Canonical seed data for CSC 300L (Main), STA 211 (200L Carry over), ECO 303 (ECO 300L Elective), Exams, and Others (Gym, Church)             |

**Data flow and value sourcing**:

| Action / Render               | Value produced or displayed                                          | Source                                                                                                                             |
| ----------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Today unified schedule        | Ongoing/Next Hero item, compact cards, Calendar day blocks           | `getOccurrencesForDate(date, filters)` in `src/hooks/useTimetable.ts` merging Classes, Exams, Others, and due today Assignments    |
| Subscription mode selection   | Subscribed group record (`main`, `carryover`, `elective`) + courses  | `useSubscribeToSharedClass()` in `src/hooks/useTimetable.ts` copying shared catalog courses, rules, overrides, exams, and settings |
| Switcher filter change        | Filtered Today cards, Calendar blocks, and header subtitle           | `activeCalendarFilter` and `activeSubscriptionFilter` state stored in `memoryStore` and exposed via `useTimetable()`               |
| Create Exam or Others event   | New exam or personal event row persisted locally                     | `useCreateExam()` and `useCreatePersonalEvent()` mutations in `src/hooks/useTimetable.ts` invalidating `['timetable']`             |
| Card source attribution badge | `"From STA 211 carryover · 200L"` or `"From ECO 303 elective · ECO"` | Derived from the course's `subscriptionMode` and `sharedGroupLabel` on the `Course` / `FollowedSubscription` record                |

**Key invariants**:

- Subscribing to a Carry over or Elective course from a shared class carries over every setting from the source class and course: lecturer name and contact, credit units, color, per day start and end times, durations, venues, single date moved or cancelled overrides, course assignments, course exams, and semester pause or break states.
- Unchecked courses in a Carry over or Elective shared class remain unsubscribed so the student's Today screen, Calendar day view, and local reminders are never cluttered with unrelated courses from that other level or department.
- All four calendar types render in both Card view (cascading hierarchy: Time, Pill + Title, Venue) and Calendar day view (proportional duration height, side by side overlap columns, and horizontal curtain bar on ongoing items).

## Build plan

1. Extend `src/db/seed.ts` and `src/hooks/useTimetable.ts` with data models, canonical seed data, and mutations for the four calendars (`classes`, `assignments`, `exams`, `others`) and three subscription modes (`main`, `carryover`, `elective`) with full course and class setting inheritance, satisfies **AC-1**.
2. Upgrade `src/app/join/[code].tsx` with the 3 option subscription sheet (**Main class**, **Carry over courses**, **Elective courses from other department**), interactive course checklist for carry over and elective selection, and full inheritance of schedules, venues, overrides, and assignments, satisfies **AC-2**.
3. Upgrade `src/components/timetable/ClassSwitcherSheet.tsx` to support live filtering across the 4 calendars (**All**, **Classes**, **Assignments**, **Exams**, **Others**) and followed subscriptions (**All classes**, **Main class**, **Carry over**, **Elective**, **Others / Personal**), plus editing subscribed courses, satisfies **AC-3**.
4. Create `src/app/events/add.tsx` (and link from Today, Classes, and Add Class) so students can add **Exams** and **Others** items (Gym, Church, Club, etc.) with recurring days or one time dates, duration pills, and venues, satisfies **AC-4**.
5. Wire `src/app/(tabs)/index.tsx`, `src/app/(tabs)/classes.tsx`, and `src/hooks/useLiveClassProgress.ts` so Today and Calendar views display all 4 calendars and respect the active switcher filters, and verify with `npm run check` and `npx expo export -p web`, satisfies **AC-5**.

## Consequences

**Positive**:

- Students can manage their entire day (lectures, carry overs, electives from other departments, assignments, exams, church, gym, and clubs) in one calm Today view without duplicate timetables.
- Carry over and elective subscribers receive live rep updates (venue changes, cancellations, new assignments, exam dates) for only the specific courses they selected.

**Negative / tradeoffs**:

- Merging four item types into `getOccurrencesForDate` requires a shared `calendarKind` discriminator (`"class" | "assignment" | "exam" | "other"`) on `EnrichedClassItem` so cards and detail routes can render appropriate badges and actions.

## Follow-up

- [ ] Sync custom `others` personal events to optional cloud backup when signed in.

## Rationale

See [rationale.md](rationale.md).
