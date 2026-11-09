# Verify: Core timetable loop · spec 0004 · updated 2026-11-07

_Steps derived from spec 0004 acceptance criteria. /check verify runs these; /test locks the durable ones._

## UI / manual

- [x] Launch app on Today tab → verify seeded CSC 300L UNIBEN timetable renders Next class (`CSC 301`), Rest of today (`MTH 301` Attended, `CSC 301` Moved), and Due in the next 3 days (`CSC 305`) from the data layer → AC-1, AC-4
- [x] Tap Avatar (`CO`) on Today header → verify Avatar menu sheet (`Screens/33 Avatar menu.png`) opens with Chioma Okafor profile and links to Setup / Courses / Sign in → AC-2
- [x] Switch to Classes tab → verify `Screens/35 Classes.png` renders with `List | Calendar` toggle, `November 2026` 7 day week strip with dots, and class cards for the selected day → AC-5
- [x] Switch Classes to `Calendar` → verify `Month` view (`Screens/36 Classes · month.png`) and `Day` hour timeline view (`Screens/37 Classes · day.png`) render and allow selecting dates → AC-5
- [x] Tap a Class card → verify Class detail (`Screens/38 Class detail.png`) opens with time, venue, lecturer, recurrence, reminder, check in toggle, editable note, and 86% attendance bar → AC-6
- [x] Tap the Course attendance card on Class detail → verify Course detail (`Screens/39 Course detail.png`) opens with attendance summary, this week's classes, and course assignments → AC-6
- [x] Open Add Course (`Screens/24 Add course.png`) and Add Class (`Screens/25 Add class.png`) → create a new course and class → verify it immediately appears on Classes and Today → AC-3, AC-4, AC-5

## Commands

- [x] `npm run check` → typecheck, lint, and prettier format exit with 0 errors → AC-1 through AC-6
- [x] `npx expo export -p web` → static web bundles generate in dist with 0 errors → AC-1 through AC-6
