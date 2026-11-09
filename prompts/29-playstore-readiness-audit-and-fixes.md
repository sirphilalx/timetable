# 29. Play Store Readiness Audit & End-to-End Flow Hardening

Status: done

## Goal

Ensure TT Student Timetable is all-round tight for Google Play Store launch: zero cross-account data leaks across all persistent storage keys, zero hanging navigation flows (`router.back()` without fallback), and zero prototype/demo artifacts visible to real users.

## Decisions

1. **Per-Account Isolation Across All Persistent Keys**:
   - Scope `tt_in_app_notifications_v1`, `tt_reminder_preferences_v1` (`src/lib/reminders.ts`), and `tt_sync_outbox_v1` (`src/lib/sync.ts`) per `studentId` alongside `tt_timetable_store_v4:<studentId>` (`src/hooks/useTimetable.ts`).
   - Restrict staged anonymous onboarding migration (`SEED_STUDENT_ID`) strictly to brand-new accounts (`memoryStore.courses.length === 0`) and immediately clear the anonymous key after switching accounts or signing out.
2. **Eliminate Hanging Navigation Flows**:
   - Guard every `router.back()` call across all app screens with `router.canGoBack() ? router.back() : router.replace(...)` so deep links, OS notification taps, and post-setup transitions never leave a user stuck on a screen.
   - Anchor `/share/create` on top of `/(tabs)` when launched from `/setup/complete` ("Share with my class").
3. **Remove Prototype Switchers & Hardcoded Demo Fallbacks**:
   - Remove the `44 · Single / 45 · Two classes / 46 · Rep posted` prototype switcher tabs from `<PostClassCheckInSheet />` and compute the end-time label dynamically from `timeRange`.
   - Remove the 3 fake pre-populated student accounts from `<OAuthAccountChooserModal />` so new users go straight to entering their own account email.
   - Remove the default `"Bring the lab manual"` note injection from `useTimetable` and `ClassDetailScreen`.
   - Require the user's own courses in `AddAssignmentScreen` (with an `+ Add a course` empty-state CTA instead of falling back to catalog courses).
   - Persist `attendanceTargetPct` in `ReminderPreferences` (`SettingsAttendanceTargetScreen`, `SettingsScreen`, `ReportsScreen`) and compute below-target warnings from real logged attendance.
   - Require typing `"DELETE"` in `SettingsAccountScreen` before enabling account deletion.

## Verification

- `npm run format`
- `npm run check` (`npx tsc --noEmit`, `npx expo lint`, `prettier --check`)
- `npx expo export -p web`

## Result

Completed full 13-point Play Store readiness audit and resolved all cross-account storage leaks, hanging back-navigation flows, and prototype/demo strings across 25 files.
