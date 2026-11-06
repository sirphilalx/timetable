# 0003. Design system and UI foundation

**Date**: 2026-11-06
**Status**: In Progress

## Summary

This specification establishes the Cadence Academy design tokens and user interface foundation for the TT student timetable mobile application. It translates the design guide assets and globals.css into NativeWind Tailwind configuration, typography scales, light and dark theme modes, and accessible base components. By locking in reusable primitives and timetable cards early, all subsequent feature slices can build clean screens that render reliably on budget Nigerian Android devices and modern iPhones alike.

## Context

TT serves Nigerian university students running mid range and budget Android devices such as Tecno, Infinix, Itel, and Samsung A series, alongside iOS users. These students frequently use their phones outdoors under strong sunlight, between lecture theatres with limited mobile data, and across variable network connectivity. A student checking where their next lecture is needs to know within three seconds. Visual clarity, instant readability, dependable contrast, and smooth rendering with low memory usage are paramount.

Without a central design system and component foundation, feature screens will inevitably invent conflicting styles, hardcode raw color hex codes, break touch target minimums, and cause dark theme flashes during app launch. Android devices with customized vendor operating systems also expose extreme text scaling preferences that break unconstrained layouts. We need a single source of truth for design tokens, typography rules, color theme switching, and reusable components that respect accessibility and device memory constraints.

The project design assets in the repository define complete specifications across Foundations, Components, and the TT Design Brief. These assets establish an indigo accent, slate neutral backgrounds, eight distinct course colors, a four pixel spacing scale, Inter typography, and strict color usage rules. Red is reserved strictly for errors, clashes, and overdue items; every status indicator must pair color with clear wording. This specification standardizes those requirements into a runnable foundation.

## Requirements

**User stories**:

- As a student, I want timetable screens and cards to look crisp, readable, and consistent in both light and dark environments so that I can check class information effortlessly at any time of day.
- As a student using a budget phone with large system font settings, I want text and buttons to scale smoothly without clipping venues, times, or course titles.
- As a student with color vision differences, I want every status indicator and course badge to display plain words alongside color cues so that I never misread class or attendance status.
- As a developer building feature slices, I want a well typed collection of primitives and styling utilities so that I can compose feature screens rapidly without hardcoding layout values.

**Acceptance criteria**:

- **AC-1**: Cadence Academy design tokens and TT semantic variables (canvas, surface, subtle, muted, accent, status, eight course colors, radii, spacing, and elevation) are fully configured in tailwind.config.js and global.css for light and dark modes.
- **AC-2**: Inter font family is loaded via @expo-google-fonts/inter (regular, medium, semibold, and bold weights) with system font fallbacks, holding the native splash screen until font assets resolve.
- **AC-3**: A dedicated Text component wrapper provides the exact TT twelve variant typography ramp (display, title-page, title-section, title-card, time, body-lg, body, label-lg, label, label-sm, caption, code) and enforces a maximum font scale multiplier of 2.0 to prevent layout clipping on budget 320px screens.
- **AC-4**: A ThemeProvider and useTheme hook manage theme mode preferences (light, dark, system), persisting choices to device storage and initializing NativeWind color schemes alongside Expo Router Stack screen options before splash dismiss to eliminate white flashes on cold start.
- **AC-5**: Core interactive action and input primitives (Button, Input, Card, Badge) enforce a minimum 44 by 44 pixel touch hit area, flexible min height containers for 200 percent font scaling, appropriate platform feedback, and WCAG AA 4.5:1 text contrast across both themes.
- **AC-6**: Overlay primitives Sheet (bottom sheet modal with 24px top radius, backdrop dismiss, swipe to dismiss, and dynamic content height up to 90 percent screen height) and Dialog (centered alert container with 24px radius, destructive and neutral variants) handle safe area insets and keyboard avoidance cleanly.
- **AC-7**: System feedback primitives OfflineBanner (in flow banner docked below the status bar, listening to network connectivity and internet reachability) and EmptyState (centered illustration, title, description, and action button) render consistently across all views.
- **AC-8**: Domain specific timetable primitives ClassCard (neutral card with 4px left course color stripe, prominent 18px time and venue, course code, lecturer meta, tap action, and faded past state) and AttendancePill (status badge displaying both an icon and plain text label) match design assets exactly.

## Options considered

### Option 1: NativeWind v4 with Class Variance Authority and custom accessible primitives

