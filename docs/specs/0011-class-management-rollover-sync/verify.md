# Verification — 0011. Class Management, Rollover & Offline Sync

- [x] `src/app/class-settings/index.tsx` renders Owner Settings (`Screens/63`), Members & Member Actions (`Screens/64–66`), Change Log (`Screens/68`), Editor/Ownership Invites (`Screens/69–70`), Pause Class Sheet (`Screens/72`), Semester Rollover (`Screens/74–75`), and Archived Semester (`Screens/76`).
- [x] `src/app/class/[id].tsx` includes `"Change Fri 6 Nov only"` modal (`Screens/40`) that cancels or moves the class occurrence (`Screens/41`).
- [x] `src/app/(tabs)/index.tsx` wires `PostClassCheckInSheet`, `ShareClassSheet`, and state banners (`Paused`, `Offline`, `Semester ended`).
