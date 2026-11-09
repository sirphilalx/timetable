# 13. Class Management, Rollover & Offline Sync

Status: done
Spec: `docs/specs/0011-class-management-rollover-sync/index.md`

## Goal

Build the Class Settings & Governance suite (`Screens/63–76`), Cancel/Move single class sheet (`Screens/40–41`), and Today state banners + check-in integration (`Screens/28–31`, `44–46`, `73`).

## Steps

1. Create `src/app/class-settings/index.tsx` covering Owner Settings (`Screens/63`), Members (`Screens/64–66`), Change Log (`Screens/68`), Editor/Owner Invites (`Screens/69–70`), Pause Class (`Screens/72`), Rollover (`Screens/74–75`), and Archived Semester (`Screens/76`).
2. Update `src/app/class/[id].tsx` with `"Change Fri 6 Nov only"` bottom sheet (`Screens/40–41`) and `PostClassCheckInSheet` trigger.
3. Update `src/components/timetable/AvatarMenuSheet.tsx` and `src/components/timetable/ClassSwitcherSheet.tsx` to link directly to `/class-settings`, `/reports`, and `/check-ins/pending`.
4. Update `src/app/(tabs)/index.tsx` to wire `/notifications`, `ClassSwitcherSheet`, `PostClassCheckInSheet`, and status banners (`Paused`, `Offline`, `Semester ended`).

## Result

Implemented `src/app/class-settings/index.tsx`, single-occurrence Cancel/Move override sheet in `src/app/class/[id].tsx`, and Today banner/sheet wiring in `src/app/(tabs)/index.tsx`.
