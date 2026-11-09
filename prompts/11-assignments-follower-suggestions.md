# 11. Assignments & Follower Suggestions

Status: done
Spec: `docs/specs/0009-assignments-follower-suggestions/index.md`

## Goal

Build the Assignments List/Calendar view (`Screens/50–51`), Solo Assignment Detail (`Screens/52`), Follower Suggestion from Class (`Screens/47–48`), Rep Post Assignment (`Screens/54`), and Rep Review Suggestions (`Screens/58`).

## Steps

1. Upgrade `src/app/(tabs)/assignments.tsx` with `List | Calendar` toggle (`Screens/50–51`) and navigation to `/assignment/[id]` and `/assignment/add`.
2. Create `src/app/assignment/add.tsx` supporting Follower Suggestion (`Screens/47–48`), Rep Post Assignment (`Screens/54`), and Rep Review Suggestions (`Screens/58`).
3. Create `src/app/assignment/[id].tsx` supporting Solo Detail (`Screens/52`).

## Result

Implemented `src/app/(tabs)/assignments.tsx`, `src/app/assignment/add.tsx`, and `src/app/assignment/[id].tsx` matching `Screens/47–48`, `50–52`, `54`, and `58`.
