# 17 · App switcher sidebar & hamburger navigation

Status: done

## Goal

Add a hamburger-toggled sidebar that animates into view while minimizing and shifting the active main screen to the right (mimicking an OS app-switcher card), using a contrasting color for the sidebar while keeping the minimized screen's own color, and surfacing all navigation, calendar, subscription, creation, and settings items in one place.

## Decisions

- Wrap the root `Stack` navigator in `src/app/_layout.tsx` inside `AppSidebarShell` (`src/components/navigation/AppSidebarShell.tsx`) so whichever screen is on display minimizes (`scale: 0.82`) and shifts right (`translateX: ~68%` width) with rounded corners (`borderRadius: 28`).
- Give the sidebar a distinct contrasting background color (`#1E1B4B` deep indigo) while the minimized screen container retains its exact light (`#F8FAFC`) or dark (`#0F172A`) background color.
- Tapping the minimized screen preview on the right (or the close/hamburger button) smoothly animates the screen back to full size.
- Surface every route, 4-calendar filter, 3-mode subscription filter, creation screen, check-in, report, and theme toggle inside the scrollable sidebar so nothing is hidden.

## Out of scope

- Removing existing bottom tabs or sheets (they continue to work alongside the new sidebar).

## Steps

### 1. Build `AppSidebarShell`, `useSidebar`, and `HamburgerButton`

Add `Menu` to `src/types/lucide-react-native.d.ts` and create `src/components/navigation/AppSidebarShell.tsx` providing:

- `useSidebar()` hook (`isOpen`, `openSidebar`, `closeSidebar`, `toggleSidebar`)
- `HamburgerButton` component (`44x44` touch target)
- Full scrollable sidebar with all app sections (Main Views, 4 Calendars, Followed Subscriptions, Create & Add, Sharing & QR, Check-ins & Reports, Settings & Theme toggle)
- `Animated.spring` app-switcher card transformation (`scale`, `translateX`, `borderRadius`, and tap-to-restore overlay on the minimized screen).

### 2. Wire `AppSidebarShell` into `src/app/_layout.tsx` and Hamburger into Tab Headers

Wrap `<Stack />` in `src/app/_layout.tsx` with `<AppSidebarShell>` and place `<HamburgerButton />` in the top-left headers of `src/app/(tabs)/index.tsx`, `src/app/(tabs)/classes.tsx`, and `src/app/(tabs)/assignments.tsx`.

## Verification

- Tap the hamburger icon on Today, Classes, or Assignments and verify the sidebar animates in with its distinct deep indigo background while the active screen minimizes (`scale: 0.82`) and shifts to the right while keeping its own background color.
- Tap any menu item or calendar filter in the sidebar and verify it navigates/filters and smoothly restores the screen.
- Tap the minimized screen preview on the right and verify it restores back to full screen.
- Run `npm run format && npm run check` with 0 errors.

## AGENTS.md updates

- Add Spec `0014` (App Switcher Sidebar & Hamburger Navigation) to `AGENTS.md`.

## Result

- Created `src/components/navigation/AppSidebarShell.tsx` with `SidebarProvider`, `useSidebar()`, `HamburgerButton`, and a spring-animated app-switcher container that minimizes the active main screen (`scale: 0.82`), shifts it right (`translateX`), and rounds its corners (`borderRadius: 28`) while preserving its exact background color against a deep indigo (`#1E1B4B`) sidebar canvas.
- Surfaced all app destinations, 4-calendar filters, followed subscriptions, creation flows, QR/sharing tools, check-ins, reports, and theme toggle inside the scrollable sidebar.
- Wrapped the root `Stack` navigator in `src/app/_layout.tsx` with `AppSidebarShell` and placed `HamburgerButton` in the top-left headers of `src/app/(tabs)/index.tsx`, `src/app/(tabs)/classes.tsx`, and `src/app/(tabs)/assignments.tsx`.
