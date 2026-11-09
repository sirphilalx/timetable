# 05 · Today Screen (Screen 27, 28, 29)

Status: done

## Goal

Provide Nigerian university students with their authoritative daily timetable view matching `Screens/27 Today.png`, featuring a live "Next class" hero card with countdown, "Rest of today" lecture timeline with status tags (Attended, Moved, Cancelled), "Due in the next 3 days" assignment highlights, empty states for free days (`Screens/28 Today · nothing on.png`), and a bottom navigation tab bar.

## Decisions

- **Bottom Tab Shell**: Introduce Expo Router tabs layout `(tabs)/_layout.tsx` with 3 core tabs (Today, Classes, Assignments) styled with Cadence Academy active pill indicators (`#E0E7FF` / `#4F46E5`).
- **Hero Next Class Card**: Prominently display the imminent upcoming lecture with a 4px primary left accent stripe, countdown badge (e.g. "in 19 min"), large start time, venue pin, and lecturer credentials.
- **Timeline Statuses**: Support real Nigerian academic scenarios (relocated venue badge with rep attribution, attended check-in status, cancelled lectures).
- **Due Assignments Preview**: Display upcoming deadlines within 3 days directly on the Today screen with urgency pills ("Due today", "Due Friday").
- **Calm Empty State**: When no classes are scheduled for today (weekends or free days), render the calm sun icon illustration and "Nothing on today. Enjoy it." message pointing to the next upcoming lecture day.
- **Design Tokens**: Strict adherence to Cadence Academy tokens (Inter font, 4px spacing scale, WCAG AA contrast, light `#F8FAFC` and dark `#0F172A` themes).

## Out of scope

- Full assignment submission or sign-up poll voting (reserved for Slice 6 & 7).
- Camera QR scanner for joining classes (reserved for Slice 2).
- Notification scheduling background daemon (reserved for Slice 4).

## Steps

### 1. Tab Navigation Shell

- Configure `src/app/(tabs)/_layout.tsx` with tabs for Today, Classes, and Assignments.
- Style tab bar with icons from `lucide-react-native` (CalendarDays, GraduationCap, ClipboardCheck), active pill background, and dark mode support.
- Set up route redirection from root `src/app/index.tsx` to `/(tabs)`.

### 2. Today Timetable Components

- Create `src/components/timetable/TodayHeroCard.tsx` matching `Screens/27 Today.png` hero card.
- Create `src/components/timetable/TodayAssignmentCard.tsx` matching the assignment cards on Today.
- Create `src/components/timetable/TodayEmptyState.tsx` matching `Screens/28 Today · nothing on.png`.

### 3. Screen 27 Assembly

- Assemble `src/app/(tabs)/index.tsx` with:
  - Header: Date string ("Friday 6 November · CSC 300L"), notification bell with unread indicator, and student avatar pill.
  - Next class hero card with live/relative badge.
  - "Rest of today" section with class cards (attended past class, moved venue class).
  - "Due in the next 3 days" section with assignment card and "See all" action.

### 4. Quality & Platform Verification

- Verify `npm run check` (TypeScript typecheck, lint, Prettier).
- Verify `npx expo export -p web` succeeds with 0 native errors.
- Verify light mode and dark mode rendering on mobile and web.

## Verification

- [x] Today screen matches `Screens/27 Today.png` in layout, typography, colors, and iconography.
- [x] Bottom tab bar allows switching between Today, Classes (placeholder), and Assignments (placeholder).
- [x] Empty state toggles cleanly when there are no classes (`Screens/28 Today · nothing on.png`).
- [x] UI renders crisply in both light mode and dark mode.
- [x] `npm run check` passes with 0 errors.

## Result

Built the Today screen and bottom tab navigation shell matching `Screens/27 Today.png`, `Screens/28 Today · nothing on.png`, and `Screens/29 Today · class paused.png`. Verified clean bundling in Metro for both iOS and Web export.

## AGENTS.md updates

None.
