# 27. Human-Centered Design (HCD) Navigation, Filter & Menu Simplification

Status: done
Spec: docs/specs/0014-app-switcher-sidebar-navigation/index.md, docs/specs/0012-multi-calendar-subscriptions/index.md

## Goal

Eliminate navigation bloat and decision paralysis across the app by reducing the 27-item sidebar drawer (`AppSidebarShell.tsx`) to 7 clear navigation destinations, moving Calendar category filters (`All · Classes · Assignments · Exams · Others`) and a contextual `+ Quick Add` sheet directly onto the Today and Classes screens, and deduplicating Settings (`src/app/settings/index.tsx`).

## Decisions

- **Streamlined Sidebar (`src/components/navigation/AppSidebarShell.tsx`)**:
  - **Profile Header**: Student avatar + display name + `@username` (tapping opens `ClerkAccountPopover` for account/session switching and sign-out) + Close `X` button (removing the duplicate top red logout icon).
  - **Section 1 — Navigation (`NAVIGATION`, 5 items)**:
    1. `Today` (`/(tabs)`)
    2. `Classes & Calendar` (`/(tabs)/classes`)
    3. `Assignments` (`/(tabs)/assignments`)
    4. `My courses` (`/settings/courses`)
    5. `Attendance & reports` (`/reports`)
  - **Section 2 — Class Timetables (`CLASS TIMETABLES`)**:
    - Shows subscribed shared classes when the student follows 1+ classes (`All classes` + each followed subscription), plus two focused actions:
      - `Join a class` (`/join/scan` — which includes both QR camera scanning and manual code input)
      - `Share timetable` (`/share/create` — which links to QR Card and Projector Mode)
  - **Footer**:
    - `Settings` (`/settings`) and a compact inline `Light` / `Dark` theme toggle button.
- **Inline Calendar Filter Pills + Contextual `+ Quick Add` Sheet (`src/components/timetable/QuickAddSheet.tsx`, `src/app/(tabs)/index.tsx`, `src/app/(tabs)/classes.tsx`)**:
  - Move the 5 calendar filters (`All`, `Classes`, `Assignments`, `Exams`, `Others`) out of the sidebar and onto a clean horizontal pill bar on Today and Classes so students can filter what they are looking at without opening a menu.
  - Add a `+ Add` button on Today and Classes that opens a clean `<QuickAddSheet />` bottom sheet with 4 clear creation choices:
    1. **Add course** (`/setup/add-course`)
    2. **Add class slot** (`/setup/add-class`)
    3. **Add assignment** (`/assignment/add`)
    4. **Add exam, study session, or personal event** (`/events/add`)
- **Deduplicated Settings (`src/app/settings/index.tsx`) & Share Flow (`src/app/share/qr-card.tsx` / `src/app/share/create.tsx`)**:
  - Merge the duplicate `Reminders` and `Notification style` rows in `src/app/settings/index.tsx` into a single **Reminders & notifications** row (`/settings/reminders`).
  - Add **Shared classes & subscriptions** (`/class-settings`) under the **Timetable** section in Settings.
  - Add a direct **Projector mode** button inside `src/app/share/create.tsx` so course reps can open full-screen projector display where they actually share their class code.
  - Add a **Pending check-ins** shortcut card inside `src/app/reports/index.tsx` so students checking their attendance reports can log any pending check-ins right from the same screen.

## Out of scope

- Removing any underlying screens or routes (`/join/[code]`, `/share/projector`, `/check-ins/pending`, `/settings/reminder-check` all remain intact and reachable in context).

## Steps

1. **Create `<QuickAddSheet />` & `<CalendarFilterBar />` (`src/components/timetable/QuickAddSheet.tsx`)**:
   - Build a reusable horizontal calendar filter chip bar and a clean bottom sheet for contextual creation (`Add course`, `Add class time`, `Add assignment`, `Add exam / study / personal event`).
2. **Streamline `AppSidebarShell.tsx` (`src/components/navigation/AppSidebarShell.tsx`)**:
   - Replace the 6-section, 27-item menu with the focused 5-item `NAVIGATION` list, `CLASS TIMETABLES` (`Join a class`, `Share timetable`, plus any subscribed classes), and `Settings` + theme toggle footer.
3. **Wire Inline Filters & `+ Add` on Today (`src/app/(tabs)/index.tsx`) and Classes (`src/app/(tabs)/classes.tsx`)**:
   - Add `<CalendarFilterBar />` and the `+ Add` trigger button + `<QuickAddSheet />` on Today and Classes.
4. **Deduplicate Settings (`src/app/settings/index.tsx`) and Connect Contextual Links (`src/app/share/create.tsx`, `src/app/reports/index.tsx`)**:
   - Merge the duplicate `/settings/reminders` entry in Settings, add `Shared classes & subscriptions` (`/class-settings`) to Settings, add `Projector mode` button in `src/app/share/create.tsx`, and surface `Pending check-ins` in `src/app/reports/index.tsx`.
5. **Verify**:
   - Run `npm run format && npm run check && npx expo export -p web`.

## Verification

- [x] `npm run check` passes (`tsc --noEmit`, `expo lint`, `prettier --check`).
- [x] `npx expo export -p web` succeeds with zero errors.
- [x] Sidebar shows a clean, low-cognitive-load menu (~7 items) without duplicate Create/Sharing/More items.
- [x] Calendar filters (`All · Classes · Assignments · Exams · Study & Others`) and `+ Add` work directly on Today and Classes.
- [x] Settings has no duplicate `/settings/reminders` row and includes Shared classes management.

## Result

Streamlined `AppSidebarShell.tsx` from 27+ items down to 5 core navigation destinations (`Today`, `Classes & Calendar`, `Assignments`, `My courses`, `Attendance & reports`), dynamic `CLASS TIMETABLES` (`Join a class`, `Share timetable`), and a compact `Settings` + theme toggle footer. Added inline `<CalendarFilterBar />` and `<QuickAddSheet />` (`src/components/timetable/QuickAddSheet.tsx`) to Today and Classes, and deduplicated Settings (`src/app/settings/index.tsx`).

## AGENTS.md updates

- Update the Styling & Design System / Navigation summary in `AGENTS.md` to reflect the streamlined HCD sidebar, inline `<CalendarFilterBar />`, and `<QuickAddSheet />`.
