# 07 · Class Sharing & Import (Slice 2)

Status: done

## Goal

Build the complete class sharing and import flow (`Screens/03–06`, `16`, `19–21`, `34`, `59–62`) allowing course reps to create and share timetables via 6 character codes, QR cards, and projector mode, and allowing classmates to scan/type codes, preview classes, resolve course clashes, and switch between followed classes.

## Steps

### 1. QR Matrix, Share Sheet & Class Switcher Sheet

Create `src/components/timetable/QrMatrix.tsx`, `src/components/timetable/ShareClassSheet.tsx` (`Screens/60`), and `src/components/timetable/ClassSwitcherSheet.tsx` (`Screens/34`).

### 2. Rep Share Flows (Create Shared Class, QR Card & Projector Mode)

Create `src/app/share/create.tsx` (`Screens/59`), `src/app/share/qr-card.tsx` (`Screens/61`), and `src/app/share/projector.tsx` (`Screens/62`).

### 3. Classmate Join, Scanner, Preview & Clash Resolution

Create `src/app/join/scan.tsx` (`Screens/19–21`) and upgrade `src/app/join/[code].tsx` (`Screens/03–06`, `16`) with state toggles for Invited, Already Following, Invalid Link, and Course Clash resolution sheet.

### 4. Wire Navigation & Verify

Register new routes in `src/app/_layout.tsx`, connect Today header subtitle to `ClassSwitcherSheet`, connect `AvatarMenuSheet` and `SetupCompleteScreen` to `/join/scan` and `/share/create`, and run `npm run check` and `npx expo export -p web`.
