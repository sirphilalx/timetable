# 01 · Scaffold Stack & Architecture

Status: done

## Goal

Scaffold a runnable React Native project with Expo SDK 52, Expo Router v4, TypeScript, NativeWind v4 styling, local SQLite with Drizzle ORM, Supabase client configuration, and static web export support. The app boots cleanly with type checking passing.

## Decisions

- Framework: React Native with Expo SDK 52, using the Hermes JavaScript engine.
- Routing: Expo Router v4 with file based routing (`src/app/`) and custom URL scheme `tt`.
- TypeScript: Extended from `expo/tsconfig.base` with `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, and path alias `@/*`.
- Styling: NativeWind v4 configured with Tailwind CSS and Cadence Academy design tokens (Inter font, 4px spacing, indigo primary #4F46E5, dark mode #818CF8).
- Database: `expo-sqlite` with Drizzle ORM (`drizzle-orm/expo-sqlite`), `metro.config.js` for `.sql` asset bundling, and local `sync_outbox` queue schema.
- Platform boundaries: `src/lib/storage.native.ts` vs `src/lib/storage.web.ts`, and `src/db/client.native.ts` vs `src/db/client.web.ts`.
- Environment: Public Supabase variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) with template in `.env.example`.

## Out of scope

- Full user sign up and authentication screen flows (handled in Slice 1).
- Cloud data synchronization endpoints and realtime subscriptions (handled in Slice 1 and Slice 8).
- Timetable CRUD UI and course entry forms (handled in Slice 1).
- Push notification permission prompts and alarm scheduling (handled in Slice 4).
- Production Cloudflare Pages build pipeline deployment.

## Steps

### 1. Initialize Expo project structure and package dependencies

Generate the base project layout, `package.json`, and install core Expo SDK 52 modules (`expo`, `expo-router`, `expo-status-bar`, `react-native-safe-area-context`, `react-native-screens`, `expo-constants`, `expo-linking`, `expo-secure-store`, `expo-sqlite`, `drizzle-orm`, `@supabase/supabase-js`, `@tanstack/react-query`). Configure `package.json` scripts.

### 2. Configure TypeScript, path aliases, and app configuration

Create `tsconfig.json` extending `expo/tsconfig.base` with strict flags and path alias `@/*`. Configure `app.json` with scheme `tt`, Hermes engine, Android package `com.tt.app`, iOS bundle identifier `com.tt.app`, and splash screen configuration.

### 3. Set up NativeWind v4 styling and Cadence Academy design tokens

Install and configure NativeWind v4, Tailwind CSS, `tailwind.config.js`, and `global.css`. Define Cadence Academy colors, Inter typography, 4px spacing scale, and dark mode class support.

### 4. Configure local SQLite with Drizzle ORM and Metro bundler

Set up `drizzle.config.ts`, `metro.config.js` to handle `.sql` asset bundling, schema definitions in `src/db/schema.ts` including the `sync_outbox` table, and platform isolated client files (`client.native.ts` and `client.web.ts`).

### 5. Configure Supabase client and platform storage adapters

Create `src/lib/supabase.ts` with platform storage (`storage.native.ts` with `expo-secure-store` and chunking for Android 8, `storage.web.ts` with `localStorage`). Add `.env.example`.

### 6. Create initial Expo Router layout and smoke check screens

Create `src/app/_layout.tsx` with ThemeProvider, QueryClientProvider, and SQLiteProvider, an initial `src/app/index.tsx` Today screen placeholder displaying app branding and stack status, and a web export test route `src/app/join/[code].tsx`.

## Verification

- Type check: `npx tsc --noEmit` passes with 0 errors.
- Web export: `npx expo export -p web` succeeds with 0 errors and zero native library import crashes.
- Local dev server: `npx expo start` initializes cleanly.
- Bundler verification: Metro config resolves `.sql` files and NativeWind styling correctly.

## AGENTS.md updates

None (stack and architecture decisions are already recorded in AGENTS.md).

## Result

Scaffolded Expo SDK 52 application with Expo Router v4, Hermes engine, TypeScript strict mode, NativeWind v4 with Cadence Academy design tokens, Drizzle ORM on local SQLite with migration schema, platform isolated storage with Android 8 payload chunking, Supabase client configuration, and static web export support. All 18 checks in expo doctor passed, TypeScript type check passed with zero errors, and static web export bundled without native module import errors.