Adapt the provided globals.css directly into NativeWind v4 using Tailwind CSS variables, Class Variance Authority (cva) for type safe component variants, clsx with tailwind-merge for className composition, and custom React Native primitives styled to match Figma specifications.

**Pros**:

- Zero additional heavy third party component library dependencies, keeping memory consumption minimal on 2GB RAM Android phones.
- Exact one to one fidelity with the Cadence Academy design tokens, TT Design Brief, and provided globals.css.
- First class support for NativeWind v4 className styling across both native mobile and web export targets.
- Full control over accessibility props, touch target padding, and dynamic font scale limits.

**Cons**:

- Requires writing and maintaining our own primitive component files (Button, Input, Card, Sheet, Dialog) rather than adopting an off the shelf UI kit.

### Option 2: Prebuilt React Native Reusables library (shadcn UI for React Native)

Install the full React Native Reusables component library which ports shadcn UI primitives to React Native using Radix primitives and NativeWind.

**Pros**:

- Provides dozens of prebuilt component templates that can be copied directly into the project.
- Familiar component API for web developers who have used shadcn UI.

**Cons**:

- Introduces extra dependencies and heavier component abstractions that add overhead on budget Android devices.
- Uses default web centric shadcn naming and token structures that conflict with the Cadence Academy tokens and custom TT design assets.
- Requires customizing and overriding numerous styles to match the exact TT corner radii, course stripes, and timetable card layouts.

### Option 3: Standard React Native StyleSheet objects with a custom ThemeContext

Bypass NativeWind utility classes and implement the design system using pure React Native StyleSheet.create objects, passing dynamic theme colors via a React Context.

**Pros**:

- Does not rely on Tailwind CSS compilers, Metro CSS interop plugins, or Babel post processors.
- Fast runtime performance using native style IDs.

**Cons**:

- Breaks the existing NativeWind v4 and Tailwind setup already established in AGENTS.md and 0001-stack-architecture.md.
- High boilerplate code for responsive wrapping, variant combinations, and dark mode branching across every component.
- Slows down developer velocity on subsequent feature slices compared to utility classes.

## Decision

**Chosen option**: Option 1: NativeWind v4 with Class Variance Authority and custom accessible primitives

We choose Option 1 to achieve exact visual alignment with the design guide assets and the provided globals.css while maintaining minimal bundle and memory overhead on budget Android devices.

**Implementation skills**: `expo-router` (`expo/skills`, `.agents/skills/expo-router/`)

## Rationale

TT has a clear design identity defined across twelve component sheets and foundation guides. It requires specific details such as four pixel course color left stripes, neutral surfaces that never tint entirely, custom 24px sheet corner radii, and tab tints that align with university faculty colors. Option 1 allows us to encode these rules directly into Tailwind tokens and lightweight primitive components.

Option 2 introduces unnecessary abstraction layers and default styles that fight our design tokens. Option 3 abandons the established NativeWind configuration in our architecture. Option 1 delivers the exact design system envisioned in the TT Design Brief, supports fast composition in feature slices, and guarantees excellent performance on budget hardware.

## Feature design

**Data model sketch**:

This foundation handles local client styling and theme preferences. No relational database tables are created. State is persisted to client storage using the existing storage helper:

- Storage key: `tt_theme_preference`
- Allowed values: `'system' | 'light' | 'dark'`
- Default value: `'system'`
- Resolved runtime theme: `'light' | 'dark'`

**State transitions**:

```
[System Appearance] ───────────────► Resolved Theme (Light or Dark)
         │
         ▼
[User Toggle in Settings]
         │
         ├── Select 'light' ──────► Persist 'light' ──────► Enforce Light Theme
         ├── Select 'dark'  ──────► Persist 'dark'  ──────► Enforce Dark Theme
         └── Select 'system'─────► Persist 'system'──────► Sync with System
```

**Typography scale matrix**:

To prevent font synthesis failures on Android devices, each typography variant specifies its explicit font family name rather than relying on numeric font weight properties:

