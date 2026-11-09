# 0006. Parental consent web companion

**Date**: 2026-11-07
**Status**: Accepted

## Summary

This specification defines Slice 3 (Parental consent web companion): age verification during student onboarding (`Screens/10`), display name collision checks (`Screens/11`, `12`), guardian consent request entry (`Screens/13`), restricted waiting state (`Screens/14`), and the static web companion approval page (`/consent/[token]`, `Screens/15`) in strict compliance with the Nigeria Data Protection Act (NDPA) 2023.

## Requirements

**Acceptance criteria**:

- **AC-1**: The Profile & Age Verification flow (`src/app/setup/profile.tsx`, matching `Screens/10 Date of birth.png`, `11 Display name.png`, and `12 Display name · taken.png`) computes student age via `isMinorStudent()` in `src/lib/consent.ts` and checks display name collisions (`"Chioma O."` triggers suggestion chips `Chioma Okafor` and `Chioma O.K.`).
- **AC-2**: Students under 18 are routed to the Guardian Consent request step (`Screens/13 Parent or guardian consent.png`) and restricted to the Waiting for consent preview state (`Screens/14 Waiting for consent.png`) where `Follow class` is disabled until guardian approval is recorded (`canPersistPersonalDataToCloud` returns `false` while pending).
- **AC-3**: The static web companion route (`src/app/consent/[token].tsx`, matching `Screens/15 Parent approval page (web).png`) exports cleanly under `npx expo export -p web` with zero native module imports, displaying what TT stores, NDPA 2023 protections, and interactive `I approve` / `Decline` actions that update consent status.

## Decision

**Chosen option**: Multi step onboarding & guardian consent state machine in `src/app/setup/profile.tsx` paired with a zero native dependency static web route at `src/app/consent/[token].tsx`.

See [rationale.md](rationale.md) and [verify.md](verify.md).
