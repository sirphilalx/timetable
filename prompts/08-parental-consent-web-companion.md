# 08 · Parental Consent Web Companion (Slice 3)

Status: done

## Goal

Build the NDPA 2023 age verification, display name collision check, guardian consent request, waiting for consent lock screen, and static web companion approval page (`Screens/10–15`).

## Steps

1. Build `src/app/setup/profile.tsx` covering Date of birth (`Screens/10`), Display name & taken state (`Screens/11`, `12`), Parent/guardian request (`Screens/13`), and Waiting for consent (`Screens/14`).
2. Build `src/app/consent/[token].tsx` (`Screens/15 Parent approval page (web).png`) for static web export and in-app verification.
3. Register routes in `src/app/_layout.tsx` and verify with `npm run check` and `npx expo export -p web`.
