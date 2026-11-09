# 30 · PostHog Product Analytics & Telemetry

Status: done

## Goal

Integrate PostHog EU Cloud (`https://eu.i.posthog.com`) across mobile and web to track automatic Expo Router screen views (`$screen`), onboarding funnels, core timetable actions (courses, classes, shared class joins/shares, attendance check-ins, assignments), and privacy-safe student identity with an in-app opt-out toggle and NDPA 2023 under-18 protection.

## Decisions

- **PostHog EU Cloud**: Default host `https://eu.i.posthog.com` configured via `EXPO_PUBLIC_POSTHOG_HOST` and project API key via `EXPO_PUBLIC_POSTHOG_API_KEY` in `.env` and `.env.example`.
- **Cross-platform & Offline-resilient Client (`src/lib/analytics.ts`)**: Uses `posthog-react-native` with `platformStorage` persistence and graceful no-op fallback when `EXPO_PUBLIC_POSTHOG_API_KEY` is not yet set or when running static web export (`npx expo export -p web`).
- **Automatic Screen Tracking**: Tracks every Expo Router route transition (`$screen`) with normalized route templates (e.g., `/class/[id]`, `/course/[id]`, `/join/[code]`) and active theme/auth metadata in `src/app/_layout.tsx`.
- **Full Product Funnel & Action Events**:
  - Auth & Onboarding: `auth_signed_in`, `auth_signed_up`, `auth_signed_out`, `onboarding_step_completed`, `onboarding_completed`.
  - Courses & Timetable: `course_created`, `course_deleted`, `class_rule_created`, `event_created` (exam/study/other).
  - Shared Classes: `shared_class_created`, `shared_class_joined`, `shared_class_link_copied`, `shared_class_whatsapp_shared`.
  - Attendance & Assignments: `attendance_checked_in`, `assignment_created`, `assignment_status_toggled`.
  - Preferences: `theme_changed`, `analytics_opt_out_changed`.
- **NDPA 2023 & Privacy Controls**: Never attach personal traits (email, name, username) for under-18 students without verified parental consent (`isUnder18 && !parentConsentGranted`). Include an "Usage analytics" opt-out toggle in `/privacy` and Settings (`tt_analytics_opt_out_v1`) and update the Privacy Policy disclosure in `src/app/privacy.tsx`.

## Out of scope

- Session replay video recording (`posthog-react-native-session-replay`) to preserve battery life and low-data usage on budget Android devices.
- Server-side PostHog event ingestion from Supabase Edge Functions.

## Steps

### 1. Install PostHog SDK & Create Privacy-Safe Analytics Client (`src/lib/analytics.ts`)

Install `posthog-react-native` (using `npx expo install`) and build `src/lib/analytics.ts` providing `initAnalytics`, `trackScreen`, `trackEvent`, `identifyStudent`, `resetAnalyticsIdentity`, and persistent opt-out management (`getAnalyticsOptOut`, `setAnalyticsOptOut` backed by `platformStorage` under `tt_analytics_opt_out_v1`). Update `.env.example` and `.env` with `EXPO_PUBLIC_POSTHOG_API_KEY` and `EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`.

### 2. Wire Automatic Screen Views & Auth Identity Sync (`src/app/_layout.tsx` & `src/auth/AuthProvider.tsx`)

Hook `usePathname` and `useSegments` in `src/app/_layout.tsx` to emit `$screen` events on route navigation, and wire `AuthProvider.tsx` to call `identifyStudent` (masking PII when `isUnder18 && !parentConsentGranted`), `resetAnalyticsIdentity` on sign-out, and auth/onboarding lifecycle events.

### 3. Instrument Core Timetable, Sharing, Check-In & Assignment Flows

Add typed `trackEvent` calls into:

- `src/hooks/useTimetable.ts` (course create/delete, class schedule create, exam/study/other event create, shared class join/create, assignment create/toggle).
- `src/components/timetable/PostClassCheckInSheet.tsx` & `src/app/check-ins/pending.tsx` (attendance check-in responses).
- `src/components/timetable/ShareClassSheet.tsx` & `src/app/share/qr-card.tsx` (shared class copy link & WhatsApp share).

### 4. Add Analytics Opt-Out Toggle & Privacy Policy Disclosure (`src/app/privacy.tsx` & `src/app/settings/index.tsx`)

Update `src/app/privacy.tsx` to document PostHog EU product analytics and provide an interactive "Usage analytics (PostHog EU)" toggle (`getAnalyticsOptOut` / `setAnalyticsOptOut`), and surface the status in `src/app/settings/index.tsx`.

## Verification

- Run `npm run format && npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check .`) with 0 errors.
- Run `npx expo export -p web` and verify all 39 static routes compile cleanly without native module errors.
- Verify events queue and flush against `https://eu.i.posthog.com` when `EXPO_PUBLIC_POSTHOG_API_KEY` (`phc_...`) is set, and cleanly disable when the student toggles off Usage Analytics in `/privacy`.

## AGENTS.md updates

- Under **Who owns what → Error Monitoring & Product Analytics**: Record `posthog-react-native` (`src/lib/analytics.ts`) hosted on PostHog EU Cloud (`https://eu.i.posthog.com`) with NDPA 2023 minor PII masking and `tt_analytics_opt_out_v1` student opt-out control.

## Result

- Installed `posthog-react-native` and implemented `src/lib/analytics.ts` pointing to PostHog EU Cloud (`https://eu.i.posthog.com`) with sanitized `platformStorage` persistence, SSR/web-export safety, NDPA 2023 minor PII protection, and `tt_analytics_opt_out_v1` opt-out controls.
- Wired automatic Expo Router `$screen` tracking in `src/app/_layout.tsx` and student identity/auth/onboarding lifecycle events in `src/auth/AuthProvider.tsx`.
- Instrumented core timetable mutations (`src/hooks/useTimetable.ts`) and class sharing actions (`src/components/timetable/ShareClassSheet.tsx`, `src/app/share/qr-card.tsx`).
- Added PostHog EU disclosure and an interactive "Usage analytics (PostHog EU)" toggle in `src/app/privacy.tsx`.
