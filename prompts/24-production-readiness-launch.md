# 24 · Production Readiness: Live Device Calendar Clock, Dynamic Reports/Check-Ins/Sharing & EAS Release Config

Status: done

## Goal

Replace all pinned design-mockup dates (`2026-11-06`) and remaining static preview data across Today, Classes, Assignments, Reports, Course Details, Pending Check-Ins, and Class Sharing with live device dates and real user data, and add production release configuration (`eas.json`, `app.json` Hermes & Universal Links, and clean `.env.example`).

## Decisions

- **1. Live Device Calendar Clock & Month/Week Generators (`src/lib/dateClock.ts`, `src/hooks/useTimetable.ts`, `src/app/(tabs)/index.tsx`, `src/app/(tabs)/classes.tsx`, `src/app/(tabs)/assignments.tsx`, `src/app/class/[id].tsx`, `src/app/events/add.tsx`, `src/app/setup/add-class.tsx`, `src/components/ui/DateTimePickerModal.tsx`)**:
  - Create `src/lib/dateClock.ts` with pure helpers (`getTodayIsoDate`, `getCurrentTime24`, `formatLongDateHeading`, `formatShortDateLabel`, `buildWeekStripForDate`, `buildMonthGrid`, `addMonths`, `addDays`) anchored to the user's real device clock.
  - Update `useTimetable` (`getOccurrencesForDate`) so `isPast` compares against the real current date and wall-clock `HH:MM` instead of `"2026-11-06"` / `"09:45"`.
  - Update `TodayScreen` (`src/app/(tabs)/index.tsx`), `ClassesScreen` (`src/app/(tabs)/classes.tsx`), and `AssignmentsScreen` (`src/app/(tabs)/assignments.tsx`) so Today's header date, due-soon window, week strip, and interactive month calendar grid (with working previous/next month arrows!) run on real dates.
- **2. Live Attendance Calculations, Pending Check-Ins & Class Sharing (`src/app/course/[id].tsx`, `src/app/reports/index.tsx`, `src/app/check-ins/pending.tsx`, `src/components/timetable/PostClassCheckInSheet.tsx`, `src/app/share/create.tsx`, `src/app/share/qr-card.tsx`, `src/app/class-settings/index.tsx`)**:
  - Compute course and semester attendance percentages, attended/missed/unanswered counts, and recovery targets dynamically from `data.attendanceRecords`, `data.courses`, and `data.classRules` on both `/course/[id]` and `/reports`.
  - Derive `/check-ins/pending` and `<PostClassCheckInSheet />` from real past unanswered class occurrences over the last 7 days (showing the "All caught up" state when none are pending).
  - Pre-fill `/share/create`, `/share/qr-card`, and `/class-settings` from the student's actual `data.student`, `data.semester`, `data.followedSubscriptions`, and `user` identity instead of hardcoded `"CSC 300L · UNIBEN"` / `"Ada Eze"` defaults when user data is present.
- **3. Production Build & Deep-Link Configuration (`eas.json`, `app.json`)**:
  - Add `eas.json` with `development`, `preview`, and `production` profiles (including auto-incrementing build numbers and production environment flags).
  - Update `app.json` to explicitly set `"jsEngine": "hermes"` and configure iOS `associatedDomains` and Android `intentFilters` for `/join/*` and `/consent/*` universal links.
- **4. Clean Environment Template (`.env.example`)**:
  - Strip test API keys from `.env.example`, keeping only the documented environment variable names (`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=`, `EXPO_PUBLIC_CLERK_FRONTEND_API=`, `EXPO_PUBLIC_SUPABASE_URL=`, `EXPO_PUBLIC_SUPABASE_KEY=`) per `AGENTS.md`.

## Out of scope

- App Store Connect / Google Play Console manual store listing uploads (screenshots and store review submission).

## Steps

### 1. Create `src/lib/dateClock.ts` & Switch All Calendar Views to Live Device Dates

- Create `src/lib/dateClock.ts` with `getTodayIsoDate()`, `getCurrentTime24()`, `formatLongDateHeading()`, `formatShortDateLabel()`, `buildWeekStripForDate()`, `buildMonthGrid()`, and `formatMonthYearHeading()`.
- Update `src/hooks/useTimetable.ts`, `src/app/(tabs)/index.tsx`, `src/app/(tabs)/classes.tsx`, `src/app/(tabs)/assignments.tsx`, `src/app/class/[id].tsx`, `src/app/events/add.tsx`, `src/app/setup/add-class.tsx`, and `src/components/ui/DateTimePickerModal.tsx` to use live dates and interactive month/week navigation.

### 2. Wire Live Attendance, Pending Check-Ins, Reports & Class Sharing

- Update `src/app/course/[id].tsx` and `src/app/reports/index.tsx` to compute live attendance percentages and session history from `data.attendanceRecords` and `data.courses` (showing the clean empty state when no courses or classes exist yet).
- Update `src/app/check-ins/pending.tsx` and `src/components/timetable/PostClassCheckInSheet.tsx` to list real unanswered past class occurrences from the last 7 days.
- Update `src/app/share/create.tsx`, `src/app/share/qr-card.tsx`, and `src/app/class-settings/index.tsx` to reflect the student's real institution, semester, courses, and profile.

### 3. Add `eas.json`, Configure `app.json` (Hermes + Universal Links) & Sanitize `.env.example`

- Create `eas.json` for EAS Build & Submit (`development`, `preview`, `production`).
- Add `"jsEngine": "hermes"`, iOS `associatedDomains`, and Android `intentFilters` to `app.json`.
- Remove test credential values from `.env.example`.

## Verification

- Run `npm run format && npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check`) with zero errors.
- Run `npx expo export -p web` to verify all static web routes compile cleanly.
- Verify Today, Classes, Assignments, Reports, Course Details, Pending Check-Ins, and Class Sharing all reflect today's real date and live user data.

## AGENTS.md updates

- Under **Expo & Native Architecture**: note that `eas.json` and `app.json` configure `"jsEngine": "hermes"` and Universal Links / Android App Links for `/join/[code]` and `/consent/[token]`, and `src/lib/dateClock.ts` provides live device calendar date/week/month projections across all timetable screens.

## Result

- Created `src/lib/dateClock.ts` and replaced all pinned `"2026-11-06"` mockup dates and static November 2026 calendar grids across `useTimetable.ts`, `TodayScreen`, `ClassesScreen`, `AssignmentsScreen`, `ClassDetailScreen`, `CourseDetailScreen`, `AddCalendarEventScreen`, `AddClassScreen`, and `DateTimePickerModal` with the live device clock (`getTodayIsoDate`, `getCurrentTime24`, `buildWeekStripForDate`, `buildMonthGrid`, `shiftYearMonth`).
- Replaced hardcoded attendance and session arrays in `CourseDetailScreen`, `ReportsScreen`, `PendingCheckInsScreen`, and `PostClassCheckInSheet` with dynamic calculations derived from `data.attendanceRecords`, `data.courses`, `data.classRules`, and unanswered past occurrences over the last 7 days.
- Bound `CreateSharedClassScreen`, `QrCardScreen`, and `ClassSettingsScreen` to the student's live profile, institution, semester, and courses.
- Created `eas.json` (`development`, `preview`, `production`), configured `"jsEngine": "hermes"`, iOS `associatedDomains`, and Android `intentFilters` in `app.json`, and sanitized `.env.example` to contain only variable names without values.
