# TT Student Timetable

A calm mobile timetable app for Nigerian university students to manage classes, reminders, check ins, and assignments through shared course links.

This file is the project memory: it holds every architectural decision, convention, and operational rule that is still true.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm install: resolves SDK compatible versions
npx expo start              # dev server (press a for Android emulator or i for iOS simulator)
npx expo start --web        # run web export locally
npx expo run:android        # run native development build on Android device or emulator
npx expo run:ios            # run native development build on iOS simulator
npx expo export -p web      # export static web bundle for Cloudflare Pages
npx expo lint               # lint code
npx tsc --noEmit            # type check TypeScript without emitting files
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
npx drizzle-kit generate    # generate Drizzle SQLite migrations
npm run db:reset            # reset local database in development
npx eas-cli@latest <cmd>    # EAS builds, submits, and updates (use instead of bare eas)
```

## Expo & Native Architecture

- Expo ships breaking changes every SDK release, so do not trust memory. Before touching an Expo, EAS, or React Native API, check the `expo` major version in `package.json` and read `https://docs.expo.dev/versions/v<major>.0.0/`. For anything else, start from `https://docs.expo.dev/llms.txt` and follow its links.
- Routes live in `src/app/`: every file is a screen and `_layout.tsx` files define navigators. API routes and web routes live in `src/app/api/*+api.ts` or static routes for web export (`/join/[code]`, `/consent/[token]`). Keep components, hooks, schemas, and utilities outside `src/app/` in `src/components/`, `src/db/`, `src/hooks/`, and `src/lib/`.
- Native directories `ios/` and `android/` are generated via prebuild. Never edit them by hand; configure native behavior, permissions, icons, and plugins in `app.json`.
- Expo Go only includes its bundled native modules. For custom native libraries, exact alarms, and local notification channels, switch to a development build (`npx expo run:android` or `npx expo run:ios`).
- Enforce the Hermes JavaScript engine explicitly (`"jsEngine": "hermes"`) to keep heap allocation low on budget Android devices with 2 gigabytes of memory.

## Who owns what

Each tool has one job. Ask before moving a responsibility to a different tool.

