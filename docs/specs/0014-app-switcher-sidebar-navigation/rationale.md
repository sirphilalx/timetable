# 0014. Rationale — App switcher sidebar & hamburger navigation

## Context

The user requested a sidebar toggled by a hamburger button where:

1. Toggling the sidebar open animates the active main screen by **minimizing it and shifting it to the right** (mimicking when apps are minimized to switch to a different app).
2. The **sidebar takes a different background color**, while the **minimized main screen retains its own background color and live content**.
3. The sidebar contains **all menu items** so navigation around the app is effortless and nothing is hidden.

## Options considered

### Option A (Chosen): Root `AppSidebarShell` with `Animated.spring` (`scale` + `translateX`)

- Place the sidebar canvas behind/left of an `Animated.View` container that wraps the root `Stack` navigator in `src/app/_layout.tsx`.
- When toggled open, animate `scale` to `0.82` and `translateX` to `~68%` of screen width (`~255px`) with `borderRadius: 28` and a subtle card border/shadow.
- **Pros**:
  - Works identically on iOS, Android, and Web without native gesture-handler/drawer compilation issues during `npx expo export -p web`.
  - Truly minimizes the entire active screen (including bottom tab bar and live ongoing class progress) while keeping its exact theme background color.

### Option B: Standard modal slide-over drawer (`@react-navigation/drawer` overlay)

- **Cons**: Covers the screen rather than minimizing and shifting the active screen to the right like an OS app switcher.
