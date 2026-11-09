# Verify: Parental consent web companion · spec 0006 · updated 2026-11-07

## UI / manual

- [x] Open `/setup/profile` → verify Date of Birth (`Screens/10`), Display Name (`Screens/11`), and taken Display Name collision state (`"Chioma O."`, `Screens/12`) → AC-1
- [x] Enter an under-18 birth date (`14 Mar 2008`) → verify Guardian Consent request (`Screens/13`) and Waiting for consent restricted preview (`Screens/14`) → AC-2
- [x] Open `/consent/tok-ngozi-2026` (`Screens/15 Parent approval page (web).png`) → tap `I approve` or `Decline` → verify approval state updates and unlocks class following → AC-3

## Commands

- [x] `npm run check` → 0 errors
- [x] `npx expo export -p web` → exports `/consent/[token]` cleanly with 0 native module errors
