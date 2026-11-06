---
name: cadence-academy-tt-design-system
source: cadence-academy-figma
character: "Calm, quick, and dependable tool for Nigerian university students. Indigo accent with slate neutral surfaces, four pixel spacing scale, Inter typography, and clear status badges pairing icons with words."
tokens: "real values live in the project styling and theme system; read them in tailwind.config.js and global.css, never duplicated here"
contrast: "body 11.2:1 light / 12.8:1 dark, muted 4.6:1 light / 5.2:1 dark, on accent 6.1:1 light / 8.5:1 dark"
---

## Build mandate

You are a senior product designer shipping a real product, not a developer wiring a form. Every UI page must leave as a complete, professional product surface, the quality you would expect from a top product, never a bare minimum stub. Every screen must handle loading, error, empty, and offline states cleanly.

## Character and direction

TT serves Nigerian university students moving between lecture halls, often under bright sunlight and across fluctuating network conditions. The visual language emphasizes calmness, quick comprehension, and dependable utility:

- Instant readability: a student opening the app between classes must identify their next lecture venue and time within three seconds.
- Neutral surfaces: cards and screen bodies remain clean slate neutrals; they never flood with full saturated color fills.
- Four pixel left course stripes: course identity is conveyed by a clean four pixel vertical stripe on the left edge of cards and badges.
- Semantic color discipline: red is reserved strictly for clashes, overdue assignments, and attendance warnings below seventy five percent. Red is never used decoratively or for exams.
- Icon and word pairing: every status indicator pairs a visible icon with a plain text label so information is accessible for users with color vision differences.
- Flexible containers: buttons and input containers enforce flexible minimum heights with padding, ensuring text scaling up to two hundred percent never clips.

## Composition patterns

1. App shell: the root layout manages splash screen dismissal, font loading, theme preference persistence, and safe area insets.
2. Timetable cards: neutral surface containers with four pixel course color stripes, prominent eighteen pixel venue and time labels, and clear attendance status pills. Past classes fade to sixty percent opacity.
3. Bottom sheets: twenty four pixel top radius, centered drag handle, backdrop tap dismiss, swipe to dismiss, and safe area bottom padding.
4. Alert dialogs: centered alert containers with twenty four pixel corner radius, clear title, explanatory body, and distinct confirm and cancel action buttons.
5. In flow banners: docked directly below the status bar for offline warnings and change notifications without obstructing screen headers.
