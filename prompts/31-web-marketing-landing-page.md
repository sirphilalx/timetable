# Plan 31: Notion Calendar–Inspired Screenshot-First Product Marketing Page

Status: done

## Goal

Rebuild `https://studenttimetable.app` (`src/components/web/WebLandingPage.tsx`) into a true **Notion Calendar–style (`notion.com/product/calendar`) screenshot-heavy product marketing page** that strictly follows the **TT Brand & Style Guide** (`Foundations and Style Guide/SG · Colour.png`, `SG · Typography.png`, `SG · Spacing, radius and elevation.png`, `SG · Microcopy.png`) and showcases **14 real, pixel-accurate TT app screenshots** from `Screens/` across an editorial hero and four deep-dive feature chapters.

## Decisions

- **Brand & Colour Fidelity (`SG · Colour.png`)**:
  - **Primary Light Editorial Canvas**: Uses TT's light surface hierarchy (`bg/canvas` `#F8FAFC`, `bg/surface` `#FFFFFF`, `bg/subtle` `#F1F5F9`, `border/default` `#E2E8F0`) with `#0F172A` (`text/primary`) headings, `#334155` (`text/secondary`) body copy, `#475569` (`text/muted`) captions, and `#4F46E5` (`bg/accent`) Indigo primary actions and `#EEF2FF` (`bg/accent-subtle`) chips.
  - **Tab Tint Feature Accents**: Uses TT's 5 official tab tints (`tab/classes` `#EEF2FF`, `tab/assignments` `#FEF3C7`, `tab/reading` `#CCFBF1`, `tab/exams` `#EDE9FE`, `tab/others` `#FCE7F3`) to color-code feature chapters.
  - **Dedicated Dark-Mode Contrast Section**: Uses `#0F172A` / `#090D16` exclusively for the Lock-Screen Notifications, Home-Screen Widgets, and Dark Mode showcase chapter so dark screenshots sit naturally on a dark canvas.
- **Typography & Microcopy Fidelity (`SG · Typography.png` & `SG · Microcopy.png`)**:
  - **Inter font family** (`Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold`) with sentence case everywhere (_"Your class, your timetable, on time."_, _"Follow class"_, _"CSC 301 in 30 min, LT2"_).
  - Plain, short, specific copy using authentic student language (_course rep, lecture, venue, LT, CBT, level_).
