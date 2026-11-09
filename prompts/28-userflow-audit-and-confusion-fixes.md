# 28 — End-to-End Userflow & Confusion Fixes

Status: done

## Result

Completed all P0, P1, and P2 userflow and confusion fixes across the app:

- Fixed `hasCompletedOnboarding` hydration and OAuth new-user detection in `src/auth/AuthProvider.tsx`.
- Added `screenOptions={{ headerShown: false }}` and registered all missing screens (`assignment/add`, `assignment/[id]`, `reports/index`, `check-ins/pending`, `class-settings/index`) in `src/app/_layout.tsx`.
- Fixed unauthenticated class joining (`tt_pending_join_v1` in `src/hooks/useTimetable.ts` + `SHARED_CATALOG_COURSES` / `SHARED_CATALOG_RULES` in `src/db/seed.ts`) so previewed subscriptions carry over into the newly created account without polluting unsubscribed accounts.
- Decoupled setup vs. post-setup flows in `src/app/setup/add-course.tsx`, `src/app/setup/add-class.tsx`, and `src/app/setup/courses.tsx` so post-onboarding class creation returns to the caller instead of `/setup/complete`, and onboarding supports scheduling multiple courses before finishing setup.
- Removed exposed prototype mode switchers from `src/app/class/[id].tsx`, `src/app/assignment/[id].tsx`, `src/app/reports/index.tsx`, `src/app/setup/profile.tsx`, and `src/app/join/scan.tsx`, wired live course attendance and check-in preferences on `Class Detail`, added `useDeleteAssignment` with an Assignment Options sheet on `Assignment Detail`, and unified `<ClerkAccountPopover />` + live calendar indicators on `Classes` and `Assignments`.

## Goal

Eliminate all P0, P1, and P2 userflow bugs, premature onboarding bypasses, post-setup flow hijackings, unauthenticated class-join data loss, exposed prototype mode switchers, hardcoded attendance/calendar values, and navigation dead ends identified in the Principal Userflow Audit.

## Decisions

- **Onboarding State Integrity (`src/auth/AuthProvider.tsx`)**:
  - Fix the Clerk session hydration effect so it preserves the actual persisted `hasCompletedOnboarding` state instead of forcing `hasCompletedOnboarding || true`.
  - In `signInWithOAuth`, only mark `hasCompletedOnboarding = true` when signing in to an existing onboarded account; route brand-new OAuth sign-ups through `/setup/profile` (including NDPA age check) and `/setup/semester`.
- **Setup vs. Post-Setup Class & Course Flows (`src/app/setup/add-course.tsx`, `src/app/setup/add-class.tsx`, `src/app/setup/courses.tsx`)**:
  - Decouple first-time setup from post-setup course/class creation using `hasCompletedOnboarding` (and an optional `origin=setup` param).
  - When `hasCompletedOnboarding === true`: saving a class in `/setup/add-class` navigates back to the caller (`router.replace("/course/" + paramCourseId)` if opened from a course, or `router.back()` / `router.replace("/(tabs)")`), never `/setup/complete`.
  - When `!hasCompletedOnboarding` (inside setup): saving a class in `/setup/add-class` offers both **"Save & add another class"** (returning to `/setup/courses` or resetting for the next course) and **"Save & finish setup"** (`/setup/complete`), so students can schedule all their courses before completing onboarding.
- **Unauthenticated "Join My Class" Persistence (`src/app/join/[code].tsx`, `src/app/setup/welcome.tsx`)**:
  - If an unauthenticated student taps **Follow class or courses** on `/join/[code]`, stash the pending join payload (`code`, `mode`, `selectedCourseCodes`) in storage and redirect to `/setup/welcome?mode=signup&next=/join/${code}` _before_ running `subscribeMutation`, or automatically apply the stashed subscription right after authentication switches to the new user's isolated SQLite account, then guide new users through `/setup/profile`.
- **Root Stack Header Hygiene (`src/app/_layout.tsx`)**:
  - Add `screenOptions={{ headerShown: false }}` on the root `<Stack>` and explicitly register `assignment/add`, `assignment/[id]`, `reports/index`, `check-ins/pending`, and `class-settings/index` so native OS headers never stack above custom SafeArea headers.
- **Remove Exposed Prototype Switchers & Demo Artifacts**:
  - `src/app/class/[id].tsx`: Remove the bottom Figma screen switcher pills (`Check in (44)`, `2 classes (45)`, `Rep posted (46)`), wire the **Course Attendance** card to real `data.checkIns` + `data.occurrences` stats, and wire the **Check-in after class** switch to persistent `saveReminderPreferences`.
  - `src/app/join/scan.tsx` & `src/app/join/[code].tsx`: Initialize `codeChars` to empty `["", "", "", "", "", ""]` (with a quick "Try sample code CSC3X9" helper chip instead of pre-filling the input boxes) and only show the catalog switcher when browsing sample codes.
  - `src/app/assignment/[id].tsx`: Replace the top-right `⋯` demo mode cycler with a real Assignment Options modal (**Mark completed / Undo**, **Delete assignment**).
  - `src/app/reports/index.tsx`: Remove the fake `"New semester"` segmented tab; render the empty state naturally when `totalLogged === 0`.
  - `src/app/setup/profile.tsx`: Remove the exposed `18+ Student (2005)` / `Under 18 · Consent flow (2009)` debug buttons from the DOB step.
