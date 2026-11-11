# 31 · High-Converting Web Marketing Landing Page (`studenttimetable.app`)

Status: done

## Goal

When visitors or Google/Apple reviewers open `https://studenttimetable.app` on the web, they see a high-converting product landing page (inspired by Saturn, Structured, Notion Calendar, and Linear) with App Store / Google Play download CTAs, an interactive 6-character class code preview bar (`CSC3X9`), a Bento feature showcase, a "Before vs. With TT" comparison, and Google OAuth-compliant Privacy Policy links, while native iOS and Android builds continue to render the Screen 01 splash gate untouched.

## Decisions

- **Platform Isolation (`Platform.OS === "web"`)**: Keep the native iOS/Android Screen 01 splash gate in `src/app/index.tsx` untouched for mobile builds; render `<WebLandingPage />` (`src/components/web/WebLandingPage.tsx`) when `Platform.OS === "web"`.
- **Conversion Architecture (Saturn / Structured / Notion Calendar Philosophy)**:
  1. **Sticky Glassmorphic Header**: TT logo + brand name, quick jumps, `Privacy Policy` link (`/privacy`), `Sign In` (`/setup/welcome?mode=signin`), and `Download App` CTA.
  2. **UI-First Hero + Interactive Zero-Login Discovery**: Bold pain-to-peace headline, App Store & Google Play download buttons, an interactive 6-character class code input (pre-filled placeholder `CSC3X9` that routes directly to `/join/[code]`), and a Titanium iPhone mockup showcasing the live `Today` hero card, `CSC 301` schedule, and floating offline/alarm callouts.
  3. **"WhatsApp Chaos vs. Calm Clarity" Contrast Section**: Side-by-side comparison showing blurry WhatsApp timetable screenshots and missed venue changes vs. TT's live rep broadcasts and wall-clock alarms.
  4. **Bento Grid Feature Showcase**: 4 visual Bento cards covering (a) One-Code Course Rep Sharing & QR Cards, (b) 4-in-1 Multi-Calendar (`Classes`, `Assignments`, `Exams`, `Study & Others` across Main/Carry-over/Elective courses), (c) Offline-First Wall-Clock Alarms (`7:00 AM` summary + `30m/1h` alerts), and (d) `75%` Exam Eligibility Attendance Tracking.
  5. **Desktop-to-Mobile QR Hand-off & Footer**: Scannable QR card + direct links to `/privacy` (Privacy Policy & Account Deletion), `/join/CSC3X9` (Live Demo Timetable), and `/setup/welcome` (Web App Companion), fulfilling Google Cloud OAuth Consent Screen homepage verification requirements.

## Out of scope

- Changes to native iOS or Android onboarding screens (`Platform.OS !== "web"` behavior remains 100% identical).
- Paid checkout or billing flows.

## Steps

### 1. Create `<WebLandingPage />` (`src/components/web/WebLandingPage.tsx`)

Build a responsive, mobile- and desktop-optimized marketing landing page component using Cadence Academy tokens (`#0F172A`, `#1E1B4B`, `#4F46E5`, `#818CF8`, `Inter` typography) with interactive class code lookup (`/join/[code]`), App Store / Google Play CTAs, Bento grid feature cards, interactive preview mockup, and footer links to `/privacy` and `/setup/welcome`.

### 2. Wire `src/app/index.tsx` for Web vs. Native

Update `src/app/index.tsx` so `Platform.OS === "web"` renders `<WebLandingPage />` immediately at `https://studenttimetable.app`, while `Platform.OS !== "web"` preserves the 3-second Screen 01 splash screen and auth redirect.

### 3. Verify Static Web Export & Deploy to Cloudflare (`studenttimetable.app`)

Run `npm run format && npm run check && npx expo export -p web`, verify `https://studenttimetable.app` locally and push to `origin main` so Cloudflare Pages deploys the live landing page.

## Verification

- `npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check`) passes with zero errors.
- `npx expo export -p web` succeeds with zero native module errors.
- Navigating to `/` on web renders the full landing page, entering `CSC3X9` navigates to `/join/CSC3X9`, and clicking `Privacy Policy` navigates to `/privacy`.

## AGENTS.md updates

- Document under **Web Companion** that `src/app/index.tsx` renders `<WebLandingPage />` (`src/components/web/WebLandingPage.tsx`) on `Platform.OS === "web"` at `https://studenttimetable.app`.

## Result

Built `<WebLandingPage />` in `src/components/web/WebLandingPage.tsx` and wired `src/app/index.tsx` to render it on `Platform.OS === "web"`, delivering a responsive product landing page at `https://studenttimetable.app` with an interactive 6-character class code preview bar (`CSC3X9`, `CSC200`, `ECO300`), interactive iPhone mockup with live tab switching (`Today`, `4-in-1 Calendar`, `Assignments`, `75% Target`), a "Without TT vs. With TT" comparison section, a 4-card Bento feature grid with live QR rendering, App Store CTAs, and Google OAuth-compliant Privacy Policy links.
