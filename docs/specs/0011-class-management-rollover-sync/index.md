# 0011. Class Management, Rollover & Offline Sync

**Status**: approved
**Created**: 2026-11-07
**Parent**: [0001. Stack and Architecture](../0001-stack-architecture.md), [0005. Class Sharing & Import](../0005-class-sharing-import/index.md)

## Overview

Implement Slice 8: Class Settings & Owner/Editor Governance (`Screens/63–72`), Single-Occurrence Cancel/Move Sheet (`Screens/40–41`), Semester Rollover & Archived Semester (`Screens/73–76`), and Today state banners (`Screens/28–31`, `73`).

## Decisions

1. **Class Settings & Governance Hub (`src/app/class-settings/index.tsx`)**:
   - Supports 7 sub-views matching `Screens/63–76`:
     - **Owner Settings (`Screens/63`)**: `CSC 300L · Computer Science · UNIBEN · 2026/2027 · First semester · ends 12 Feb · 128 members`, links to `Members (128 members · 2 editors)`, `Suggestions (2 waiting for review)`, `Change log (Who changed what)`, `Share class`, `Regenerate link`, `Semester ends (12 Feb)`, and `Pause class`.
     - **Members & Member Actions (`Screens/64–66`)**: Searchable member list (`Ada Eze · Owner`, `Tunde Ibrahim · Editor`, `Ngozi Peters · Editor`, `Followers · 125` with `Blessing N.`, `Chioma Okafor`, `Daniel Osagie`, `Efe Omoregie`) and bottom sheet for `Make editor`, `Transfer ownership to Blessing`, and `Remove from class`.
     - **Change Log (`Screens/68`)**: Chronological audit log grouped by `Today` (`Ada moved MTH 301 (Fri 6 Nov) from LT1 to LT2`, `Tunde posted CSC 305 assignment`, `Ngozi cancelled GST 301`) and `This week` (`Ada made Ngozi Peters an editor`, `Ada added STA 311 Probability`, `Tunde fixed the venue for CSC 307`).
     - **Accept Editor Invite & Ownership Transfer (`Screens/69–70b`)**: Dedicated cards for accepting editor permissions (`Accept and become editor`) or ownership handoff (`Accept ownership · Expires in 6 days`).
     - **Pause Class Sheet (`Screens/72`)**: Radio options (`Until I resume it`, `1 week, until Fri 13 Nov`, `2 weeks, until Fri 20 Nov`, `Pick a date`), optional reason input (`ASUU strike`), and `Pause class` CTA that updates global pause state.
     - **Start Next Semester Rollover (`Screens/74–75`)**: `Second semester · 2026/2027 · Starts Mon 1 Mar · Ends Fri 2 Jul`, `"Carry over 4 of 6"` course checklist (`CSC 301 Operating Systems II`, `CSC 305 Database Systems II`, `CSC 307 Computer Networks`, `STA 311 Probability`), and `"Next: times and venues"` button.
     - **Archived Semester (`Screens/76`)**: Read-only archive banner (`Archived 12 Feb. You can read it, but nothing here changes or sends reminders.`) + course attendance summary list (`CSC 301 · 92% · 24 classes`, `CSC 305 · 88%`, `MTH 301 · 71%`, etc.) + `Also kept: Assignments (31 posted · 29 submitted)`.
2. **Cancel or Move One Class (`src/app/class/[id].tsx`)**:
   - Adds `"Change Fri 6 Nov only"` bottom sheet (`Screens/40 Cancel or move one class.png`) allowing reps to either `"Cancel this class"` or `"Move this class"` (`New date: Fri 6 Nov`, `New time: 11:00 am`, `New venue: LT2, Faculty of Science`) and persists the concrete override via `useOverrideClassOccurrence()`.
3. **Today State Banners & Check-In Trigger (`src/app/(tabs)/index.tsx`)**:
   - Adds interactive state pills/banners for `Class paused (ASUU strike)` (`Screens/29`), `Offline · last updated 8:15 am` (`Screens/31`), `Semester ended · Roll over` (`Screens/30` & `73`), and `Post-class check-in` sheet (`Screens/44–46`).
