# 25. Real Clerk Authentication, OAuth & Session Management Integration

Status: done

## Goal

Replace the simulated/fallback-only authentication layer in `src/auth/AuthProvider.tsx` with real `@clerk/clerk-expo` and `expo-web-browser` integration connected to `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, including real Google/Apple OAuth redirect flows, email/password + verification code handling, and a Clerk-style Account & Session Management popover accessible from the top-right profile avatar and sidebar header.

## Decisions

- **Real Clerk SDK (`@clerk/clerk-expo` + `expo-web-browser`)**: Wrap the app in `<ClerkProvider publishableKey={...} tokenCache={...}>` backed by `expo-secure-store` on native (`src/lib/storage.native.ts`) and `localStorage` on web (`src/lib/storage.web.ts`).
- **Real Google & Apple OAuth (`useSSO` / `useOAuth` + `expo-web-browser`)**: Tapping **"Continue with Google"** or **"Continue with Apple"** launches the real system OAuth browser sheet (`WebBrowser.maybeCompleteAuthSession()`) via Clerk so Google presents its genuine system Account Chooser screen. If Clerk OAuth is not yet enabled for a provider in the Clerk Dashboard or the device is offline, surface the clear error and offer the fallback account chooser cleanly.
- **Real Email Sign-In, Sign-Up & OTP Verification**: Connect `useSignIn` and `useSignUp` from `@clerk/clerk-expo` so email/password authentication validates against your live Clerk instance, supporting Clerk's email verification code step when required by the Clerk Dashboard.
- **Quick Clerk Account & Logout Popover (`<ClerkUserButtonSheet />`)**: Tapping the student's profile avatar on Today (`src/app/(tabs)/index.tsx`) or in the sidebar header opens a Clerk-style Account & Session Management sheet showing the active Clerk user, email, `@username`, session status badge (`Active Clerk session` / `Local offline session`), **Manage account**, **Switch account**, and a prominent **Sign out** button.

## Out of scope

- Changing the Supabase schema (`supabase/migrations/0001_initial_production_schema.sql`).
- Modifying unrelated course or timetable recurrence logic.

## Steps

1. **Install `@clerk/clerk-expo` and `expo-web-browser`**:
   - Install compatible versions via `npx expo install @clerk/clerk-expo expo-web-browser`.
2. **Bridge `<ClerkProvider>` and Real Clerk Hooks in [`src/auth/AuthProvider.tsx`](file:///Users/philiwonder/Dev/tt/src/auth/AuthProvider.tsx)**:
   - Wrap the provider tree with `<ClerkProvider publishableKey={publishableKey} tokenCache={clerkTokenCache}>` when `isClerkKeyConfigured()` is true.
   - Synchronize Clerk's `useUser()`, `useAuth()`, `useSignIn()`, `useSignUp()`, and `useOAuth()` with TT's `AuthUser` profile, local SQLite (`students`), and Supabase JWT token provider (`getToken()`).
   - Support Clerk email verification code completion (`verifyEmailCode`) when Clerk's `signUp.status === "missing_requirements"`.
3. **Update [`src/app/setup/welcome.tsx`](file:///Users/philiwonder/Dev/tt/src/app/setup/welcome.tsx) for Real Clerk OAuth & Verification**:
   - Launch real Clerk Google/Apple OAuth browser sessions (`startOAuthFlow`) when tapping **Continue with Google** or **Continue with Apple**, and render an inline 6-digit verification code step if Clerk requires email verification on sign-up or sign-in.
4. **Create `<ClerkAccountPopover />` (`src/components/ui/ClerkAccountPopover.tsx`) & Wire Avatar Tap**:
   - Add a Clerk UserButton-style account & session management sheet triggered from the profile avatar in [`src/app/(tabs)/index.tsx`](file:///Users/philiwonder/Dev/tt/src/app/%28tabs%29/index.tsx) and [`src/components/navigation/AppSidebarShell.tsx`](file:///Users/philiwonder/Dev/tt/src/components/navigation/AppSidebarShell.tsx) with one-tap **Sign out**, **Manage account**, and **Switch account**.

## Verification

- `npm run format && npm run check` passes with zero TypeScript or ESLint errors.
- `npx expo export -p web` exports all static routes without native module compilation errors.
- Tapping **Continue with Google** opens Clerk's real Google OAuth Account Chooser in the system browser, and tapping the profile avatar opens the Clerk Account & Logout management sheet.

## AGENTS.md updates

- Document `@clerk/clerk-expo` and `expo-web-browser` integration alongside `<ClerkAccountPopover />` in the **Authentication** section of `AGENTS.md`.

## Result

- Installed `@clerk/clerk-expo` and `expo-web-browser` via `npx expo install`.
- Updated `src/auth/AuthProvider.tsx` to wrap the app in `<ClerkProvider>` with `clerkTokenCache` (`expo-secure-store`), connecting `useAuth()`, `useUser()`, `useSignIn()`, `useSignUp()`, and `useSSO()` (`startSSOFlow`) for real Clerk email/password authentication, 6-digit OTP verification (`verifyEmailCode`), and Google/Apple OAuth redirect flows.
- Created `src/components/ui/ClerkAccountPopover.tsx` and wired the profile avatar in `src/app/(tabs)/index.tsx` and `src/components/navigation/AppSidebarShell.tsx` to open the Clerk Account & Session Management popover with one-tap **Sign out**, **Switch account**, and **Manage account**.
