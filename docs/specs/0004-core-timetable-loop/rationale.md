# Rationale: 0004. Core timetable loop

## Context

With the stack (0001), core SQLite data model (0002), and Cadence Academy UI foundation (0003) complete and verified, Slice 1 turns the static Today screen into a complete, interactive timetable application. It must work offline first on budget Android devices and iOS Expo Go without requiring live cloud credentials to test or use.

## Options considered

### Option 1: Local first SQLite repository with canonical CSC 300L UNIBEN seed data and optional Clerk auth (Chosen)

- **How it works**: On first boot, `ensureSeeded()` populates SQLite (and an in memory mirror on web) with the CSC 300L UNIBEN semester, 6 courses, recurring weekly class rules, concrete relocated/attended occurrences, and upcoming assignments. All screens read and mutate through TanStack Query hooks (`useTimetable.ts`) that write to SQLite and append to `sync_outbox`. Welcome, Sign in, Semester setup, Add Course, and Add Class screens are reachable both from onboarding and from the Avatar menu / Classes tab.
- **Pros**: Zero friction in Expo Go; preserves the exact Screen 27 and Screen 35 visual state immediately upon opening the app while making every card interactive and every CRUD form persist real data.
- **Cons**: Requires a small seed module (`src/db/seed.ts`).

### Option 2: Empty database on boot requiring mandatory Clerk sign in and manual entry

- **How it works**: Starts on a blank database and blocks access to `(tabs)` until the user authenticates with Clerk and manually creates a semester, courses, and classes.
- **Pros**: Tests cold onboarding first.
- **Cons**: Breaks immediate previewing of the Today and Classes screens and blocks offline or unconfigured environments.

## Rationale

Option 1 was selected by the user because it keeps the app immediately functional and faithful to the design screens on first launch while providing the complete end to end CRUD and navigation loop across Today, Classes, Class Detail, Course Detail, and Setup forms.

## References

- [0001. Stack and Architecture](../0001-stack-architecture.md)
- [0002. Core Data Model](../0002-core-data-model.md)
- [0003. Design System and UI Foundation](../0003-design-system-ui-foundation/index.md)
