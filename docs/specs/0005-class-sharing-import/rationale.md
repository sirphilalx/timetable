# Rationale: Class sharing & import · spec 0005

## Context

Course reps in Nigerian universities share timetables in large WhatsApp groups (100 to 500 students) or project them briefly at the front of a lecture theatre. Links must work offline or on flaky 3G connections, and QR codes must render cleanly on both native and static web exports without native C++ canvas dependencies.

## Options considered

1. **Pure React Native View dot-matrix QR component + deterministic 6-character code resolution (`CSC3X9`)**: Renders the exact dotted QR pattern with rounded finder squares and the TT calendar badge from the design assets across iOS, Android, and Cloudflare Pages web export with zero native module bloat.
2. **Third-party native SVG/Canvas QR generator + camera-only scanner**: Requires native binaries that fail in static web export or when camera permission is denied.

## Decision

Option 1 was chosen so every screen (`60 Share sheet`, `61 QR card`, `62 Projector mode`, and `19–21 Join a class`) works identically offline, in Expo Go, and in static web export.
