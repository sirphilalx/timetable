# 0003. Design system and UI foundation: Rationale

**Date**: 2026-11-06

## Context

TT serves Nigerian university students running mid range and budget Android devices such as Tecno, Infinix, Itel, and Samsung A series, alongside iOS users. These students frequently use their phones outdoors under strong sunlight, between lecture theatres with limited mobile data, and across variable network connectivity. A student checking where their next lecture is needs to know within three seconds. Visual clarity, instant readability, dependable contrast, and smooth rendering with low memory usage are paramount.

Without a central design system and component foundation, feature screens will inevitably invent conflicting styles, hardcode raw color hex codes, break touch target minimums, and cause dark theme flashes during app launch. Android devices with customized vendor operating systems also expose extreme text scaling preferences that break unconstrained layouts. We need a single source of truth for design tokens, typography rules, color theme switching, and reusable components that respect accessibility and device memory constraints.

The project design assets in the repository define complete specifications across Foundations, Components, and the TT Design Brief. These assets establish an indigo accent, slate neutral backgrounds, eight distinct course colors, a four pixel spacing scale, Inter typography, and strict color usage rules. Red is reserved strictly for errors, clashes, and overdue items; every status indicator must pair color with clear wording. This specification standardizes those requirements into a runnable foundation.

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

## Rationale

TT has a clear design identity defined across twelve component sheets and foundation guides. It requires specific details such as four pixel course color left stripes, neutral surfaces that never tint entirely, custom 24px sheet corner radii, and tab tints that align with university faculty colors. Option 1 allows us to encode these rules directly into Tailwind tokens and lightweight primitive components.

Option 2 introduces unnecessary abstraction layers and default styles that fight our design tokens. Option 3 abandons the established NativeWind configuration in our architecture. Option 1 delivers the exact design system envisioned in the TT Design Brief, supports fast composition in feature slices, and guarantees excellent performance on budget hardware.
