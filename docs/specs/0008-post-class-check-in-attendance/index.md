# 0008. Post Class Check In & Attendance Tracking

**Status**: approved
**Created**: 2026-11-07
**Parent**: [0001. Stack and Architecture](../0001-stack-architecture.md), [0002. Core Data Model](../0002-core-data-model.md)

## Overview

Implement Slice 5: Post-class check-in bottom sheet (`Screens/44`, `45`, `46`), Pending check-ins queue (`Screens/49`), and Reports / Course attendance drill-down (`Screens/77`, `78`, `79`) wired to local SQLite `attendanceRecords` and `memoryStore`.

## Decisions

1. **Post-Class Check-In Sheet (`src/components/timetable/PostClassCheckInSheet.tsx`)**:
   - Supports three visual modes matching `Screens/44–46`:
     - **Single class (`Screens/44 Check-in.png`)**: Course code pill (`CSC 301`), prompt `"Did you attend CSC 301?"`, subtitle `"Operating Systems · 8:00 – 9:45 am · LT1"`, primary `"Attended"` button (`#4F46E5`), secondary `"Missed"` button, and `"+ Add an assignment from this class"` action link.
     - **Two overlapping classes (`Screens/45 Check-in · two classes.png`)**: `"Which class did you attend?"` with `"10:00 am – 12:00 pm · two on your timetable"`, two option cards (`CSC 301 · Operating Systems · LT1` and `GST 301 · Peace and Conflict · Main Auditorium`), and `"Missed both"` button.
     - **Rep already posted notice (`Screens/46 Check-in · rep already posted.png`)**: Replaces `"+ Add an assignment from this class"` with `"Your rep posted: Scheduling report, due Fri 13 Nov"` when a shared assignment already exists for that class session.
2. **7-Day Pending Check-Ins Queue (`src/app/check-ins/pending.tsx`)**:
   - Matches `Screens/49 Pending check-ins.png` (`"Pending check-ins"`, `"3 left"`, subtitle `"Check-ins stay open for 7 days, then close as Not answered."`).
   - Renders unanswered past classes (`MTH 301 · 5 days left`, `CSC 305 · 4 days left`, `CSC 307 · 3 days left`) with one-tap circular check (`#4F46E5`) and close (`X`) buttons that record `"present"` or `"absent"` into `attendanceRecords`.
3. **Attendance Reports & Course Drill-Down (`src/app/reports/index.tsx`)**:
   - Matches `Screens/77 Reports.png`, `Screens/78 Course attendance · MTH 301.png`, and `Screens/79 Reports · nothing yet.png`.
   - Segmented period toggle (`This week | Semester`), 2x2 summary grid (`Classes so far 118`, `Attendance 89%`, `Assignments 14 of 16`, `Reading 22 h`), `"Attendance by course 6"` cards with progress bars and amber below-target indicator (`MTH 301 · 71% · Need 2 more in a row to reach 75%`), plus interactive drill-down into course attendance history (`Screens/78`) and empty state (`Screens/79`).