- **Navigation Context, Course Rep Exit & Header Consistency**:
  - `src/app/share/create.tsx` & `src/components/navigation/AppSidebarShell.tsx`: Add a clear post-creation action (**Go to Class Settings** / **Done · Go to Today**) on `/share/create`, and add **Class Rep settings** in the sidebar under `CLASS TIMETABLES` so Course Reps can always manage their shared class.
  - `src/app/events/add.tsx`: Return to the previous screen (`router.back()` when `router.canGoBack()`) so adding a study session from `/course/[id]` returns to `/course/[id]`.
  - `src/app/(tabs)/classes.tsx` & `src/app/(tabs)/assignments.tsx`: Replace hardcoded `"November 2026"` with dynamic `monthHeading`, wire the Calendar Day red current-time line to live wall-clock time (`useLiveClassProgress`), and open `<ClerkAccountPopover />` when tapping the top-right `<StudentAvatar />` across all main tabs.

## Out of Scope

- Changing database schemas or Supabase RLS policies.
- Redesigning visual tokens or adding new screens outside the existing 38 routes.

## Steps

1. **Fix Auth Onboarding State, Root Stack Headers & Unauthenticated Join Flow (`src/auth/AuthProvider.tsx`, `src/app/_layout.tsx`, `src/app/join/[code].tsx`, `src/app/join/scan.tsx`)**:
   - Fix `hasCompletedOnboarding` hydration and OAuth new-user detection in `AuthProvider.tsx`.
   - Set `screenOptions={{ headerShown: false }}` and declare all missing screens in `src/app/_layout.tsx`.
   - Update `src/app/join/scan.tsx` (empty initial code input with optional sample chip) and `src/app/join/[code].tsx` so unauthenticated users authenticate before/while persisting their class subscription into their own account.
2. **Fix Setup vs. Post-Setup Course & Class Creation Flows (`src/app/setup/add-course.tsx`, `src/app/setup/add-class.tsx`, `src/app/setup/courses.tsx`, `src/app/events/add.tsx`, `src/app/share/create.tsx`)**:
   - Update `/setup/add-course` and `/setup/add-class` to inspect `hasCompletedOnboarding` (and `origin=setup`) so post-setup saves return to the caller instead of `/setup/complete`, and setup saves allow scheduling multiple courses before finishing setup.
   - Update `/events/add` to return via `router.back()` when possible, and give `/share/create` a clean forward exit to `/class-settings` or `/(tabs)`.
3. **Remove Prototype Switchers & Wire Live Data on Detail/Report Screens (`src/app/class/[id].tsx`, `src/app/assignment/[id].tsx`, `src/app/reports/index.tsx`, `src/app/setup/profile.tsx`)**:
   - Remove the `44 / 45 / 46` prototype pills on `src/app/class/[id].tsx` and connect its attendance stats and check-in toggle to real store/preference state.
   - Replace the `⋯` demo mode cycler on `src/app/assignment/[id].tsx` with a real Assignment Actions modal (Mark completed / Delete assignment) using a new `useDeleteAssignment` hook in `src/hooks/useTimetable.ts`.
   - Remove the fake `"New semester"` tab in `src/app/reports/index.tsx` and the debug age preset buttons in `src/app/setup/profile.tsx`.
4. **Unify Tab Headers, Live Calendar Indicators & Sidebar Rep Link (`src/app/(tabs)/classes.tsx`, `src/app/(tabs)/assignments.tsx`, `src/components/navigation/AppSidebarShell.tsx`)**:
   - Replace hardcoded `"November 2026"` and the static `10:00 AM` red time line in `src/app/(tabs)/classes.tsx` with dynamic `monthHeading` and live `useLiveClassProgress`.
   - Wire `<ClerkAccountPopover />` to the top-right `<StudentAvatar />` on `Classes` and `Assignments`.
   - Add a **Class settings** link in `AppSidebarShell.tsx` under `CLASS TIMETABLES` so Course Reps have 1-tap access to `/class-settings`.

## Verification

- `npm run format && npm run check` passes with zero TypeScript or ESLint errors.
- `npx expo export -p web` exports all static routes cleanly.
- Adding a class after onboarding returns to the caller instead of `/setup/complete`.
- Tapping `⋯` on an assignment opens real actions, and `Class Detail` reflects real course attendance and persistent check-in preferences.

## AGENTS.md updates

- Document `useDeleteAssignment` in `useTimetable` and the unified post-setup vs. onboarding routing rules in `AGENTS.md`.
