# 0007. Local class reminders & reliable scheduling

**Date**: 2026-11-07
**Status**: Accepted

## Summary

This specification defines Slice 4 (Local class reminders & reliable scheduling): local wall clock notification payload formatting (leading with course code and venue, e.g. `CSC 301 in 30 min, LT1`), Android exact alarm and Tecno/Infinix/Itel/Samsung battery optimization diagnostics (`Screens/83`), reminder preferences (`Screens/17`, `82`), the Notifications inbox (`Screens/32`), and the complete Settings suite (`Screens/80–88`).

## Requirements

**Acceptance criteria**:

- **AC-1**: `src/lib/reminders.ts` formats local wall clock class reminders leading with the course code, lead time, and venue (`CSC 301 in 30 min, LT1`) and computes trigger timestamps in local wall clock time with timezone offsets while respecting quiet hours (`10:00 pm – 6:00 am`).
- **AC-2**: `src/app/settings/reminders.tsx` (`Screens/17`, `82`) allows toggling `30 min | 1 hour` lead time, `Classes`, `Assignments due`, `Moves and cancellations`, `Morning summary`, and `Quiet hours`, plus previewing the onboarding reminder card (`CSC 301 in 30 min, LT1`).
- **AC-3**: `src/app/settings/reminder-check.tsx` (`Screens/83 Reminder setup check.png`) surfaces 4 diagnostic rows (`Notifications allowed`, `Alarms and reminders`, `Battery saver for TT` for Tecno/Infinix devices with one tap `Fix`, and `Do not disturb`) and a `Send a test reminder` verification action.
- **AC-4**: `src/app/notifications.tsx` (`Screens/32 Notifications.png`) displays Today and Earlier this week activity items (relocations, follower assignment suggestions, and editor invites) and links directly to their action screens.
- **AC-5**: `src/app/settings/index.tsx` (`Screens/80`), `courses.tsx` (`Screens/81`), `check-ins.tsx` (`Screens/84`), `attendance-target.tsx` (`Screens/85`), and `account.tsx` (`Screens/86–88`) provide full timetable, theme (`Light | Dark | System`), attendance target (`70% | 75% | 80% | Custom`), and account handover/deletion management.

## Decision

**Chosen option**: Platform safe wall clock reminder engine in `src/lib/reminders.ts` coupled with interactive diagnostic & settings routes under `src/app/settings/*` and `src/app/notifications.tsx`.

See [rationale.md](rationale.md) and [verify.md](verify.md).
