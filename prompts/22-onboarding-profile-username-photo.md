# 22 · Onboarding Profile Setup (Username, Photo Upload & App-Wide Identity Integration)

Status: done

## Goal

Allow students during onboarding (`src/app/setup/profile.tsx`) and in Account Settings (`src/app/settings/account.tsx`) to set a unique `@username` and upload or change their profile photo, with their photo, display name, and `@username` integrated consistently across Today, Classes, Assignments, the App Switcher Sidebar, Settings, and Class/Group rosters.

## Decisions

- **Authoritative Student Profile Model (`src/auth/AuthProvider.tsx`, `src/db/schema.ts`, `src/db/seed.ts`)**:
  - Extend `AuthUser` and `Student` (`students` SQLite table, `memoryStore.student`, and Supabase `students` upsert) with `username: string` and `avatarUrl: string | null`.
  - Provide `normalizeUsername(raw)` and `suggestUsernames(displayName, institution)` helpers so usernames are always clean lowercase handles (`a-z`, `0-9`, `_`, `.`, 3–24 chars) with collision detection and one-tap suggestions.
- **Platform-Separated Photo Picker (`src/lib/photoPicker.native.ts`, `src/lib/photoPicker.web.ts`, `src/lib/photoPicker.ts`)**:
  - Follow `AGENTS.md` platform boundary rules so web export (`npx expo export -p web`) never imports native-only modules.
  - On web, open a native `<input type="file" accept="image/*" />` reader converting the selected image to a persistent data URI.
  - On native (iOS/Android), support selecting from device media/camera when available plus a built-in photo/portrait studio sheet so photo selection works reliably in both Expo Go and native dev builds without crashing.
- **Unified `<StudentAvatar />` Component (`src/components/ui/StudentAvatar.tsx`)**:
  - Reusable accessible avatar primitive that displays the uploaded `avatarUrl` `<Image>` when set, or falls back to the student's `initials` badge, with an optional camera badge overlay for interactive upload triggers.
- **Well-Rounded Onboarding Profile Step (`src/app/setup/profile.tsx` · Screens 11–12)**:
  - Upgrade the `"About you"` step with:
    1. **Profile Photo Upload Hero**: Interactive 88px `<StudentAvatar />` with camera badge and `"Upload photo"` / `"Change photo"` sheet (Upload from device, Take photo, Pick a portrait preset, or Remove photo).
    2. **Display Name Input**: Full name shown to course reps and classmates, with collision check and suggestions.
    3. **Username (`@handle`) Input**: `@username` field auto-suggested from the display name (editable by the student), with live format/availability validation and one-tap handle suggestions.
    4. **Live Identity Preview Card**: Shows the live photo/initials, display name, and `@username` badge (`"How you'll appear in groups, polls, and member lists"`).
- **App-Wide Integration**:
  - **Main Tabs (`src/app/(tabs)/index.tsx`, `src/app/(tabs)/classes.tsx`, `src/app/(tabs)/assignments.tsx`)**: Replace initials-only header circles with `<StudentAvatar />` so the uploaded profile photo appears in the 44×44 top-right avatar button on every tab.
  - **App Switcher Sidebar (`src/components/navigation/AppSidebarShell.tsx`)**: Display `<StudentAvatar />`, `displayName`, and `@username` in the sidebar profile header.
  - **Settings & Account (`src/app/settings/index.tsx`, `src/app/settings/account.tsx`)**: Show `<StudentAvatar />` and `@username` on the Settings profile card; wire `"Change photo"` and an editable **Username** field in Account Settings (`Screen 86`) to `updateProfile()`.
  - **Avatar Menu Sheet & Group/Class Rosters (`src/components/timetable/AvatarMenuSheet.tsx`, `src/app/assignment/[id].tsx`, `src/app/share/create.tsx`)**: Reflect the student's live photo, display name, and `@username`.

## Out of scope

- Server-side image transcoding or paid third-party CDN hosting outside local persistence and Supabase student profile sync.

## Steps

### 1. Extend Student Schema, `AuthProvider`, and Platform Photo Picker

