# 0014. App switcher sidebar & hamburger navigation

**Date**: 2026-11-07
**Status**: Accepted

## Summary

This specification defines Slice 11: a global **App Switcher Sidebar** toggled by a top-left **hamburger button**. When opened, the sidebar canvas reveals in a distinct contrasting color (`#1E1B4B` deep indigo / `#0B1120` midnight slate) while the active main screen animates by **minimizing (scaling down to `0.82`)**, **shifting right (`translateX`)**, and rounding its corners (`borderRadius: 28`), mimicking how mobile operating systems minimize an app into an app-switcher card while preserving the active screen's own theme background color and live content. The sidebar contains all navigation routes, calendar filters, class subscriptions, creation actions, and settings so nothing in the app is hidden.

## Requirements

**User stories**:

- As a student on Today, Classes, or Assignments, I want a visible **hamburger button** in the header that toggles a full navigation sidebar open and closed.
- When I tap the hamburger button, I want an animation where the active screen **minimizes and shifts to the right** (like minimizing an app to switch apps), keeping its exact background color and live content, while the sidebar appears on a distinct contrasting background color.
- Inside the sidebar, I want direct one-tap access to **every menu item, calendar filter, subscription mode, creation screen, report, check-in, and setting** so I never have to hunt through hidden bottom sheets.
- When the sidebar is open, I want to be able to tap either the hamburger/close button, any menu item, or the minimized main screen preview card on the right to smoothly restore the screen back to full size (`scale: 1`, `translateX: 0`, `borderRadius: 0`).

**Acceptance criteria**:

- **AC-1**: `SidebarContext` and `AppSidebarShell` (`src/components/navigation/AppSidebarShell.tsx`) wrap the root `Stack` navigator in `src/app/_layout.tsx`, driving a 60fps `Animated.spring` transition between `0` (closed) and `1` (open).
- **AC-2**: When open (`progress = 1`), the outer sidebar container renders a distinct contrasting color (`#1E1B4B` in light mode, `#090D16` / `#1E1B4B` in dark mode), while the inner main screen wrapper animates to `scale: 0.82`, `translateX: ~255px`, and `borderRadius: 28` with elevation shadow, retaining its own exact screen background color (`#F8FAFC` light / `#0F172A` dark) and live rendered content.
- **AC-3**: A `HamburgerButton` (`44x44` minimum touch target) is placed in the top-left header of Today (`src/app/(tabs)/index.tsx`), Classes (`src/app/(tabs)/classes.tsx`), and Assignments (`src/app/(tabs)/assignments.tsx`).
- **AC-4**: The sidebar displays all app sections and actions without hiding items:
  1. **Student Profile Header** (`Chioma Okafor`, `CSC 300L · UNIBEN`, semester badge)
  2. **Main Screens** (`Today`, `Classes & Calendar`, `Assignments`)
  3. **4 Calendars Quick Filter** (`All Calendars`, `1. Classes`, `2. Assignments`, `3. Exams`, `4. Others: Gym, Church, Study`)
  4. **Followed Subscriptions** (`All Followed`, `Main: CSC 300L`, `Carry-over: STA 211`, `Elective: ECO 303`)
  5. **Create & Add** (`Add Class`, `Add Exam or Others`, `Add Study Session`, `Add Assignment`, `Add Course`)
  6. **Sharing & Subscriptions** (`Join / Follow Class (3 Modes)`, `Scan QR Code`, `Share Class Timetable`, `Projector Mode`, `Class Rep Settings`)
  7. **Tracking & Insights** (`Pending Check-ins`, `Attendance & Reading Reports`, `Notifications`)
  8. **Settings & Theme** (`My Courses`, `Reminders & Battery Check`, `Light / Dark Theme Toggle`, `Settings`, `Sign Out`)

## Decision

**Chosen option**: Root-level `AppSidebarShell` wrapping the Expo Router `Stack` inside `src/app/_layout.tsx` using React Native's core `Animated.spring` API (`useNativeDriver: true` for `scale` and `translateX`).

See [rationale.md](rationale.md) for the option comparison and reasoning.

**Implementation skills**: `expo-router` (`.agents/skills/expo-router/`)

## Feature design

**Routes and surfaces**:

| Route / Component                               | Purpose                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `src/components/navigation/AppSidebarShell.tsx` | Context provider (`useSidebar`), hamburger button primitive, full left sidebar menu, and animated 3D screen wrapper |
| `src/app/_layout.tsx`                           | Wraps `Stack` and `DynamicIslandBanner` inside `AppSidebarShell` so the entire active screen minimizes as a unit    |
| `src/app/(tabs)/index.tsx`                      | Adds the top-left `HamburgerButton` to the Today header                                                             |
| `src/app/(tabs)/classes.tsx`                    | Adds the top-left `HamburgerButton` to the Classes & Calendar header                                                |
| `src/app/(tabs)/assignments.tsx`                | Adds the top-left `HamburgerButton` to the Assignments header                                                       |

## Build plan

1. Add `Menu` icon declaration to `src/types/lucide-react-native.d.ts` and build `src/components/navigation/AppSidebarShell.tsx` with `SidebarProvider`, `useSidebar`, `HamburgerButton`, and the spring-animated app-switcher minimize/shift container, satisfies **AC-1**, **AC-2**, **AC-4**.
2. Wrap the root `Stack` in `src/app/_layout.tsx` with `AppSidebarShell`, satisfies **AC-1**, **AC-2**.
3. Add `HamburgerButton` to the headers of `src/app/(tabs)/index.tsx`, `src/app/(tabs)/classes.tsx`, and `src/app/(tabs)/assignments.tsx`, and verify with `npm run format && npm run check`, satisfies **AC-3**.