| Variant         | Font Family         | Size | Line Height | Letter Spacing       | Purpose                                         |
| --------------- | ------------------- | ---- | ----------- | -------------------- | ----------------------------------------------- |
| `display`       | `Inter_700Bold`     | 32px | 40px        | -0.6px               | Countdown numbers, share codes, primary metrics |
| `title-page`    | `Inter_700Bold`     | 24px | 32px        | -0.4px               | Screen titles (Today, Classes, Settings)        |
| `title-section` | `Inter_600SemiBold` | 20px | 28px        | -0.2px               | Section headings, bottom sheet titles           |
| `title-card`    | `Inter_600SemiBold` | 17px | 24px        | -0.1px               | Card titles, course names                       |
| `time`          | `Inter_600SemiBold` | 18px | 24px        | 0px (tabular nums)   | Class times and venues on class cards           |
| `body-lg`       | `Inter_400Regular`  | 16px | 24px        | 0px                  | Form field inputs, list item titles             |
| `body`          | `Inter_400Regular`  | 14px | 20px        | 0px                  | Body copy, supporting descriptions              |
| `label-lg`      | `Inter_600SemiBold` | 16px | 20px        | 0px                  | Primary and secondary buttons                   |
| `label`         | `Inter_500Medium`   | 14px | 20px        | 0px                  | Form field labels, chips, segmented tabs        |
| `label-sm`      | `Inter_600SemiBold` | 12px | 16px        | 0.2px                | Badges, status tags, micro indicators           |
| `caption`       | `Inter_400Regular`  | 12px | 16px        | 0px                  | Timestamps, metadata, footnotes                 |
| `code`          | `Inter_700Bold`     | 28px | 36px        | 4.0px (tabular nums) | Large course share codes (for example CSC3X9)   |

**API surface**:

The UI foundation exports components from `src/components/ui/` and `src/components/timetable/`, hooks from `src/theme/`, and utilities from `src/lib/utils.ts`. All interactive elements use flexible minimum height containers (`min-h-[48px]`, `min-h-[36px]`, `min-h-[44px]`) to ensure no text clipping occurs when text scaling reaches 2.0x.

| Component / Utility | Location                                      | Key inputs (Props)                                                                                                                                                                                                                            | Key outputs                          | Accessibility / Notes                                                                                               |
| ------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `cn` helper         | `src/lib/utils.ts`                            | `...ClassValue[]`                                                                                                                                                                                                                             | Merged class string                  | Merges Tailwind classes via clsx and tailwind-merge                                                                 |
| `ThemeProvider`     | `src/theme/ThemeProvider.tsx`                 | `children: ReactNode`                                                                                                                                                                                                                         | Context Provider                     | Injects theme class, manages NativeWind colorScheme, coordinates with Stack background                              |
| `useTheme`          | `src/theme/useTheme.ts`                       | None                                                                                                                                                                                                                                          | `{ theme, resolvedTheme, setTheme }` | Hook to read and update theme preference                                                                            |
| `Text`              | `src/components/ui/Text.tsx`                  | `variant`, `className`, `children`, `maxFontSizeMultiplier`                                                                                                                                                                                   | Rendered text                        | Maps to TT typography scale, defaults maxFontSizeMultiplier to 2.0                                                  |
| `Button`            | `src/components/ui/Button.tsx`                | `variant: 'primary' \| 'secondary' \| 'subtle' \| 'destructive'`, `size: 'default' \| 'sm'`, `isLoading: boolean`, `icon: ReactNode`, `iconPosition: 'left' \| 'right'`, `onPress`, `children`                                                | Pressable element                    | Min 44px hit area, min-h-[48px] (default) or min-h-[36px] (sm), Android ripple, iOS opacity, accessible role button |
| `Input`             | `src/components/ui/Input.tsx`                 | `label: string`, `error?: string`, `helperText?: string`, `leftIcon?: ReactNode`, `rightIcon?: ReactNode`, text input props                                                                                                                   | Text field with label                | Min-h-[48px], visible label, focus border ring, error text overrides helperText                                     |
| `Card`              | `src/components/ui/Card.tsx`                  | `variant: 'default' \| 'raised'`, `onPress?: () => void`, `className`, `children`                                                                                                                                                             | Card container                       | 16px radius, surface background, optional tap feedback if onPress provided                                          |
| `Badge`             | `src/components/ui/Badge.tsx`                 | `variant: 'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'`, `icon?: ReactNode`, `label: string`                                                                                                                                     | Status pill                          | Icon plus word, full radius, status background and text tokens                                                      |
| `Sheet`             | `src/components/ui/Sheet.tsx`                 | `isOpen: boolean`, `onClose: () => void`, `title?: string`, `children: ReactNode`                                                                                                                                                             | Bottom sheet modal                   | 24px top radius, backdrop scrim, drag to close, max 90 percent height, safe area padding                            |
| `Dialog`            | `src/components/ui/Dialog.tsx`                | `isOpen: boolean`, `onClose: () => void`, `title: string`, `description: string`, `confirmText: string`, `cancelText?: string`, `variant?: 'default' \| 'destructive'`, `onConfirm: () => void`, `onCancel?: () => void`                      | Centered alert modal                 | 24px radius, backdrop scrim, clear confirmation and cancellation buttons                                            |
| `OfflineBanner`     | `src/components/ui/OfflineBanner.tsx`         | `isOffline?: boolean` (optional manual override)                                                                                                                                                                                              | In flow docked banner                | Triggers on `!isConnected \|\| isInternetReachable === false`, displays sync message, min-h-[48px]                  |
| `EmptyState`        | `src/components/ui/EmptyState.tsx`            | `icon: ReactNode`, `title: string`, `description: string`, `actionLabel?: string`, `onAction?: () => void`                                                                                                                                    | Centered empty view                  | Calm empty state with primary call to action                                                                        |
| `ClassCard`         | `src/components/timetable/ClassCard.tsx`      | `courseCode: string`, `courseTitle: string`, `courseColor: string`, `venue: string`, `time: string`, `lecturer?: string`, `status?: 'upcoming' \| 'ongoing' \| 'ended' \| 'moved' \| 'cancelled'`, `isPast?: boolean`, `onPress?: () => void` | Timetable card                       | 4px course stripe, 18px prominent time and venue, status badge, 60 percent opacity if isPast                        |
| `AttendancePill`    | `src/components/timetable/AttendancePill.tsx` | `status: 'attended' \| 'missed' \| 'pending' \| 'cancelled'`                                                                                                                                                                                  | Status badge                         | Pairs icon with plain text label                                                                                    |