Update `src/db/schema.ts`, `src/db/seed.ts`, and `src/auth/AuthProvider.tsx` to store and persist `username` and `avatarUrl` locally (`platformStorage`, `memoryStore`, SQLite `students`) and in Supabase (`students` upsert). Create `src/lib/photoPicker.native.ts`, `src/lib/photoPicker.web.ts`, and `src/lib/photoPicker.ts`, plus `src/components/ui/StudentAvatar.tsx` and `src/components/ui/PhotoPickerSheet.tsx`.

### 2. Upgrade Onboarding Profile Setup (`src/app/setup/profile.tsx`)

Enhance the `"About you"` onboarding step in `src/app/setup/profile.tsx` with the interactive profile photo upload hero (`PhotoPickerSheet`), Display Name input, `@username` input with live validation and smart handle chips, and the live group/member preview card showing photo + display name + `@username`. Persist `displayName`, `username`, `avatarUrl`, and `dateOfBirth` via `updateProfile()`.

### 3. Integrate Profile Photo & `@username` Across Settings, Sidebar, Tabs & Rosters

Update `src/app/settings/account.tsx` (making `"Change photo"` and `@username` fully interactive and persistent), `src/app/settings/index.tsx`, `src/components/navigation/AppSidebarShell.tsx`, `src/app/(tabs)/index.tsx`, `src/app/(tabs)/classes.tsx`, `src/app/(tabs)/assignments.tsx`, `src/components/timetable/AvatarMenuSheet.tsx`, and `src/app/assignment/[id].tsx` to render `<StudentAvatar />` and `@username`.

## Verification

- Run `npm run format && npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check`) with zero errors.
- Run `npx expo export -p web` to confirm all static web routes compile cleanly with platform-separated photo picker files.
- Complete onboarding through `/setup/profile`: upload/select a profile photo, enter a display name and `@username`, continue into the app, and verify the photo and `@username` appear on Today, Classes, Assignments, the App Switcher Sidebar, Settings, and Account Settings.

## AGENTS.md updates

- Under **Who owns what → Authentication**: note that `AuthProvider` (`src/auth/AuthProvider.tsx`) and `<StudentAvatar />` (`src/components/ui/StudentAvatar.tsx`) manage student `displayName`, `@username`, `avatarUrl`, and `initials` across onboarding and all app surfaces, with platform-isolated photo picking (`src/lib/photoPicker.native.ts` / `.web.ts`).

## Result

- Extended `students` (`src/db/schema.ts`, `src/db/client.native.ts`, `src/db/seed.ts`) and `AuthUser` / `AuthProvider` (`src/auth/AuthProvider.tsx`) with `username`, `avatarUrl`, `normalizeUsername()`, and `suggestUsernames()`.
- Built platform-isolated photo selection (`src/lib/photoPicker.native.ts`, `src/lib/photoPicker.web.ts`), live camera capture (`src/components/ui/SelfieCameraView.native.tsx`, `src/components/ui/SelfieCameraView.web.tsx`), `<StudentAvatar />` (`src/components/ui/StudentAvatar.tsx`), and `<PhotoPickerSheet />` (`src/components/ui/PhotoPickerSheet.tsx`) supporting device upload, camera capture, 6 student portrait presets, custom image links, and initials fallback.
- Upgraded the Onboarding Profile Setup step (`src/app/setup/profile.tsx`) with the interactive photo upload hero, Display Name input, `@username` input with live availability/format checks and one-tap handle suggestions, and the live student identity preview card.
- Integrated `<StudentAvatar />` and `@username` across Today (`src/app/(tabs)/index.tsx`), Classes (`src/app/(tabs)/classes.tsx`), Assignments (`src/app/(tabs)/assignments.tsx`), the App Switcher Sidebar (`src/components/navigation/AppSidebarShell.tsx`), Settings (`src/app/settings/index.tsx`), Account Settings (`src/app/settings/account.tsx`), `AvatarMenuSheet` (`src/components/timetable/AvatarMenuSheet.tsx`), and Group Assignment rosters (`src/app/assignment/[id].tsx`).
