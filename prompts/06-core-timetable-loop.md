# 06 · Core Timetable Loop (Slice 1)

Status: done

## Goal

Connect the Today and Classes tabs to live SQLite persistence (with a canonical CSC 300L UNIBEN initial seed), and build the complete Classes views (List with week strip, Month calendar, Day timeline, Class detail, Course detail), Avatar menu sheet, and Onboarding / Setup & Add Course / Add Class flows (`Screens/02`, `07`, `08`, `22–26`, `33`, `35–39`).

## Decisions

- **Local first profile with optional Clerk auth**: Works offline and in Expo Go immediately without blocking on Clerk credentials, while supporting Welcome, Sign in, and Create account screens (`Screens/02`, `07`, `08`).
- **Pre seeded CSC 300L UNIBEN timetable**: On first boot, `src/db/seed.ts` seeds Chioma Okafor's `CSC 300L · UNIBEN` semester, 6 courses, recurring weekly class rules, concrete relocated/attended occurrences, and upcoming assignments into SQLite (and an in memory store on web) so Today and Classes match Screens 27 and 35 out of the box.
- **Full Classes tab flow**: Includes `List | Calendar` segmented control, `Day | Week | Month` sub toggle, interactive 7 day week strip (`Screens/35`), Month calendar grid (`Screens/36`), and Day hour timeline (`Screens/37`).
- **Interactive Class & Course detail screens**: Tapping any class card opens Class detail (`Screens/38`) with recurrence info, check in toggle, personal note, and attendance bar; tapping the course attendance card opens Course detail (`Screens/39`).
- **Full Setup & CRUD forms**: Semester setup (`Screens/22`), Courses list (`Screens/23`), Add Course with 8 color swatches (`Screens/24`), Add Class with multi day pill selector (`Screens/25`), and Setup complete (`Screens/26`) write directly to SQLite and invalidate TanStack Query caches.

## Out of scope

- Camera QR scanning and shared link import previews (Slice 2).
- Under 18 parental consent web flow (Slice 3).
- Background `expo-notifications` scheduling triggers (Slice 4).

## Steps

### 1. Database Seeder & Timetable Query Hooks

Create `src/db/seed.ts` and `src/hooks/useTimetable.ts` to seed the canonical CSC 300L UNIBEN timetable into SQLite on native (with web fallback) and provide TanStack Query hooks for Today, Classes by date/month, Course details, Class details, and CRUD mutations (`useCreateCourse`, `useCreateClassRules`, `useUpdateSemester`, `useSaveClassNote`). Satisfies AC-1, AC-4.

### 2. Classes Tab: List View, Week Strip, Month Grid & Day Timeline

Build `src/app/(tabs)/classes.tsx` matching `Screens/35 Classes.png`, `Screens/36 Classes · month.png`, `Screens/37 Classes · day.png`, and `Screens/42 Classes · empty.png`, with segmented controls, interactive week strip, month calendar grid, day hour grid with red current time line, and quick `+` action to add a class or course. Satisfies AC-5.

### 3. Class Detail & Course Detail Screens

Build `src/app/class/[id].tsx` (`Screens/38 Class detail.png`) and `src/app/course/[id].tsx` (`Screens/39 Course detail.png`), including the `AttendanceBar` component (`86%` green and `68%` red warning state), personal note input, and navigation from Today and Classes cards. Satisfies AC-6.

### 4. Avatar Menu Sheet & Setup / CRUD Flows

Build the Avatar menu bottom sheet (`Screens/33 Avatar menu.png`) and the Setup / CRUD screens (`src/app/setup/welcome.tsx`, `semester.tsx`, `courses.tsx`, `add-course.tsx`, `add-class.tsx`, `complete.tsx` matching Screens `02`, `07`, `08`, `22–26`), wired to SQLite mutations. Satisfies AC-2, AC-3.

### 5. Wire Today Screen & Run Full Verification

Connect `src/app/(tabs)/index.tsx` to `useTimetable`, wire card taps to Class detail and Avatar tap to the Avatar menu sheet, and verify with `npm run check` and `npx expo export -p web`. Satisfies AC-1 through AC-6.

## Verification

- Launch Today tab and confirm all cards render from the live `useTimetable` hook and navigate to Class detail on tap.
- Tap the `CO` avatar to open the Avatar menu sheet (`Screens/33 Avatar menu.png`) and launch the Setup wizard or Add Course / Add Class forms.
- Switch to Classes tab and test List view, 7 day week strip selection, Calendar Month grid (`Screens/36`), and Calendar Day hour grid (`Screens/37`).
- Add a new course (`Screens/24`) and class (`Screens/25`) and verify it appears immediately on Classes and Today.
- Run `npm run check` and `npx expo export -p web` with 0 errors.

## AGENTS.md updates

- Document `src/db/seed.ts` and `src/hooks/useTimetable.ts` as the authoritative data access layer for timetable screens.
- Add `[0004. Core Timetable Loop](docs/specs/0004-core-timetable-loop/index.md)` under Specs & Plans.

## Result

Built the complete Slice 1 Core Timetable Loop:

- Created `src/db/seed.ts` and `src/hooks/useTimetable.ts` seeding the canonical `CSC 300L · UNIBEN` timetable (6 courses, recurring weekly class rules, concrete occurrences, attendance records, and assignments) into SQLite on native and an in-memory store on web, with reactive TanStack Query hooks and mutations (`useCreateCourse`, `useCreateClassRules`, `useUpdateSemester`, `useSaveClassNote`).
- Built `src/app/(tabs)/classes.tsx` matching `Screens/35`, `36`, `37`, and `42` (`List | Calendar` toggle, `Day | Week | Month` sub-toggle, interactive 7-day week strip, Month calendar grid, and Day hour timeline with live red indicator line).
- Built `src/app/(tabs)/assignments.tsx` matching `Screens/50 Assignments.png` (`Due soon | Missing | Done` pills, date section headers, and urgency badges).
- Built `src/app/class/[id].tsx` (`Screens/38 Class detail.png`) and `src/app/course/[id].tsx` (`Screens/39 Course detail.png`) with attendance progress bars (`86%` green and `68%` red threshold alert), check-in switch, and persisted private note input.
- Built `src/components/timetable/AvatarMenuSheet.tsx` (`Screens/33 Avatar menu.png`) and the 6 Setup & CRUD routes (`src/app/setup/welcome.tsx`, `semester.tsx`, `courses.tsx`, `add-course.tsx`, `add-class.tsx`, `complete.tsx` matching Screens `02`, `07`, `08`, `22–26`).
- Wired `src/app/(tabs)/index.tsx` to `useTimetable()`, `AvatarMenuSheet`, and `/class/[id]` navigation, passing `npm run check` and `npx expo export -p web` (18 static routes) with 0 errors.
