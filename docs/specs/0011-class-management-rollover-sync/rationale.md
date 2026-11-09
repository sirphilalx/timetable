# Rationale — 0011. Class Management, Rollover & Offline Sync

- **Strike / break pause mode (`Screens/29`, `72`)**: Nigerian federal and state universities experience industrial actions (ASUU strikes) and unscheduled closures. Pausing a shared class silences daily alarms for all 128 followers without deleting their timetable rules.
- **Concrete override rows (`Screens/40–41`)**: Cancelling or moving a single Friday lecture writes a `ClassOccurrence` row with `status: "cancelled"` or `"moved"` while leaving the weekly `ClassRule` intact.
