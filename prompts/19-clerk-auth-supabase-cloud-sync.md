# 19 · Live Clerk Auth & Supabase Cloud Sync

Status: done

## Goal

Students and course reps can sign in with Clerk, persist their session and JWT in SecureStore/localStorage, publish or join shared classes by 6-character code (`CSC3X9`) backed by Supabase PostgreSQL with Row Level Security, and automatically sync timetable overrides and assignments with offline outbox queuing and Realtime rep broadcasts.

## Decisions

- **Graceful Dual-Mode Auth (`src/auth/AuthProvider.tsx`)**: Use `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and Clerk's client session/token APIs backed by `platformStorage` (`expo-secure-store` on native, `localStorage` on web). When env keys are not yet populated in `.env`, fall back seamlessly to a local persisted session so the app never crashes in offline/demo environments.
- **Clerk JWT Injection into Supabase (`src/lib/supabase.ts`)**: Pass an `accessToken` provider to `createClient(supabaseUrl, supabaseAnonKey, { accessToken })` so every PostgREST and Realtime request carries the active Clerk JWT (`sub` claim matched by `current_clerk_user_id()` in `supabase/migrations/20261106000000_core_data_model.sql`).
- **Two-Way Offline Outbox & LWW Sync (`src/lib/sync.ts`)**: Queue local mutations into `sync_outbox` (`createSyncOutboxRecord`), flush them in `TOPOLOGICAL_ENTITY_ORDER` when online with exponential backoff and 5-attempt dead-letter protection, and pull remote updates for subscribed `course_groups` using `isLocalWinnerLastWriteWins` anchored on `updated_at`.
- **Realtime Rep Broadcasts**: Subscribe to Supabase Realtime `postgres_changes` for followed `course_groups` (`class_occurrences`, `assignments`, `class_rules`) so rep venue moves, cancellations, and new assignments appear live on follower devices.
- **Dynamic Student Identity**: Replace hardcoded `"CO"` avatar initials on `Today`, `Classes & Calendar`, `Assignments`, and `Settings -> Account` with the signed-in student's real initials and display name.

## Out of scope

- Native push notification delivery via FCM/APNs (local alarm scheduling is handled in the native device APIs track).
- Modifying existing PostgreSQL RLS policies in `supabase/migrations/20261106000000_core_data_model.sql` (they already use `current_clerk_user_id()`).

## Steps

### 1. Clerk Auth Provider, Secure Token Cache & Dynamic Student Identity

Create `src/auth/AuthProvider.tsx` (and `src/auth/index.ts`) providing `useAuth()` (`user`, `isSignedIn`, `isCloudAuthConfigured`, `getToken`, `signInWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `signOut`, `updateProfile`). Update `.env.example` with `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. Wire `AuthProvider` into `src/app/_layout.tsx`, connect `src/app/setup/welcome.tsx` and `src/app/settings/account.tsx` to `useAuth()`, and display dynamic student initials on the `Today`, `Classes`, `Assignments`, and `AppSidebarShell` headers.

### 2. Clerk-Authenticated Supabase Client & Two-Way Sync Engine

Update `src/lib/supabase.ts` to register the Clerk JWT token getter and expose `isSupabaseConfigured()`. Expand `src/lib/sync.ts` with `enqueueOutboxMutation()`, `flushSyncOutbox()`, `fetchSharedClassFromCloud(shareCode)`, `publishSharedClassToCloud()`, `pullSubscribedGroupsFromCloud()`, and `subscribeToRepBroadcasts()`, persisting outbox state in SQLite (`sync_outbox`) and `platformStorage`.

### 3. Wire Timetable Mutations, Shared Class Join/Publish & Sync Status UI

Connect `src/hooks/useTimetable.ts` mutations (`useCreateCourse`, `useCreateClassRule`, `useOverrideClassOccurrence`, `useCreateAssignment`, `useUpdateAssignmentStatus`, `useRecordAttendance`, `useSubscribeSharedClass`) to enqueue outbox items and trigger `flushSyncOutbox()`. Wire `src/app/join/[code].tsx` and `src/app/share/create.tsx` to query/publish shared class codes against Supabase with local fallback, and add a live Cloud Sync status card (`Synced` / `Pending outbox` / `Sync now`) in `src/app/settings/index.tsx`.

## Verification

- Run `npm run format && npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check`) with zero errors.
- Run `npx expo export -p web` to confirm all static web routes bundle cleanly with zero native module leaks.
- Sign in or update profile in `/settings/account` and verify initials and display name update across `Today`, `Classes & Calendar`, `Assignments`, and the Sidebar.
- Trigger a class override or assignment creation and verify it enqueues in the sync outbox and updates the Cloud Sync status card in `/settings`.

## AGENTS.md updates

- Under **Who owns what → Authentication & Remote Cloud Database & Sync**: document `AuthProvider` (`src/auth/AuthProvider.tsx`) and the two-way outbox + Realtime sync engine in `src/lib/sync.ts`.

## Result

- Added `AuthProvider` and `useAuth()` (`src/auth/AuthProvider.tsx`, `src/auth/index.ts`) with Clerk Frontend API authentication, `platformStorage` JWT caching (`__clerk_client_jwt`), dynamic student initials (`computeInitials`), and automatic sync of student profiles to `memoryStore`, SQLite, and Supabase `students`.
- Configured `src/lib/supabase.ts` with `registerClerkTokenProvider` and an `accessToken` callback on `createClient` so every PostgREST and Realtime request authenticates via Clerk JWT (`current_clerk_user_id()`).
- Expanded `src/lib/sync.ts` with two-way outbox persistence and topological flushing (`enqueueOutboxMutation`, `flushSyncOutbox`, `getSyncStatusSummary`), cloud shared-class lookup (`fetchSharedClassFromCloud`), remote group pull (`pullSubscribedGroupsFromCloud`), and Supabase Realtime rep broadcast subscriptions (`subscribeToRepBroadcasts`).
- Connected `src/hooks/useTimetable.ts`, `src/app/setup/welcome.tsx`, `src/app/settings/account.tsx`, `src/app/settings/index.tsx`, `src/app/join/[code].tsx`, `src/app/share/create.tsx`, and the main tab headers (`index.tsx`, `classes.tsx`, `assignments.tsx`) to live auth identity and cloud sync.
