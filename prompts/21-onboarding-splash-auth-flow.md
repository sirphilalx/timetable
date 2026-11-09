# 21 · End-to-End Onboarding, Branded Splash Screen, Sign In / Sign Up & Reminder Prompt

Status: done

## Goal

On first launch (or after signing out), students experience the branded Screen 01 Indigo Splash screen, land on the Screen 02 Welcome screen, and can complete the full Sign Up, Sign In, Reset Password (Screen 09), Restoring on a new phone (Screen 18), Profile & Age/Consent check (Screens 10–14), and Turn on Reminders (Screen 17) flows before entering Today (`/(tabs)`).

## Decisions

- **Branded Screen 01 Splash & Smart Root Gate (`src/app/index.tsx`)**: Render the exact Screen 01 Indigo (`#4F46E5`) splash screen with `logo/Logo-dark.png`, `"TT: Student Timetable"`, and `"Your class, your timetable, on time."` during initial hydration, then route to `/setup/welcome` when `hasCompletedOnboarding` / `isSignedIn` is false, or `/(tabs)` when already signed in.
- **Real Onboarding & Auth State (`src/auth/AuthProvider.tsx`)**: Track `hasCompletedOnboarding` alongside `isSignedIn` in `platformStorage` (`tt_auth_session_v1`). New installs start at `isSignedIn: false, hasCompletedOnboarding: false` so the onboarding flow runs naturally; completing sign-in, sign-up + profile, or timetable setup marks onboarding complete.
- **Complete Screen 07 / 08 / 09 / 18 Auth Flows (`src/app/setup/welcome.tsx`)**:
  - Clean empty or user-typed email/password inputs (with optional quick-fill or Clerk auth).
  - Add **Screen 09 (`Reset password`)** with email input, `"Send reset link"` CTA, and the green `"Check your email. The link works for 1 hour."` confirmation banner.
  - Add **Screen 18 (`Restoring on a new phone`)** skeleton state (`"Restoring your classes on this phone..."`) when signing into an existing account before redirecting to `/(tabs)`.
- **Complete Screen 10–14 & Screen 17 (`Turn on reminders`) in `src/app/setup/profile.tsx` & `src/app/join/[code].tsx`**:
  - Connect `SetupProfileScreen` to `useAuth().updateProfile()` so the chosen display name and DOB persist into the student's profile.
  - Add **Screen 17 (`Get a reminder before every class`)** with the `logo/Logo-light.png` notification preview card (`"CSC 301 in 30 min, LT1"`), `"Turn on reminders"` (requests OS notification permissions via `requestNotificationPermissions()`), and `"Not now"`, then mark onboarding complete and navigate to the next step (`/(tabs)` or `/setup/semester`).

## Out of scope

- Changing existing post-onboarding tabs (`Today`, `Classes`, `Assignments`) or sidebar navigation behavior.

## Steps

### 1. Update `AuthProvider` & Branded Screen 01 Splash Gate in `src/app/index.tsx`

Update `src/auth/AuthProvider.tsx` so fresh sessions start unauthenticated (`isSignedIn: false`, `hasCompletedOnboarding: false`) and expose `completeOnboarding()` and `resetPassword(email)`. Update `src/app/index.tsx` to render the Screen 01 Indigo splash screen (`logo/Logo-dark.png`, `"TT: Student Timetable"`, `"Your class, your timetable, on time."`) and route to `/setup/welcome` or `/(tabs)` once auth state is ready.

### 2. Wire Welcome, Sign In, Create Account, Reset Password (Screen 09) & Restoring (Screen 18) in `src/app/setup/welcome.tsx`

Update `src/app/setup/welcome.tsx` to support all 5 modes matching the design assets:

- `welcome` (Screen 02): **Join my class** (`/join/scan`), **Set up my own timetable** (`mode="signup"` with `nextRoute="/setup/semester"`), and **I already have an account** (`mode="signin"`).
- `signup` (Screen 07): Google/Apple OAuth + Email/Password form with password visibility toggle, routing to `/setup/profile`.
- `signin` (Screen 08): Google/Apple OAuth + Email/Password form + **Forgot password?** link opening `reset` mode.
- `reset` (Screen 09): **Reset password** screen with email field, green `"Check your email. The link works for 1 hour."` callout, and **Send reset link** button.
- `restoring` (Screen 18): **Today · Restoring...** screen with `"Restoring your classes on this phone..."` banner and 4 shimmer placeholder cards before landing on `/(tabs)`.

### 3. Wire Profile Setup (Screens 10–14), Turn on Reminders (Screen 17) & Sign-Out Redirect

Update `src/app/setup/profile.tsx` to save the student's `displayName` to `useAuth().updateProfile()`, default DOB to an 18+ student date with a toggle/picker so both adult (18+) and under-18 (guardian consent Screens 13–14) paths can be tested, and add the **Screen 17 (`Turn on reminders`)** step with real notification permission request (`requestNotificationPermissions()`) before completing onboarding. Also update `src/app/setup/complete.tsx` and `src/app/join/[code].tsx` to call `completeOnboarding()` when finishing setup or following a class.

## Verification

- Run `npm run format && npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check`) with zero errors.
- Run `npx expo export -p web` to confirm all 38 static web routes bundle cleanly.
- Launch `/` or tap **Sign out** in `/settings/account` to verify the Screen 01 Splash -> Screen 02 Welcome -> Sign Up / Sign In / Reset Password -> Profile -> Turn on Reminders -> Today flow works end-to-end.

## AGENTS.md updates

- Under **Who owns what → Authentication**: note that `src/app/index.tsx` renders the Screen 01 Splash gate and routes unauthenticated users through `/setup/welcome` (Screens 01–26).

## Result

- Replaced the hardcoded redirect in `src/app/index.tsx` with the branded Screen 01 Indigo splash screen (`logo/Logo-dark.png`, `"TT: Student Timetable"`, `"Your class, your timetable, on time."`) and smart auth/onboarding gate routing to `/setup/welcome` or `/(tabs)`.
- Updated `src/auth/AuthProvider.tsx` to start fresh installs unauthenticated (`isSignedIn: false`, `hasCompletedOnboarding: false`) and added `completeOnboarding()` and `resetPassword()`.
- Expanded `src/app/setup/welcome.tsx` with all 5 onboarding auth modes: `welcome` (Screen 02), `signup` (Screen 07), `signin` (Screen 08), `reset` (Screen 09 Reset password with green confirmation callout), and `restoring` (Screen 18 Restoring your classes on this phone...).
- Updated `src/app/setup/profile.tsx` to persist the student's display name and DOB via `updateProfile()`, added quick age preset pills (`18+ Student` vs `Under 18 · Consent flow`), and wired **Screen 17 (`Get a reminder before every class`)** with OS notification permission requests before entering the app.
