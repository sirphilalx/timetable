# Verify: Design system and UI foundation · spec 0003 · updated 2026-11-06

_Steps derived from spec 0003 acceptance criteria. /check verify runs these; /test locks the durable ones._

## UI / manual

- [ ] Open UI Foundation Showcase (/ui-showcase) → verify all 12 typography variants render with Inter font → AC-2, AC-3
- [ ] Toggle theme mode (System, Light, Dark) in showcase → verify background and component styles switch without flashing → AC-1, AC-4
- [ ] Inspect buttons, inputs, and cards → confirm minimum 44 by 44 point touch areas and flexible container padding → AC-5
- [ ] Tap "Open Bottom Sheet" → verify sheet animates with 24px top radius and backdrop dismisses on tap → AC-6
- [ ] Tap "Open Confirmation Dialog" and "Open Destructive Alert Dialog" → verify alert renders with clear confirm and cancel actions → AC-6
- [ ] Tap "Toggle Offline Banner" or disconnect network → verify warning banner docks beneath status bar with WifiOff icon → AC-7
- [ ] Inspect ClassCard and AttendancePill components → verify 4px left course color stripe, 18px prominent venue and time, and status icon plus text labels → AC-8
- [ ] Restart app with theme set to dark → verify zero white flash on cold boot and theme persists from storage → AC-4
- [ ] Change system text size to 200 percent on device → verify text scales up to 2.0x without clipping venues, times, or buttons → AC-3, AC-5

## Commands

- [ ] `npm run check` → typecheck, lint, and prettier format all exit with 0 errors → AC-1, AC-3, AC-5
- [ ] `npx expo export -p web` → static web bundles generate in dist without native module errors → AC-1, AC-4, AC-5

## Acceptance criteria coverage

- AC-1 Cadence Academy design tokens and semantic variables: covered by theme toggle, styling tests, and npm run check.
- AC-2 Inter font loading pipeline: covered by showcase inspection and root layout splash screen coordination.
- AC-3 Accessible Text wrapper with 12 variants and 2.0 font scale limit: covered by typography showcase and text scaling tests.
- AC-4 ThemeProvider and useTheme with cold boot coordination: covered by theme switcher and app restart test.
- AC-5 Interactive Button, Input, Card, Badge primitives: covered by interactive showcase testing and 44px hit areas.
- AC-6 Sheet and Dialog overlay primitives: covered by modal open, safe area padding, and backdrop dismiss tests.
- AC-7 OfflineBanner and EmptyState system state primitives: covered by NetInfo listener and offline banner toggle.
- AC-8 ClassCard and AttendancePill timetable domain primitives: covered by course stripe, venue and time typography, and status indicators.
