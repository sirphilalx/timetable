# 0005. Class sharing & import

**Date**: 2026-11-07
**Status**: Accepted

## Summary

This specification defines Slice 2 (Class sharing & import): how course reps create a shared class from their timetable, distribute it via share links, 6 character share codes (`CSC3X9`), WhatsApp status QR cards, and full screen lecture theatre projector mode, and how classmates preview, resolve course clashes, follow, and switch between shared classes.

## Requirements

**User stories**:

- As a course rep, I want to turn my semester timetable into a shared class (`CSC 300L · Computer Science`) and share it via a 6 character code (`CSC3X9`), a WhatsApp link, a downloadable QR card, or a high contrast projector screen in a lecture hall.
- As a classmate receiving a link or code, I want to preview the class metadata (owner, editor count, member count, course count, weekly class count) without needing an account first, and follow it in one tap.
- As a student who already added personal courses (`CSC 301`, `MTH 301`), I want TT to detect duplicate course codes when I follow a shared class and let me choose whether to use the rep's schedule (hiding mine without deleting) or keep mine.
- As a student following multiple levels (e.g. `CSC 300L` plus `STA 211 carryover · 200L`), I want a Class switcher sheet on Today to filter or view my followed classes.

**Acceptance criteria**:

- **AC-1**: Course reps can open `/share/create` (`Screens/59 Create shared class.png`) to configure Class name, Institution, Level, Session, and Semester, and generate a shared class with a 6 character code (`CSC3X9`).
- **AC-2**: The Share sheet (`src/components/timetable/ShareClassSheet.tsx`, matching `Screens/60 Share sheet.png`) displays a custom vector QR matrix with the TT emblem, the `CSC3X9` code with one tap copy feedback, a WhatsApp share trigger, and actions to open the QR card view (`/share/qr-card`, matching `Screens/61 QR card · save or post.png`) and Projector mode (`/share/projector`, matching `Screens/62 Projector mode.png`).
- **AC-3**: The Join / Scanner route (`/join/scan`, matching `Screens/19 Join a class · scan.png`, `20 Join a class · camera off.png`, and `21 Join a class · code entered.png`) provides a camera viewfinder toggle and a 6 box alphanumeric code entry (`C S C 3 X 9`) that navigates to `/join/[code]`.
- **AC-4**: The Class preview route (`/join/[code]`, matching `Screens/03 Class preview.png`, `04 Link no longer works.png`, `05 Class preview · offline.png`, and `06 Class preview · already following.png`) renders invited class details, invalid code recovery, already following state, and triggers the Course clash resolution sheet (`Screens/16 Course clash on follow.png`) when overlapping course codes exist.
- **AC-5**: Tapping the class subtitle on Today opens the Class switcher sheet (`src/components/timetable/ClassSwitcherSheet.tsx`, matching `Screens/34 Class switcher.png`) listing `CSC 300L · Computer Science`, `STA 211 carryover · 200L`, `My own events`, and `+ Join another class`.

## Decision

**Chosen option**: Local first shared class store in `memoryStore` / SQLite `shared_groups` + `group_memberships` with deterministic 6 character code lookup and custom SVG/View QR matrix rendering.

See [rationale.md](rationale.md) for the option comparison and reasoning.

**Implementation skills**: `expo-router` (`.agents/skills/expo-router/`), `supabase` (`.agents/skills/supabase/`)

## Feature design

**Routes and surfaces**:

| Route                                             | Screen asset                    | Purpose                                                                      |
| ------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `src/app/join/[code].tsx`                         | `03`, `04`, `05`, `06`, `16`    | Shared class preview, invalid link fallback, and course clash bottom sheet   |
| `src/app/join/scan.tsx`                           | `19`, `20`, `21`                | QR scanner viewfinder + 6 box share code input (`C S C 3 X 9`)               |
| `src/app/share/create.tsx`                        | `59 Create shared class.png`    | Rep form to name and publish a shared class                                  |
| `src/app/share/qr-card.tsx`                       | `61 QR card · save or post.png` | Indigo gradient WhatsApp status QR card                                      |
| `src/app/share/projector.tsx`                     | `62 Projector mode.png`         | High contrast lecture theatre QR projection screen                           |
| `src/components/timetable/ShareClassSheet.tsx`    | `60 Share sheet.png`            | Bottom sheet with QR code, `CSC3X9` copy box, WhatsApp button, and shortcuts |
| `src/components/timetable/ClassSwitcherSheet.tsx` | `34 Class switcher.png`         | Bottom sheet to switch between followed classes and personal events          |
| `src/components/timetable/QrMatrix.tsx`           | `60`, `61`, `62`                | Deterministic crisp dot matrix QR renderer with center TT badge              |

## Build plan

1. Create `src/components/timetable/QrMatrix.tsx`, `src/components/timetable/ShareClassSheet.tsx` (`Screens/60`), and `src/components/timetable/ClassSwitcherSheet.tsx` (`Screens/34`), satisfies **AC-2**, **AC-5**.
2. Build `src/app/share/create.tsx` (`Screens/59`), `src/app/share/qr-card.tsx` (`Screens/61`), and `src/app/share/projector.tsx` (`Screens/62`), satisfies **AC-1**, **AC-2**.
3. Upgrade `src/app/join/[code].tsx` (`Screens/03`, `04`, `05`, `06`, `16`) and create `src/app/join/scan.tsx` (`Screens/19`, `20`, `21`), satisfies **AC-3**, **AC-4**.
4. Wire Today, Setup Complete, and Avatar Menu to the new sharing, switcher, and scanner surfaces, and verify with `npm run check` and `npx expo export -p web`, satisfies **AC-1** through **AC-5**.
