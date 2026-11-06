# TT Student Timetable

## Stack

- **Language / Runtime**: TypeScript 5 (Strict), React Native Hermes JavaScript engine
- **Mobile Framework**: React Native with Expo SDK 52
- **Application Router**: Expo Router v4 (file based routing, native deep links, and static web export)
- **Local Database**: expo-sqlite with Drizzle ORM
- **State & Sync**: TanStack Query with local SQLite sync_outbox queue
- **Backend Platform**: Supabase (managed PostgreSQL, Row Level Security, and Realtime channels)
- **Authentication**: Supabase Auth with Expo SecureStore (mobile) and localStorage (web)
- **Reminders & Alarms**: expo-notifications with native alarm permissions
- **Styling & Design**: NativeWind v4 with Cadence Academy design tokens and dark mode
- **Web Companion**: Expo Router static web export hosted on Cloudflare Pages
- **Error Monitoring**: Sentry for React Native
- **Package Manager**: npm

## Build approach

Tracer Bullet (vertical slices where each feature connects every layer end to end).

## Commands

```bash
# Install dependencies
npm install

# Start local Expo development server
npx expo start

# Run on Android device or emulator
npx expo run:android

# Run on iOS simulator
npx expo run:ios

# Run web export locally
npx expo start --web

# Export static web bundle for Cloudflare Pages
npx expo export -p web

# Type check TypeScript without emitting files
npx tsc --noEmit

# Lint code
npm run lint

# Generate Drizzle SQLite migrations
npx drizzle-kit generate

# Reset local database in development
npm run db:reset
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.
- [0001. Stack and Architecture](docs/specs/0001-stack-architecture.md)

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

## Rules

- **Vertical slice delivery**: Build features end to end across data, business logic, and UI, proving real data flows before broadening scope.
- **Strict type discipline**: Extend `expo/tsconfig.base` with `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, and `noUncheckedIndexedAccess: true`. Use path alias `@/*` mapping to `./*`.
- **Platform file boundaries**: Isolate native device code behind platform extensions (`storage.native.ts` vs `storage.web.ts`, `db.native.ts` vs `db.web.ts`). Never import `expo-sqlite` into web routes.
- **Asynchronous database queries**: Always execute Drizzle database queries asynchronously (`await db.select()...`) to prevent UI frame drops on budget devices. Enforce `LIMIT 50` windowing on list views.
- **Offline first data persistence**: Local SQLite is the authoritative on device store. Record offline mutations in `sync_outbox` with exponential retry backoff. Apply last write wins conflict resolution anchored by remote `updated_at`.
- **Wall clock alarm scheduling**: Schedule local reminders using local wall clock time with timezone offsets, requesting Android exact alarm permissions and guiding users past battery optimization.
- **Design tokens and accessibility**: Implement UI with NativeWind utility classes reflecting Cadence Academy tokens (4px spacing scale, indigo primary #4F46E5, dark mode #818CF8). Ensure WCAG AA contrast (4.5:1) and minimum 44px touch targets.
- **Under 18 privacy compliance**: Never persist personal records for minors without verified guardian approval, routing parental consent through the web companion.
- **Conventional commits**: Write commit messages following conventional commit format (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).

## Agent skills

- [expo-router](.agents/skills/expo-router/): `expo/skills`, Expo Router navigation, layouts, tabs, deep links, and static web export
- [supabase](.agents/skills/supabase/): `supabase/agent-skills`, Supabase PostgreSQL database, Row Level Security policies, Auth, and Realtime
- [architect](.agents/skills/architect/): System architecture discovery, option evaluation, and specification creation
- [scope](.agents/skills/scope/): Product roadmap decomposition, feature sequencing, and living status reconciliation
- [audit](.agents/skills/audit/): Project context bootstrapping and coding conventions management
- [develop](.agents/skills/develop/): Feature implementation, test execution, and milestone tracking
- [check](.agents/skills/check/): Spec verification and fresh model senior code reviews
- [test](.agents/skills/test/): Comprehensive unit and integration test suite generation
- [sync](.agents/skills/sync/): Durable knowledge synchronization across specs and context files

## Context files

<!-- Nested AGENTS.md files will be listed here as created -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
