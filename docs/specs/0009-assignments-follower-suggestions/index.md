# 0009. Assignments & Follower Suggestions

**Status**: approved
**Created**: 2026-11-07
**Parent**: [0001. Stack and Architecture](../0001-stack-architecture.md), [0002. Core Data Model](../0002-core-data-model.md)

## Overview

Implement Slice 6: Assignments List & Calendar views (`Screens/50`, `51`), Solo Assignment Detail (`Screens/52`), Add Assignment from Class / Suggestion Sent (`Screens/47`, `48`), Rep Post Assignment (`Screens/54`), and Rep Review Suggestions (`Screens/58`).

## Decisions

1. **Assignments Tab (`src/app/(tabs)/assignments.tsx`)**:
   - Segmented `List | Calendar` toggle (`Screens/50` and `51`).
   - In List view: sections `Due soon (3)`, `Missing (1)`, and `Done (4)` with interactive checkboxes and tap-to-open detail (`/assignment/[id]`).
   - In Calendar view (`Screens/51`): November 2026 month grid with indigo indicator dots (`6` outlined, `13` selected solid indigo `#4F46E5`) and `"Friday 13 November 2"` assignment pills (`CSC 305 · Database design project`, `CSC 301 · Scheduling report`).
2. **Solo Assignment Detail (`src/app/assignment/[id].tsx`)**:
   - Matches `Screens/52 Assignment detail · solo.png`: course badge (`CSC 301`), `Due today` amber pill, title `"Scheduling report"`, description, metadata card (`Due today, 11:59 pm · Posted by Ada (rep) · Tue 3 Nov`, `Solo · Your own work`, `Reminders · 1 day before and the morning it's due`), `"Your progress"` pills (`Not started`, `In progress`, `Submitted`), personal note input (`"Only you see this"`), and `"Mark as submitted"` button.
3. **Follower Suggestion & Rep Review (`src/app/assignment/add.tsx`)**:
   - Supports three tabs/modes matching `Screens/47`, `48`, `54`, and `58`:
     - **Suggest from class (`Screens/47` & `48`)**: Follower enters title (`Scheduling report`), due date (`Fri 13 Nov`), note, and submits -> shows `"Saved to your assignments"` confirmation card (`"Sent to Ada (rep) as a suggestion for CSC 300L..."`).
     - **Post assignment · rep (`Screens/54`)**: Course selector (`CSC 305 · Database Systems · Goes to all 128 members`), Title, Due date, `Solo · goes to everyone` vs `Group · everyone picks a group` radio toggle, and group configuration (`How many: 22`, `Max per group: 6`, `Joining closes: Mon 9 Nov`).
     - **Review suggestions · rep (`Screens/58`)**: Lists classmate suggestions (`CSC 301 · Suggested by 6 · Scheduling report`, `CSC 301 · Suggested by 1 · Lab 3 write-up`) with `"Add for everyone"` and `"Not this one"` actions.
