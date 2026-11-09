# 0010. Group Assignments & Sign Up Polls

**Status**: approved
**Created**: 2026-11-07
**Parent**: [0009. Assignments & Follower Suggestions](../0009-assignments-follower-suggestions/index.md)

## Overview

Implement Slice 7: Group Assignment Detail (`Screens/53`), Interactive Group Sign-Up Poll (`Screens/55`), Rep Groups Overview (`Screens/56`), and Tag Unassigned Members into Group (`Screens/57`).

## Decisions

1. **Group Assignment Detail (`Screens/53 Assignment detail · group.png`)**:
   - Displays `"Your group: Group 4 · 6 of 6 · full · joined Thu 5 Nov"` card, `"Members 6"` roster (`Chioma Okafor (you)`, `Tunde Ibrahim`, `Ifeoma Bello`, `Kelechi Uba`, `Sade Ajayi`, `Musa Danjuma`), and `"Switch group"` button (enabled until `Mon 9 Nov, when joining closes`).
2. **Interactive Group Poll (`Screens/55 Group poll.png`)**:
   - Displays `"Which group are you in?"` with `"Max 6 per group · joining closes Mon 9 Nov · you can switch until then"`.
   - Lists groups (`Group 3 · 4 of 6`, `Group 4 · 5 of 6 · you're in`, `Group 5 · Full (6/6)` with lock icon) and footer `"98 of 128 have joined a group · 30 not yet"`.
3. **Rep Groups Overview & Tagging (`Screens/56` & `57`)**:
   - Rep overview (`Screens/56 Groups · rep view.png`) shows `"98 of 128 have joined a group"`, top-right lock toggle, `"Not in a group · 30 members · tag them in"`, and `Group 1` through `Group 6`.
   - Tagging view (`Screens/57 Tag into Group 6.png`) provides member search, multi-select checkboxes (`Ifeoma Bello -> Group 6`, `Kunle Adeyemi -> Group 6`, `Amaka Eze`, `Bola Hassan`, `Daniel Osagie`), and `"Add 2 to Group 6"` primary CTA.