**Value sourcing**:

| Action / Render        | Value produced or displayed            | Source                                                                                                       |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| App boot               | Active theme mode                      | Stored preference in `tt_theme_preference` via storage helper, fallback to device appearance                 |
| App boot               | Stack content background               | Resolved theme mapped to `#F8FAFC` (light) or `#0F172A` (dark)                                               |
| Text render            | Scaled typography size and line height | TT typography variant in `globals.css` and `src/components/ui/Text.tsx`                                      |
| Button tap             | Visual ripple or fade                  | Platform check: Android native ripple color, iOS opacity 0.7                                                 |
| Input focus            | Indigo focus border                    | Tailwind `border-focus` token (`#4F46E5` light, `#818CF8` dark)                                              |
| Offline banner display | Offline message and sync note          | NetInfo connectivity state (`!isConnected \|\| isInternetReachable === false`)                               |
| Class card render      | 4px color stripe                       | Course color prop mapped to `--color-course-1` through `--color-course-8`                                    |
| Class card render      | Venue and time prominence              | Class schedule props rendered via `time` typography utility (18px semibold)                                  |
| Class card interaction | Open class details                     | `onPress` callback prop passed to card pressable container                                                   |
| Attendance pill render | Status icon and plain text             | Concrete mapping: attended (Check, green), missed (X, red), pending (Clock, amber), cancelled (Slash, slate) |

**Key invariants**:

- Touch targets must measure at least 44 by 44 points on mobile viewports.
- All interactive controls and banners enforce flexible `min-height` with vertical padding rather than fixed heights, so that text scaling up to 2.0x never truncates.
- Body text and interactive labels must maintain at least WCAG AA 4.5:1 contrast against their respective backgrounds in both light and dark modes.
- Color alone must never convey state: every status pill, course tag, and alert must present an icon or text label alongside its color.
- Red color tokens (`status-danger`, `bg-danger-subtle`) are reserved exclusively for errors, attendance warnings below 75 percent, and clashes. They must never serve as decorative flourishes.
- Text scaling must never break critical information: the custom Text component caps scaling at 2.0 so venues, times, and course codes do not clip on budget Android devices.
- Dark mode must maintain visual hierarchy through subtle borders (`border-line`) rather than pure black canvas inversions.
- RootLayout must coordinate splash screen hiding with both font loading and theme preference retrieval, preventing white cold boot flashes.

**Security model**:

- All styling and theme preferences operate entirely on the client.
- No sensitive user data, authentication credentials, or private identifiers are stored in styling configurations or theme state.
- Guardian consent and age verification flows reuse the design system components without caching minor records locally before verification.

**Configuration required**:

