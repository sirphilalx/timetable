# 0001. Stack and Architecture

**Date**: 2026-11-06
**Status**: Proposed

## Summary

This decision defines the foundational technology stack for TT Student Timetable. We select React Native with Expo SDK 52, Drizzle ORM on device local SQLite, Supabase managed PostgreSQL, and Expo Router web export for external verification. This combination gives students an offline first mobile app that starts fast on budget Android phones, syncs timetables through lightweight WhatsApp links, and meets Nigerian data protection requirements.

## Context

University students across Nigeria face erratic lecture schedules, sudden venue shifts, and unannounced class cancellations. Most students rely on photos of physical notice boards or scattered messages in WhatsApp groups. Planners that require manual timetable entry fail because entering an entire semester of classes by hand is tedious. TT solves this by letting one course representative publish a timetable once, enabling classmates to follow and receive live updates through a single link or QR code.

Student devices in target institutions such as the University of Benin, the Federal University of Petroleum Resources Effurun, and Delta State University are predominantly budget Android phones. Common models from Tecno, Infinix, Itel, and Samsung often have 2 gigabytes of random access memory, run Android 8 or newer, and operate on metered cellular data. Furthermore, frequent network drops and unexpected semester disruptions, including nationwide academic strikes, demand an offline first application. The app must store all timetable entries locally, ring alarms without internet access, and run smoothly without draining phone batteries or dropping frames on entry level processors.

Finally, compliance and security shape the architecture. Under the Nigeria Data Protection Act 2023, students under 18 years old require verified parental or guardian consent before their personal information can be stored. Because parents do not have the student mobile app installed, TT must provide a lightweight web page where parents can review and approve data collection. The architecture must support this cross platform requirement without forcing the team to build and maintain two separate software projects.

## Options considered

### Option 1: React Native with Expo, Drizzle ORM on local SQLite, and Supabase (Recommended)

This option combines Expo SDK for cross platform native development with Drizzle ORM managing local SQLite on student phones, backed by Supabase for cloud data and authentication. Expo Router provides file based navigation for the mobile application and exports lightweight web routes for parent consent and universal link fallbacks.

**Pros**:
- Full offline capability using native SQLite, ensuring schedules and alarms function during complete connectivity loss.
- High runtime performance and small memory footprint, running smoothly on phones with 2 gigabytes of memory.
- Expo Router shares routing logic, deep links, and the web approval page within a single unified TypeScript codebase.
- Supabase provides instant authentication, row level security, and realtime change notifications without managing cloud servers.

**Cons**:
- Requires managing two database schemas, coordinating local SQLite migrations alongside remote PostgreSQL migrations.

### Option 2: Bare React Native, WatermelonDB, and Custom Node.js Backend

This option uses standard React Native without Expo tooling, WatermelonDB for local reactive storage, and a custom backend server built with Node.js and PostgreSQL, accompanied by a separate Next.js web service.

**Pros**:
- Total control over native build pipelines and Android background alarm services.
- WatermelonDB provides battle tested lazy loading for very large collections of records.

**Cons**:
- Significantly higher setup and operational overhead, requiring the team to manage, patch, and monitor custom servers.
- Demands maintaining two distinct code repositories for mobile and web surfaces.
- Slower development iteration without Expo developer tools and managed update channels.

### Option 3: Expo with Firebase Firestore and AsyncStorage

This option pairs Expo with Google Firebase, storing client data in AsyncStorage and syncing data as NoSQL documents in Firestore.

**Pros**:
- Fast initial prototype setup with turnkey document synchronization and Firebase Authentication.
- Generous initial free tier for cloud document storage.

**Cons**:
- NoSQL document structure is a poor fit for relational timetable structures, course links, and attendance logs.
- AsyncStorage is slow for structured data queries and lacks relational query capabilities.
- Higher data consumption over metered mobile networks when downloading nested documents.

## Decision

**Chosen option**: Option 1: React Native with Expo, Drizzle ORM on local SQLite, and Supabase.

We choose Expo with React Native, Drizzle ORM on local SQLite, and Supabase as our complete technical stack.

**Implementation skills**: `expo-router` (`expo/skills`, `.agents/skills/expo-router/`) · `supabase` (`supabase/agent-skills`, `.agents/skills/supabase/`)