- **Authentication**: Supabase Auth is the source of truth for accounts and sessions. Tokens are stored securely on device via Expo SecureStore on mobile (with payload chunking for Android 8 Keystore limits) and localStorage on web.
- **Local Database & Offline Store**: `expo-sqlite` with Drizzle ORM. Local SQLite is the authoritative on device store for timetables, courses, check ins, and personal notes, ensuring full offline functionality.
- **Remote Cloud Database & Sync**: Supabase managed PostgreSQL. Stores shared classes, class memberships, broadcast changes, and audit logs. Enforces Row Level Security (RLS) so personal records remain private.
- **State & Mutation Queue**: TanStack Query with local SQLite `sync_outbox` table. Screen state updates optimistically; offline mutations are buffered in `sync_outbox` and retried with exponential backoff on reconnection. Conflict resolution follows Last Write Wins anchored by remote `updated_at`.
- **Reminders & Alarms**: `expo-notifications`. Schedules local device notifications in local wall clock time with timezone offsets. Manages Android exact alarm permissions (`SCHEDULE_EXACT_ALARM`) and guides users past aggressive battery optimization on Tecno, Infinix, Itel, and Samsung devices.
- **Styling & Design System**: NativeWind v4 configured with Cadence Academy tokens (Inter font, 4px spacing scale, indigo primary #4F46E5, dark mode #818CF8).
- **Web Companion**: Expo Router static web export hosted on Cloudflare Pages. Serves the under 18 parent approval form and universal link landing pages with WhatsApp in app browser traversal fallbacks.
- **Error Monitoring**: Sentry for React Native, capturing uncaught exceptions and native crashes.

## Rules

- Secret keys (Supabase service role key, private API credentials) never reach the application bundle. Use only public client keys (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) in mobile and web client code. Never commit `.env`. Keep variable names without values in `.env.example`.
- Enforce strict platform boundaries: place native device code behind platform extensions (`storage.native.ts` vs `storage.web.ts`, `db.native.ts` vs `db.web.ts`). Never import `expo-sqlite` or native modules into web export routes, preventing web export compilation crashes.
- Asynchronous database operations: always execute Drizzle database queries asynchronously (`await db.select()...`) to prevent UI frame drops on budget devices. Enforce `LIMIT 50` windowing on list views.
- Offline first persistence: local SQLite is the authoritative on device store. Record offline mutations in `sync_outbox` with exponential retry backoff. Apply last write wins conflict resolution anchored by remote `updated_at`.
- Wall clock alarm scheduling: schedule local reminders using local wall clock time with timezone offsets, requesting Android exact alarm permissions and guiding users past battery optimization.
- Under 18 privacy compliance: strictly follow the Nigeria Data Protection Act 2023. Never persist personal records for minors without verified guardian approval, routing parental consent through the web companion. Unapproved accounts stay restricted to import previews.
- Decision panels for choices: whenever you need input from the user, ask through decision panels so they pick from options instead of typing. Give two to four clear options with the recommended one first.
- Strict type discipline: extend `expo/tsconfig.base` with `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, and `noUncheckedIndexedAccess: true`. Use path alias `@/*` mapping to `./*`.
- Conventional commits: write commit messages following conventional commit format (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).

## How we build features

For a new feature or a change across several files. Small fixes and questions skip this.

1. **Understand**: Read the code involved, the design assets in `Screens/`, `Components_design/`, and `Foundations and Style Guide/`, and relevant specs in `docs/specs/`. Load matching skills (`expo-router`, `supabase`). Do not write version specific APIs from memory.
2. **Ask**: If a real decision is unclear (scope, visible behavior, data shape), ask in the question panel, batching questions into one round.
3. **Plan**: Architecture decisions go to `docs/specs/` via `/architect`. For execution, copy `prompts/TEMPLATE.md` to `prompts/NN-feature-name.md` (numbered sequentially, e.g. `01-scaffold-stack.md`) and fill in Goal, Decisions, Out of scope, Steps, Verification, and AGENTS.md updates. High level feature status remains tracked in `docs/scope/scope.md`.
4. **Stop and wait**: Write no application code until the user approves the feature plan in `prompts/NN-feature-name.md`. Ask for approval in the question panel (approve or request changes). On approval, set `Status: approved`.
5. **Build**: Build step by step through vertical slices connecting data, business logic, and UI. Each step must leave the application working. If a step turns out wrong, stop and explain instead of redesigning silently.
6. **Close out**:
   - Run verification checks and give the report described under Reporting.
   - Add a short `## Result` to the plan and set `Status: done`.
   - Advance the feature milestone in `docs/scope/scope.md`.
   - Update this file: apply lasting decisions from the plan's `## AGENTS.md updates` section to the appropriate section here.

## Building from designs

Designs and style guides are located in the repository:
- `Foundations and Style Guide/`: Typography, Spacing radius and elevation, Colour, Accessibility, Icons, and Principles.
- `Components_design/`: Actions, Inputs, Cards, Navigation, Feedback and overlays, Brand, and Indicators.
- `Screens/`: 100 numbered screens covering onboarding, Today, Classes, Assignments, Check ins, Settings, and Sharing.

Screens must match the design assets exactly: layout, spacing, sizes, colors, typography, radii, icons, and microcopy.

- Icons, fonts, and brand images come from `logo/` or the chosen icon set, never recreated from a screenshot.
- Map every color, font, spacing value, and radius to Cadence Academy tokens (4px spacing scale, Inter font, 44px minimum touch targets, WCAG AA 4.5:1 contrast). List values with no token as proposed new tokens instead of hardcoding raw values.
- Design testing: verify screens on budget Android dimensions (360 by 800) and iPhone dimensions (390 by 844). Verify responsive wrapping down to 320px width and check with 200% font scaling to prevent text clipping.
- Verify both light mode and dark mode for every screen.

## Reporting

End every piece of work that changes code with this report. Use these headings in this order, leaving out any section that would be empty:

- **Done**: One line on the outcome, followed by the files changed and what changed in each.
- **Verified**: Each check with evidence (command output, simulator screenshot). List what was not checked with the reason.
- **You need to**: Numbered actions only the user can take (API credentials, dashboard toggles, manual steps).
- **Test it yourself**: Numbered steps to reproduce the result from a fresh start, ending with `Expected:` and what the user should see.
- **Notes**: Defaults picked, trade offs, and anything left for later.

## Checks

- Lint and type check pass (`npx expo lint`, `npx tsc --noEmit`) before any task is called done.
- Screens that load data handle loading, error, empty, and offline states.
- Local alarms and notifications are scheduled with Android exact alarm permission checks and battery optimization guidance.
- Static web export passes `npx expo export -p web` with zero native library compilation errors.

## Specs & Plans

Architectural specifications live in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.
- [0001. Stack and Architecture](docs/specs/0001-stack-architecture.md)

Feature build plans live in `prompts/`. Format: `prompts/NN-feature-name.md` (derived from `prompts/TEMPLATE.md`).
- Active plans hold `Status: draft` or `Status: approved`.
- Completed plans hold `Status: done` with a `## Result` summary, recording build history.

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

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