- Zero new external environment variables or third party API credentials are required for the design system.

**Critical test scenarios**:

- Happy path: Rendering all UI foundation components (Button, Input, Card, Badge, Sheet, Dialog, OfflineBanner, ClassCard, AttendancePill) in both light and dark modes, verifying that styling, colors, and typography match Figma specifications, verifying **AC-1**, **AC-2**, **AC-5**, **AC-8**.
- Theme switching and persistence: Toggling theme between light, dark, and system modes, restarting the app, and confirming that the chosen theme persists with zero white screen flashes on cold boot, verifying **AC-4**.
- Accessibility and scaling: Verifying that all text elements scale cleanly up to 200 percent without truncating venues, times, or button actions on a 320px viewport, and confirming all text pairs pass WCAG AA contrast, verifying **AC-3**, **AC-5**.
- Overlay dismiss and keyboard avoidance: Opening Sheet and Dialog components, verifying smooth backdrop dismiss, hardware back button dismiss on Android, and keyboard avoidance on input fields, verifying **AC-6**.
- Network connectivity feedback: Toggling device airplane mode, verifying that the OfflineBanner docks immediately under the status bar without covering screen titles, and disappears when connectivity returns, verifying **AC-7**.

## Build plan

Following the project Tracer Bullet build approach, this plan builds an end to end vertical foundation: tokens and theme pipeline first, typography and primitives second, and timetable domain cards third, leaving a testable component showcase screen.

1. Install required styling and native peer dependencies (`npx expo install react-native-svg expo-font` and `npm install clsx tailwind-merge class-variance-authority lucide-react-native @expo-google-fonts/inter`), satisfies **AC-1**, **AC-2**, **AC-5**.
2. Configure `tailwind.config.js` and `global.css` with the full Cadence Academy semantic token palette, course colors, radii, spacing, and elevation variables for light and dark modes, satisfies **AC-1**.
3. Create the Inter font loading pipeline in the root layout with splash screen hold until font assets and stored theme resolve, satisfies **AC-2**, **AC-4**.
4. Create the `cn` utility in `src/lib/utils.ts` and the `ThemeProvider` and `useTheme` hooks in `src/theme/`, persisting user preference via the existing storage helper and coordinating Stack contentStyle to eliminate cold boot flash, satisfies **AC-4**.
5. Build the accessible `Text` component wrapper with twelve TT typography variants and the 2.0 dynamic font scale guard, satisfies **AC-3**.
6. Build base action and feedback primitives (`Button`, `Input`, `Card`, `Badge`) with minimum 44px tap targets, flexible min height containers, and WCAG AA contrast compliance, satisfies **AC-5**.
7. Build overlay primitives (`Sheet` and `Dialog`) with 24px top radii, backdrop tap dismiss, swipe to dismiss, and safe area inset integration, satisfies **AC-6**.
8. Build system state primitives (`OfflineBanner` and `EmptyState`) integrated with NetInfo connectivity and internet reachability, satisfies **AC-7**.
9. Build timetable domain primitives (`ClassCard` and `AttendancePill`) with 4px left course color stripes, 18px prominent venue and time typography, tap actions, and accessible status labels, satisfies **AC-8**.
10. Create an interactive design system kitchen sink screen in development to visually verify all components across light and dark modes, satisfies **AC-1**, **AC-3**, **AC-4**, **AC-5**, **AC-8**.

## Consequences

**Positive**:

- Every subsequent feature slice (Core Timetable Loop, Class Sharing, Reminders, Check ins, Assignments) can immediately use prebuilt, accessible components.
- Consistent visual experience across Android, iOS, and the web companion.
- High performance on budget Android devices through lightweight primitives and zero heavy component abstractions.
- Safe dynamic font scaling prevents broken layouts for students who use larger system text sizes.

**Negative / tradeoffs**:

- Custom primitives require team maintenance as new UI requirements emerge.
- Theme switching requires wrapping top level screens with ThemeProvider and ensuring all custom styles consume semantic tokens rather than hardcoded hex values.

**Neutral**:

- Developers must use the `Text` wrapper component rather than raw React Native `Text` to ensure consistent font family and font scale limits.

## Follow-up

- [ ] Incorporate the full component showcase into the developer drawer or settings menu for rapid testing in development builds.
- [ ] Ensure that subsequent feature slices reference `src/components/ui/` and `src/components/timetable/` exclusively rather than rewriting inline styles.
