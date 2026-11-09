# 26. Full Course & Schedule Management (Edit, Delete & Class Slot Controls)

Status: done
Spec: docs/specs/0004-core-timetable-loop/index.md, docs/specs/0011-class-management-rollover-sync/index.md

## Goal

Enable students to thoroughly manage and delete any course they created—including editing course details (code, title, units, colour, lecturer name/contact), editing or deleting individual recurring/one-time class times, and deleting a course cleanly from both local storage/SQLite and the timetable views.

## Decisions

- **Full CRUD Mutations in `useTimetable.ts`**:
  - `useUpdateCourse()`: Updates a course's `code`, `title`, `units`, `color`, `lecturerName`, `lecturerPhone`, and `lecturerEmail` in `memoryStore.courses`, on-device SQLite (`courses`), and `sync_outbox`, and cascades the updated code/title/color to linked `exams`.
  - `useDeleteCourse()`: Soft-deletes/removes the course from `memoryStore.courses` and SQLite (`courses`), and cleans up all associated `classRules`, `classOccurrences`, `assignments`, `exams`, and linked personal study sessions (`personalEvents`), then reschedules device alarms.
  - `useUpdateClassRule()` & `useDeleteClassRule()` / `useDeleteClassOccurrence()`: Allows editing a recurring class slot's day, start/end time, venue, or class type (`lecture`, `tutorial`, `lab`), or deleting an individual class slot without deleting the whole course.
- **Course Detail Screen (`src/app/course/[id].tsx`)**:
  - Add an **Edit course** button in the header and an inline/modal **Edit Course Sheet** to update course code, title, credit units, lecturer name, and 8 Cadence colour swatches.
  - Add per-slot **Edit** and **Delete** controls on each class time under **This week** so students can adjust or remove a single lecture/tutorial/lab time or add new ones.
  - Add a **Delete course** destructive card/button at the bottom of the Course Detail screen with a confirmation dialog warning how many class times and assignments will be removed.
- **My Courses (`src/app/settings/courses.tsx`) & Onboarding Courses (`src/app/setup/courses.tsx`)**:
  - Remove the leftover hardcoded `"STA 311"` fallback in `src/app/settings/courses.tsx` so only real courses appear.
  - Add quick **Edit** and **Delete** action buttons on each user-created course row in both `src/app/settings/courses.tsx` and `src/app/setup/courses.tsx`.
- **Class Detail Screen (`src/app/class/[id].tsx`)**:
  - Add a **Delete this class slot** / **Edit course** option for user-created classes so students can remove or manage a class directly from the timetable tap view.

## Out of scope

- Deleting courses owned by a remote shared class for other students (shared courses continue to be managed via subscription settings / unfollowing or course selection in `class-settings.tsx`).

## Steps

1. **Add Course & Schedule CRUD Hooks (`src/hooks/useTimetable.ts`)**:
   - Implement `useUpdateCourse`, `useDeleteCourse`, `useUpdateClassRule`, `useDeleteClassRule`, and `useDeleteClassOccurrence` with SQLite + per-account storage persistence and `sync_outbox` queueing.
2. **Upgrade Course Detail Screen (`src/app/course/[id].tsx`)**:
   - Add the **Edit Course Modal** (code, title, units, lecturer, 8 colour swatches), per-class-rule **Edit / Delete** actions, and the **Delete Course** confirmation modal.
3. **Upgrade My Courses (`src/app/settings/courses.tsx`), Setup Courses (`src/app/setup/courses.tsx`), and Class Detail (`src/app/class/[id].tsx`)**:
   - Remove the hardcoded `STA 311` fallback in `src/app/settings/courses.tsx`.
   - Add quick edit/delete actions on user-created courses in `src/app/settings/courses.tsx` and `src/app/setup/courses.tsx`, and allow deleting a class rule/occurrence from `src/app/class/[id].tsx`.
4. **Verify**:
   - Run `npm run format && npm run check && npx expo export -p web`.

## Verification

- [x] `npm run check` passes (`tsc --noEmit`, `expo lint`, `prettier --check`).
- [x] `npx expo export -p web` succeeds with zero errors.
- [x] User can edit a course's code, title, units, lecturer, and colour and see it reflected immediately on Today and Classes.
- [x] User can edit or delete individual class schedule slots on a course.
- [x] User can delete a course from Course Detail, Settings -> My courses, or Setup -> Your courses, and it disappears from all views and persists across reloads.

## Result

Implemented full CRUD hooks (`useUpdateCourse`, `useDeleteCourse`, `useUpdateClassRule`, `useDeleteClassRule`, and `useDeleteClassOccurrence`) in `src/hooks/useTimetable.ts` and wired course editing, class slot editing/removal, and course deletion across `src/app/course/[id].tsx`, `src/app/settings/courses.tsx`, `src/app/setup/courses.tsx`, `src/app/class/[id].tsx`, and `src/app/(tabs)/classes.tsx`.

## AGENTS.md updates

- Document `useUpdateCourse`, `useDeleteCourse`, `useUpdateClassRule`, and `useDeleteClassRule` under Local Database & Offline Store in `AGENTS.md`.