## Rationale

TT requires strict offline dependability, minimal data transfer, and fast development turnaround. Option 1 delivers on all three fronts.

First, student timetable data is deeply relational: academic sessions contain semesters, semesters contain registered courses, courses contain weekly class rules, and class occurrences produce attendance records and assignments. Relational databases on both client and cloud match this domain cleanly. Drizzle ORM running on Expo SQLite provides typed queries, live reactive updates, and compile time SQL checks with negligible library overhead on budget devices.

Second, Supabase solves authentication and synchronization needs out of the box. Its managed PostgreSQL database enforces row level security, ensuring private notes and attendance logs stay private while shared timetables broadcast updates to authorized followers. Supabase Auth supports Google and Apple sign in alongside email one time passwords, and stores session tokens securely in native hardware storage through Expo SecureStore.

Third, Expo Router eliminates codebase fragmentation. Screen 15 in our user flows requires a parent approval page on the web for students under 18 years old. Rather than creating a secondary web application, Expo Router web export allows us to compile the parent approval screen and deep link handlers directly from the primary codebase to a static hosting provider like Cloudflare Pages or Vercel.

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript 5 (Strict) | Extends `expo/tsconfig.base` with `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, and path alias `@/*`. |
| Mobile Framework | React Native with Expo SDK 52 | Delivers native mobile performance on iOS and budget Android phones from a single codebase, using Hermes engine. |
| Application Router | Expo Router v4 | Provides file based navigation, native deep links (`tt://`), and static web exports for parent consent pages. |
| Local Database | expo-sqlite with Drizzle ORM | Provides lightweight embedded SQLite storage with type safe queries, live query hooks, and embedded migrations. |
| State and Sync | TanStack Query with local outbox queue | Manages optimistic screen updates, offline queueing with exponential backoff, and last write wins conflict resolution. |
| Backend Platform | Supabase | Offers managed PostgreSQL, instant row level security, and realtime change broadcast channels. |
| Authentication | Supabase Auth with platform storage | Secures tokens in encrypted hardware storage on mobile with chunking for Android 8, and local storage on web. |
| Reminders and Alarms | expo-notifications with native alarm permissions | Triggers local alarms in wall clock time, guiding users past Android battery optimization. |
| Styling and Design | NativeWind v4 with Cadence Academy tokens | Implements Tailwind utility styling matching the project design system with dark mode support. |
| Web Companion | Expo Router web export on Cloudflare Pages | Hosts the under 18 parent approval form and deep link redirects from the same repository. |
| Error Monitoring | Sentry for React Native | Tracks application crashes and unhandled exceptions across diverse Android manufacturer builds. |

## Architectural specifications and safeguards

### 1. Platform boundaries and web export safety
To prevent native C library compilation failures during web export (`npx expo export -p web`), code interacting with device hardware is strictly isolated:
- Authentication storage uses platform files: `storage.native.ts` wraps `expo-secure-store`, while `storage.web.ts` falls back to `localStorage` with server rendering safe guards.
- Database access is isolated: `db.native.ts` initializes `expo-sqlite` and Drizzle ORM. Web companion routes (such as the under 18 parent consent page) communicate solely via Supabase REST endpoints, completely excluding `expo-sqlite` from web bundles.
- Android 8 encrypted storage safeguard: on devices running Android 8 or 8.1 where Keystore limits payload sizes to 2048 bytes, the native storage wrapper splits payloads exceeding 1800 bytes into chunked keys or persists only the essential session tokens.

### 2. Embedded database migrations and startup lifecycle
- Migrations are packaged at build time using `drizzle-kit generate` and bundled directly via asset configuration. Client devices never download raw SQL over the network.
- Migrations run automatically during initial app initialization inside a splash screen gate (`SplashScreen.preventAutoHideAsync()`), releasing the splash screen only after schema verification completes.
- A development convenience script (`npm run db:reset`) allows developers to reset and reseed local SQLite tables during user interface iteration.

### 3. Deep linking and WhatsApp traversal
- Native URL scheme is set to `tt` in `app.json` (`tt://`).
- Universal links and Android App Links configure associated domains with `autoVerify: true` pointing to the web companion.
- Route mapping:
  - Class invite link: `/join/[code]` opens the class import preview modal.
  - Guardian approval link: `/consent/[token]` opens the parent approval form.
- WhatsApp in app browser fallback: the web route for `/join/[code]` serves a responsive static landing page containing an "Open in TT App" action (`href="tt://join/..."`) alongside a store install fallback, preventing blank screen failures inside WhatsApp web views.

### 4. Offline sync outbox and conflict policy
Local SQLite serves as the offline source of truth. Changes made while offline enter a local sync queue table:
```sql
CREATE TABLE sync_outbox (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at INTEGER NOT NULL
);
```
- Connectivity listener: monitors network status using `@react-native-community/netinfo` and app foreground events.
- Retry policy: sequential processing with exponential backoff (`Math.min(1000 * 2 ** attempts, 30000) + jitter`). Mutations that fail after 5 attempts are marked as failed and retained for user retry rather than silently dropped.
- Conflict policy: last write wins anchored by remote server timestamps (`updated_at`). If an incoming cloud record has a newer timestamp, remote state prevails and client queries refresh automatically.

### 5. Low memory device safeguards (2GB RAM budget phones)
- JavaScript Engine: Hermes engine is explicitly enforced (`"jsEngine": "hermes"`) for minimal heap footprint and instant startup.
- Asynchronous database access: all Drizzle queries use asynchronous execution (`await db.select()...`) to keep the JavaScript event loop free of frame drops on entry level processors.
- List pagination: timetable and assignment list queries enforce windowing (`LIMIT 50`) to keep application memory usage safely below 120 megabytes.
- Notification architecture: TT schedules local wall clock notifications rather than maintaining a persistent background foreground service, preventing system memory killer terminations.

## Configuration required

- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project API endpoint URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase project public anonymous client key.
- Validated on application startup with an early assertion to fail fast if keys are missing.

## Consequences

**Positive**:
- Students can open TT, view today's classes, and receive arrival reminders without any internet connection.
- Small binary download size and low cellular data consumption during timetable synchronization.
- Course representatives can broadcast class moves and assignment suggestions immediately through Supabase channels.
- Code for mobile screens, data schemas, and the parent approval web form lives in one unified project.
- Native build and web export boundaries prevent compilation crashes.
- Low memory protections avoid frame drops and background app termination on budget Android devices.

**Negative / tradeoffs**:
- Maintaining local SQLite schemas alongside remote PostgreSQL schemas requires coordinating migrations across client updates.
- Aggressive battery saving features on Android phones from brands like Tecno, Infinix, and Itel require clear permission onboarding so reminders fire reliably.

**Neutral**:
- Developers must learn Drizzle ORM query syntax and Supabase row level security policies.
- Deep linking from WhatsApp requires configuring universal links and Android intent filters during Expo prebuild.

## Follow-up

- [ ] Create and configure the Supabase cloud project, enabling PostgreSQL and Auth providers.
- [ ] Document project conventions in root `AGENTS.md` and link installed community skills (`expo-router`, `supabase`).
- [ ] Set up automated deployment on Cloudflare Pages for the Expo Router web export.
- [ ] Test exact alarm scheduling and battery optimization prompts on physical Tecno and Samsung test devices.

## References

**Project sources**:
- TT Product Requirements Document: requirements for offline first usage, local reminders, and Supabase stack suggestions.
- TT Design Brief: screen inventory, 360 by 800 budget device constraints, and Cadence Academy design token ramp.
- TT User Flow and Edge Case Review: parental consent flow for students under 18 and deep link join sequence.

**Practices & standards**:
- Offline first architecture: local storage acts as the single source of truth, synchronizing with remote servers when network is available.
- Nigeria Data Protection Act 2023: mandatory parental consent before collecting or processing personal data from minors.
- Wall clock alarm scheduling: storing alarms with local timezone offsets to prevent time drift during daylight or system adjustments.

**Links**:
- Drizzle ORM with Expo SQLite: https://orm.drizzle.team/docs/get-started/expo-new
- Supabase React Native Guide: https://supabase.com/docs/guides/getting-started/quickstarts/react-native
- Expo Router Documentation: https://docs.expo.dev/router/introduction/
