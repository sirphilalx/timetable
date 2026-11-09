# 10. Post Class Check In & Attendance Tracking

Status: done
Spec: `docs/specs/0008-post-class-check-in-attendance/index.md`

## Goal

Build the post-class check-in bottom sheet (`Screens/44–46`), pending check-ins screen (`Screens/49`), and attendance reports + course attendance drill-down (`Screens/77–79`).

## Decisions

- Store attendance check-in responses in `memoryStore.attendanceRecords` and local SQLite `attendance_records` via `useRecordAttendance()` in `src/hooks/useTimetable.ts`.
- Wire `PostClassCheckInSheet` to Today (`src/app/(tabs)/index.tsx`) and Class Detail (`src/app/class/[id].tsx`).
- Wire `AvatarMenuSheet` (`Reports` and `Pending check-ins`) to `/reports` and `/check-ins/pending`.

## Out of scope

- Group assignment polls (Slice 7).

## Steps

1. Add `useRecordAttendance` and pending check-in state to `src/hooks/useTimetable.ts`.
2. Create `src/components/timetable/PostClassCheckInSheet.tsx` (`Screens/44`, `45`, `46`).
3. Create `src/app/check-ins/pending.tsx` (`Screens/49`).
4. Create `src/app/reports/index.tsx` (`Screens/77`, `78`, `79`).
5. Wire navigation from `AvatarMenuSheet`, `Today`, and `ClassDetail`.

## Verification

- `npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check .`) passes with 0 errors.

## Result

Implemented `PostClassCheckInSheet`, `/check-ins/pending`, and `/reports` with course drill-down and empty state matching `Screens/44–46`, `49`, and `77–79`.