- **Heavy Screenshot Architecture (Notion Calendar Pattern)**:
  1. **Sticky Editorial Navbar**: Branded TT logo mark, anchor jump pills (`Features`, `Sharing`, `Reminders`, `Attendance`, `Privacy`), `Sign in` (`/setup/welcome?mode=signin`), and `Get TT free` (`/setup/welcome?mode=signup`).
  2. **Centered Editorial Hero + Interactive 3-Screen Showcase Stage**:
     - Headline: _"Your class, your timetable, on time."_
     - Subheadline: _"One shared link from your course rep puts every lecture, venue change, assignment, CBT exam, and reading session on your phone—with reminders that work offline."_
     - Primary CTAs: **Download on the App Store**, **Continue on Web** (`/setup/welcome?mode=signup`), and **Preview live class (`CSC3X9`)** (`/join/CSC3X9`).
     - **Interactive 6-Tab Screenshot Stage** (`Today`, `Classes & Calendar`, `Course Rep QR`, `Assignments`, `Exams`, `Attendance & Reports`): Clicking any pill updates the central 3-phone screenshot showcase featuring real PNGs from `Screens/` (`90 Today · Release 2.png`, `61 QR card · save or post.png`, `35 Classes.png`, `36 Classes · month.png`, `50 Assignments.png`, `91 Exams.png`, `77 Reports.png`).
  3. **Chapter 1 — Shared Classes & Course Rep Broadcasts (_"One link from your course rep. Everyone is in."_)**:
     - 3-up full-height screenshot cards with captions:
       - `Screens/61 QR card · save or post.png`: Share via WhatsApp status, QR card, or lecture hall projector (`CSC3X9`).
       - `Screens/03 Class preview.png`: Preview the full class timetable in seconds—no account needed to look.
       - `Screens/41 Class cancelled.png`: When a rep moves a venue to `LT2` or cancels a class, every follower's Today view and alarm update automatically.
  4. **Chapter 2 — 4-in-1 Student Timetable (_"Classes, exams, assignments, and personal reading in one place."_)**:
     - 2x2 Notion-style large visual feature grid with TT Tab Tint headers and full screenshots:
       - `Screens/36 Classes · month.png` (`tab/classes`): Day, week, and month views across main class, carry-overs, and electives.
       - `Screens/91 Exams.png` (`tab/exams`): CBT and written exam countdowns with hall and seat numbers.
       - `Screens/95 Reading.png` (`tab/reading`): Personal study blocks and weekly reading streaks.
       - `Screens/99 Weekly summary.png` (`bg/accent-subtle`): Calm weekly progress recaps and next-week previews.
  5. **Chapter 3 — Offline-First Reminders & Widgets (_"Reminders that tell you what changed—even when data is off."_)**:
     - Full-bleed dark-slate showcase featuring:
       - `Screens/43 Lock screen notifications.png`: Specific wall-clock alerts (_"CSC 301 in 30 min, LT1"_, _"MTH 301 moved to LT2, 10am"_).
       - `Screens/100 Home-screen widgets.png`: Offline home-screen widgets for next class and due assignments.
       - `Screens/31 Today · offline.png`: Local SQLite storage that never blanks out in lecture halls with poor reception.
  6. **Chapter 4 — 75% Attendance & Group Assignments (_"Stay above the 75% exam threshold and organise group work without chaos."_)**:
     - 3-up screenshot showcase:
       - `Screens/44 Check-in.png`: 1-tap post-class check-in prompt 10 minutes after lecture ends.
       - `Screens/77 Reports.png`: Course-by-course attendance percentage with exact catch-up math (_"Attend 5 of the remaining 6 classes to finish at 75%"_).
       - `Screens/55 Group poll.png`: Self-service group assignment sign-up polls with automatic member caps.
  7. **Bottom Interactive Class Code Bar & Google OAuth Verified Footer**:
     - Live class code previewer (`CSC3X9`, `CSC200`, `ECO300` → `/join/[code]`), App Store + Web CTAs, and crawlable footer links to `/privacy`, `/join/CSC3X9`, and `/setup/welcome`.

## Out of scope

- Modifying any native iOS or Android screens (`Platform.OS !== "web"` continues to render the Screen 01 splash gate in `src/app/index.tsx`).
- Adding external third-party CSS frameworks that conflict with NativeWind / Expo Router static web export.

## Steps

1. Rebuild `src/components/web/WebLandingPage.tsx` with the Notion Calendar–style screenshot-driven layout, TT light/dark brand surfaces, sentence-case microcopy, and 14 embedded `Screens/*.png` assets framed in high-craft iPhone bezels.
2. Verify `src/app/index.tsx` continues to render `<WebLandingPage />` on `Platform.OS === "web"` while preserving the native splash screen on iOS and Android.
3. Run `npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check`) and `npx expo export -p web` to confirm all 14 screenshot assets bundle cleanly into `dist/`.
4. Commit and push to `origin/main` so Cloudflare Pages deploys the updated product marketing page to `https://studenttimetable.app`.

## Verification

- `npm run check` passes with 0 errors.
- `npx expo export -p web` exports cleanly with all `Screens/*.png` assets included in `dist/assets/`.
- Live check on `https://studenttimetable.app` confirms the new Notion-style screenshot-rich page is live.

## AGENTS.md updates

- Keep `WebLandingPage` description in `AGENTS.md` aligned with the screenshot-first Notion Calendar layout.

## Result

- Rebuilt `src/components/web/WebLandingPage.tsx` with a Notion Calendar–inspired, screenshot-driven layout following the TT Brand & Style Guide (`#F8FAFC` / `#FFFFFF` light canvas, `#4F46E5` Indigo primary actions, TT tab tints, sentence-case microcopy, and a dedicated `#0F172A` dark-mode section for lock-screen notifications, offline mode, and home-screen widgets).
- Embedded 17 authentic `720x1600` (`9:20`) product screenshots directly from `Screens/` inside proportional `<PhoneScreenshotFrame />` bezels across an interactive 6-tab, 3-phone hero stage and four feature chapters.
