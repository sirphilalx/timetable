# 32 · Onboarding OAuth Flow & EAS Public Environment Repair

Status: done

## Goal

Students signing up or signing in with **Continue with Google** or **Continue with Apple** complete real Clerk OAuth end-to-end (including first-time OAuth account transfers and missing username requirements), return cleanly via `tt://oauth-native-callback` without hitting a 404 or losing their onboarding step, and route deterministically to `/setup/profile` on new sign-ups or `/(tabs)` on returning sign-ins.

## Decisions

- **Full Clerk SSO state machine in `signInWithOAuth` (`src/auth/AuthProvider.tsx`)**: Handle all states returned by `startSSOFlow()`:
  1. Direct session completion (`createdSessionId` returned immediately).
  2. Transferable sign-in to sign-up (`signIn.firstFactorVerification.status === "transferable"` -> `signUp.create({ transfer: true })`).
  3. Transferable sign-up to sign-in (`signUp.verifications.externalAccount.status === "transferable"` -> `signIn.create({ transfer: true })`).
  4. Missing sign-up requirements (`signUp.status === "missing_requirements"`, such as required `username`, `firstName`, or `lastName` in Clerk) -> automatically populate safe defaults from the Google/Apple profile or email and call `signUp.update(...)` so `createdSessionId` is issued without failing.
- **Dedicated OAuth callback route (`src/app/oauth-native-callback.tsx`)**: Use `Linking.createURL("oauth-native-callback", { scheme: "tt" })` as the `redirectUrl` for `startSSOFlow()` and add `src/app/oauth-native-callback.tsx` (registered in `src/app/_layout.tsx`) so returning from the system browser never resets `/setup/welcome` or flashes a 404 screen.
- **Explicit onboarding intent (`intent: "signin" | "signup"`)**: Pass `intent` from `src/app/setup/welcome.tsx` into `signInWithOAuth(provider, options)`. When `intent === "signup"` (or a brand-new Clerk `signUp` was created), keep `hasCompletedOnboarding = false` until the user completes `/setup/profile` -> `/setup/semester` -> `/setup/courses`, preventing `src/app/_layout.tsx` from prematurely redirecting new OAuth sign-ups to `/(tabs)`.
- **No fake demo chooser when Clerk is configured**: When `isClerkConfigured` is true, never silently fall back to the mock `<OAuthAccountChooserModal />` (_Chioma Okafor / Ada Eze_); surface any real Clerk error message clearly on the auth screen so the user knows what happened.
- **Public `EXPO_PUBLIC_*` environment variables in `eas.json`**: Include the public `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`, `EXPO_PUBLIC_POSTHOG_API_KEY`, and `EXPO_PUBLIC_POSTHOG_HOST` in `eas.json` (`development`, `preview`, and `production` profiles) so EAS cloud builds always have Clerk, Supabase, and PostHog enabled on real iOS/Android devices.

## Out of scope

- Changing email/password or 6-digit verification code UI design.
- Modifying database schema tables (`src/db/schema.ts`).

## Steps

### 1. Add `src/app/oauth-native-callback.tsx` and register it in `src/app/_layout.tsx`

Create a lightweight callback screen at `src/app/oauth-native-callback.tsx` that catches `tt://oauth-native-callback` redirects from `expo-web-browser` / Clerk OAuth and routes the user cleanly (`/(tabs)` if already onboarded, `/setup/profile` if signed in and onboarding, or `/setup/welcome` otherwise). Register `oauth-native-callback` in `src/app/_layout.tsx`.

### 2. Upgrade `signInWithOAuth` in `src/auth/AuthProvider.tsx`

Update `signInWithOAuth` in `src/auth/AuthProvider.tsx` to:

