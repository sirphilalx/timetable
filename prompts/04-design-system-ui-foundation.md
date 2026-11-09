# 04 · Design System and UI Foundation

Status: done

## Goal

Establish Cadence Academy styling tokens, typography ramps, light and dark theme switching, and core user interface primitives for TT Student Timetable. All components render with high fidelity on budget Android phones and iPhones, respecting accessibility standards and dynamic font scaling.

## Decisions

- Use NativeWind v4 with Tailwind CSS semantic variables for light and dark theme tokens.
- Load Inter font weights (regular, medium, semibold, bold) with system font fallbacks, holding the native splash screen until fonts resolve.
- Provide an accessible Text wrapper with twelve typography variants, enforcing a maximum font scale multiplier of 2.0 to prevent layout clipping.
- Manage theme preferences (system, light, dark) using ThemeProvider and useTheme, persisting choices via the storage helper and updating Expo Router background colors without cold start white flashes.
- Build interactive primitives (Button, Input, Card, Badge) enforcing minimum 44 by 44 point touch areas, flexible container heights, and WCAG AA 4.5:1 text contrast.
- Build overlay primitives (Sheet and Dialog) with 24px corner radii, backdrop dismiss, swipe to dismiss, safe area insets, and keyboard avoidance.
- Build system state primitives (OfflineBanner and EmptyState) listening to NetInfo connectivity and internet reachability.
- Build timetable domain cards (ClassCard and AttendancePill) featuring 4px course color stripes, 18px prominent time and venue text, faded past states, and paired status icons with plain text labels.
- Create design.md as art direction reference for all subsequent feature slices.
- Provide an interactive showcase screen to verify every component across both themes.

## Out of scope

- Full timetable CRUD screens and course entry forms (handled in Slice 1).
- Shared class link preview modal and QR code generator views (handled in Slice 2).
- Web companion consent portal user interface (handled in Slice 3).
- Local alarm notification permission prompts and alarm services (handled in Slice 4).

## Steps

### 1. Install UI foundation dependencies

Install required styling, font, and icon packages using npx expo install and npm install: react-native-svg, expo-font, @expo-google-fonts/inter, clsx, tailwind-merge, class-variance-authority, and lucide-react-native. Satisfies AC-1, AC-2, AC-5.

### 2. Configure Tailwind tokens, CSS variables, and design.md

Update tailwind.config.js and global.css with the complete Cadence Academy color palette, canvas and surface tokens, line borders, status colors, eight course colors, radii, and spacing. Create design.md capturing the art direction and build mandate. Satisfies AC-1.

### 3. Implement Inter font loading and ThemeProvider pipeline

Create src/theme/ThemeProvider.tsx and src/theme/useTheme.ts supporting system, light, and dark modes with persistent storage. Update src/app/_layout.tsx to load Inter fonts and theme settings before hiding the splash screen, coordinating Stack contentStyle to avoid flashes. Satisfies AC-2, AC-4.

### 4. Create class merging utility and accessible Text wrapper

Create src/lib/utils.ts with the cn helper using clsx and tailwind-merge. Create src/components/ui/Text.tsx with twelve typography variants and the 2.0 font scale limit. Satisfies AC-3.

### 5. Build action, input, card, and badge primitives

Create src/components/ui/Button.tsx (variants primary, secondary, subtle, destructive with loading state and icons), src/components/ui/Input.tsx (accessible labels, icons, error states, and focus styling), src/components/ui/Card.tsx (surface background, 16px radius, pressable feedback), and src/components/ui/Badge.tsx (status pills with icons and text). Enforce 44px minimum touch targets and WCAG AA contrast. Satisfies AC-5.

### 6. Build overlay primitives: Sheet and Dialog

Create src/components/ui/Sheet.tsx (bottom sheet with 24px top radius, drag handle, backdrop tap dismiss, swipe to dismiss, and safe area handling) and src/components/ui/Dialog.tsx (centered alert dialog with 24px radius, confirm, cancel, and destructive actions). Satisfies AC-6.

### 7. Build system state primitives: OfflineBanner and EmptyState

Create src/components/ui/OfflineBanner.tsx (in flow banner docked below status bar, listening to NetInfo connectivity and reachability) and src/components/ui/EmptyState.tsx (centered calm empty view with icon, title, description, and action button). Satisfies AC-7.

### 8. Build timetable domain primitives: ClassCard and AttendancePill

Create src/components/timetable/ClassCard.tsx (4px left course color stripe, 18px prominent venue and time typography, status badge, tap handler, and past class faded opacity) and src/components/timetable/AttendancePill.tsx (status badge pairing icon and plain text label for attended, missed, pending, cancelled). Satisfies AC-8.

### 9. Build component showcase and test kitchen sink screen

Create an interactive UI gallery screen at src/app/ui-showcase.tsx to test and verify every component, theme toggling, font scaling, and overlay interactions. Satisfies AC-1, AC-3, AC-4, AC-5, AC-8.

## Verification

- Type checking: npx tsc --noEmit passes with zero errors.
- Linting: npx expo lint passes with zero errors.
- Web export: npx expo export -p web succeeds without compilation errors.
- Theme switching: light and dark themes toggle smoothly with persisted preference.
- Font loading: Inter fonts load without layout shifts or raw system font synthesis issues.
- Touch targets: all interactive buttons and inputs meet 44 by 44 point hit areas.
- Contrast: semantic text and background color pairs satisfy WCAG AA 4.5:1.

## AGENTS.md updates

- Document ThemeProvider usage and theme preference storage key tt_theme_preference.
- Document accessible Text component wrapper as required for typography in feature slices.
- Document primitive component exports in src/components/ui/ and src/components/timetable/.

## Result

- Configured Cadence Academy design tokens, course colors, and dark mode palette in tailwind.config.js and global.css.
- Created design.md recording art direction, build mandate, and composition rules.
- Implemented ThemeProvider and useTheme with persistent storage key tt_theme_preference and cold start splash screen coordination.
- Built accessible Text wrapper with twelve typography variants and 2.0 font scale limit.
- Built core primitives: Button, Input, Card, Badge, Sheet, Dialog, OfflineBanner, and EmptyState.
- Built timetable domain primitives: ClassCard with 4px course stripe and AttendancePill.
- Created interactive UI showcase screen at src/app/ui-showcase.tsx.
- Verified: npm run check passes clean (0 type errors, 0 lint warnings, clean formatting), and npx expo export -p web builds static bundles with 0 errors.
