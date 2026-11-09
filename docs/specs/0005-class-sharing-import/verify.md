# Verify: Class sharing & import · spec 0005 · updated 2026-11-07

## UI / manual

- [x] Open `/share/create` (`Screens/59 Create shared class.png`) → tap `Create class and share` → verify Share sheet (`Screens/60 Share sheet.png`) opens with QR matrix and `CSC3X9` share code → AC-1, AC-2
- [x] Tap `Save card` and `Projector` in Share sheet → verify `Screens/61 QR card · save or post.png` and `Screens/62 Projector mode.png` render accurately → AC-2
- [x] Open `/join/scan` (`Screens/19–21`) → test camera viewfinder mode and 6 box code entry (`C S C 3 X 9`) → tap `Find class` → AC-3
- [x] Open `/join/CSC3X9` (`Screens/03 Class preview.png`) → tap `Follow class` → verify Course clash bottom sheet (`Screens/16 Course clash on follow.png`) and Already following state (`Screens/06`) → AC-4
- [x] Tap `Friday 6 November · CSC 300L` header subtitle on Today → verify Class switcher sheet (`Screens/34 Class switcher.png`) opens → AC-5

## Commands

- [x] `npm run check` → 0 errors
- [x] `npx expo export -p web` → 0 errors