- Accept `options?: { intent?: "signin" | "signup"; email?: string; displayName?: string; avatarUrl?: string | null; completeOnboarding?: boolean }`.
- Use `Linking.createURL("oauth-native-callback", { scheme: "tt" })` as the `redirectUrl`.
- Complete `transfer` flows (`signUp.create({ transfer: true })` and `signIn.create({ transfer: true })`) when `createdSessionId` is not returned on the first step.
- Fulfill `signUp.status === "missing_requirements"` automatically by generating a unique, valid username (`suggestUsernames(...)` + random suffix fallback if taken) and populating `firstName` / `lastName` if required by the Clerk instance.
- Set `hasCompletedOnboarding = false` whenever `intent === "signup"` or a new `signUp` was created, so `_layout.tsx` does not hijack the route to `/(tabs)` before `/setup/profile`.
- When `isClerkKeyConfigured()` is true, return `{ ok: false, error: msg }` on failure instead of `fallbackToChooser: true`.

### 3. Update `src/app/setup/welcome.tsx` OAuth handlers

Update the **Continue with Google** and **Continue with Apple** button handlers in `src/app/setup/welcome.tsx` (`mode === "signin"` and `mode === "signup"`):

- Pass `{ intent: isSignIn ? "signin" : "signup" }` to `signInWithOAuth`.
- Route to `/setup/profile?next=...` when `!isSignIn` (or when `res.isNewUser` is true) and to `runRestoreAndEnterApp()` when signing in an existing user.
- Display `res.error` in `authError` if OAuth fails instead of popping up the demo `<OAuthAccountChooserModal />` when Clerk is configured.

### 4. Add public `EXPO_PUBLIC_*` keys to `eas.json`

Add the `env` block with the public `EXPO_PUBLIC_*` client keys to `development`, `preview`, and `production` profiles in `eas.json` so EAS cloud builds never strip Clerk or Supabase configuration.

## Verification

- Run `npm run format && npm run check && npx expo export -p web`.
- Verify `Continue with Google` and `Continue with Apple` in `signup` mode complete Clerk SSO, set `isSignedIn = true` and `hasCompletedOnboarding = false`, and navigate to `/setup/profile`.
- Verify `Continue with Google` and `Continue with Apple` in `signin` mode complete Clerk SSO and run `runRestoreAndEnterApp()` into `/(tabs)`.
- Verify cancelling the OAuth browser sheet returns cleanly to `/setup/welcome` without showing the fake account chooser or a 404 screen.

## AGENTS.md updates

- Document `src/app/oauth-native-callback.tsx` and the Clerk OAuth transfer/missing-requirements handling under **Authentication** in `AGENTS.md`.

## Result

- Added [`src/app/oauth-native-callback.tsx`](file:///Users/philiwonder/Dev/tt/src/app/oauth-native-callback.tsx) and registered it in [`src/app/_layout.tsx`](file:///Users/philiwonder/Dev/tt/src/app/_layout.tsx) to handle `tt://oauth-native-callback` deep-link returns cleanly.
- Upgraded `signInWithOAuth` in [`src/auth/AuthProvider.tsx`](file:///Users/philiwonder/Dev/tt/src/auth/AuthProvider.tsx) to complete Clerk SSO `transfer` states (`signIn` <-> `signUp`), automatically fulfill `signUp.status === "missing_requirements"` (`username`, `firstName`, `lastName`, `legalAccepted`), respect explicit `intent: "signin" | "signup"` so new sign-ups always go through `/setup/profile`, and surface real Clerk errors instead of falling back to the demo chooser modal when Clerk is configured.
- Updated [`src/app/setup/welcome.tsx`](file:///Users/philiwonder/Dev/tt/src/app/setup/welcome.tsx) and [`src/app/settings/account.tsx`](file:///Users/philiwonder/Dev/tt/src/app/settings/account.tsx) to pass explicit `intent` and route new OAuth users to `/setup/profile`.
- Added the public `EXPO_PUBLIC_*` client keys to [`eas.json`](file:///Users/philiwonder/Dev/tt/eas.json) (`development`, `preview`, `production`) and fallback defaults in [`src/auth/AuthProvider.tsx`](file:///Users/philiwonder/Dev/tt/src/auth/AuthProvider.tsx), [`src/lib/supabase.ts`](file:///Users/philiwonder/Dev/tt/src/lib/supabase.ts), and [`src/lib/analytics.ts`](file:///Users/philiwonder/Dev/tt/src/lib/analytics.ts) so EAS cloud builds and Cloudflare Pages builds always have Clerk, Supabase, and PostHog configured.
