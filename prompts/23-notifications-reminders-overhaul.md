# 23 · End-to-End Notifications, Local Reminders & Per-Course Controls

Status: done

## Goal

Make local push notifications, reminder scheduling, per-course reminder/check-in controls, notification tap deep-linking, and the in-app Notifications inbox (`/notifications` + Today's Bell badge) work end-to-end from real student data with zero hardcoded seed items.

## Decisions

- **Dynamic Live In-App Notifications Inbox (`src/lib/reminders.ts`, `src/hooks/useTimetable.ts`, `src/app/notifications.tsx`, `src/app/(tabs)/index.tsx`)**:
  - Remove hardcoded mock items from `src/app/notifications.tsx`.
  - Derive and persist a live in-app notifications feed (`InAppNotificationItem`) from real timetable events: class moves & cancellations (`moveClassOccurrence`, `cancelClassOccurrence`, rep broadcasts), upcoming class/exam reminders, assignment due alerts & follower suggestions, and post-class check-in prompts.
  - Group items into **Today** and **Earlier**, support marking individual or all notifications as read, and show a clean empty state when no notifications exist.
  - Show the 8px red unread badge on Today's Bell icon (`src/app/(tabs)/index.tsx`) **only** when there is at least one unread notification.
- **Full Local Push Notification Scheduling (`src/lib/reminders.ts`, `src/lib/notifications.native.ts`, `src/lib/notifications.web.ts`)**:
  - **Wall-Clock Date Rollback & Local Timezone Offset**: Fix `buildClassReminderPayload()` so early-morning classes (e.g., `00:15` with a 60-minute lead time) roll back to the previous calendar date and use the device's real local timezone offset (`formatLocalWallClockIso`) instead of a hardcoded date/offset.
  - **Class, Exam & Study Session Reminders**: Schedule local notifications `30 min` or `1 hour` before classes, exams, and personal reading/study sessions (respecting global `classesEnabled`, quiet hours `10:00 pm – 6:00 am`, and per-course reminder overrides).
  - **Assignment Due Alerts**: Schedule **both** the evening-before reminder (`7:00 pm` the day before due date) and the `3 hours before` reminder when `assignmentsEnabled` is on.
  - **Morning Daily Summary (`7:00 am`)**: When `morningSummaryEnabled` is on, schedule a `7:00 am` local notification summarizing how many classes, study sessions, and assignments are on the student's schedule for that day.
  - **Post-Class Check-In Prompts**: Schedule a check-in notification `10 min after class` (and an `8:00 pm` follow-up if unanswered) for courses with check-ins enabled.
  - **Immediate Move & Cancellation Alerts**: When a class is moved or cancelled and `movesEnabled` is on, trigger an immediate local notification (`sendImmediateNotification`) and append an unread item to the in-app Notifications feed.
- **Notification Tap Deep-Linking (`src/lib/notifications.native.ts`, `src/lib/notifications.web.ts`, `src/app/_layout.tsx`)**:
  - Register a notification response listener (`subscribeToNotificationResponses`) in `RootNavigation` (`src/app/_layout.tsx`) so tapping any system notification banner marks the corresponding in-app notification as read and navigates directly to `/class/[id]`, `/assignment/[id]`, or `/(tabs)`.
- **Dynamic Per-Course Reminder & Check-In Controls (`src/app/settings/check-ins.tsx`, `src/app/course/[id].tsx`, `src/app/settings/reminders.tsx`)**:
  - Replace the hardcoded `CHECKIN_COURSES` array in `src/app/settings/check-ins.tsx` with the student's real `data.courses` from `useTimetable()`, persisting per-course check-in toggles (`courseCheckInsEnabled`) and per-course reminder overrides (`courseRemindersEnabled`) in `ReminderPreferences`.
  - Add a per-course **Reminders & check-ins** control card on `src/app/course/[id].tsx` (matching the note in `src/app/settings/reminders.tsx`: _"Open a course in My courses to change just that one"_).
  - Immediately re-run `syncScheduledClassAlarms()` whenever any reminder or check-in preference is changed in Settings or Course Detail.

## Out of scope

- Remote APNs/FCM marketing broadcasts unrelated to the student's courses and timetable.

## Steps

### 1. Upgrade `src/lib/notifications.*` & `src/lib/reminders.ts` Engine

- Add `subscribeToNotificationResponses` to `src/lib/notifications.native.ts` and `src/lib/notifications.web.ts` so tapping a system notification emits the notification's `data` payload (`route`, `occurrenceId`, `assignmentId`, `notificationId`).
- Extend `ReminderPreferences` in `src/lib/reminders.ts` with `courseRemindersEnabled: Record<string, boolean>` and `courseCheckInsEnabled: Record<string, boolean>`, plus persistent in-app notification store helpers (`loadInAppNotifications`, `appendInAppNotification`, `markNotificationRead`, `markAllNotificationsRead`).
- Fix `buildClassReminderPayload` date rollback and local timezone offset calculation, and expand `syncScheduledClassAlarms` to schedule:
  1. Class, Exam, and Study session reminders (`leadMinutes` before start).
  2. Assignment reminders (evening before at `19:00` and `3 hours` before due time).
  3. Morning summary at `07:00` when `morningSummaryEnabled` is true.
  4. Post-class check-in prompts `10 min` after class end (and `20:00` follow-up when unanswered) for courses with check-ins enabled.

### 2. Wire Live Notifications & Rescheduling into `useTimetable` & `RootLayout`

- Update `src/hooks/useTimetable.ts` so `syncScheduledClassAlarms` passes upcoming classes, exams, study sessions, and assignments, and re-runs whenever reminder preferences or timetable items change.
- Trigger immediate local notifications and in-app notification entries when classes are moved or cancelled (`useMoveClassMutation`, `useCancelClassMutation`, and rep broadcasts) or when assignments are added/suggested.
- Register `subscribeToNotificationResponses` in `src/app/_layout.tsx` to deep-link to `/class/[id]`, `/assignment/[id]`, or `/(tabs)` and mark the tapped notification as read.

### 3. Connect Dynamic Notifications Inbox, Today Bell Badge & Per-Course Settings

- Update `src/app/notifications.tsx` to render live notifications from real timetable activity (grouped into `Today` and `Earlier`, with `Mark all read`, deep-link navigation on tap, and a calm empty state when none exist).
- Update `src/app/(tabs)/index.tsx` so the Bell icon's red unread dot reflects live unread notification count.
- Update `src/app/settings/check-ins.tsx` to list the student's real courses dynamically (with an empty state if no courses exist yet), `src/app/course/[id].tsx` to allow toggling per-course reminders and check-ins, and `src/app/settings/reminders.tsx` to immediately reschedule alarms when any preference changes.

## Verification

- Run `npm run format && npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check`) with zero errors.
- Run `npx expo export -p web` to confirm static web export succeeds with platform-isolated notification modules.
- Verify end-to-end:
  1. Fresh state shows 0 unread notifications on Today's Bell icon and a clean empty state in `/notifications`.
  2. Moving or cancelling a class (or sending a test reminder in `Settings → Reminder setup check`) triggers a local notification, adds an unread item to `/notifications`, and lights up the Bell unread dot on Today.
  3. Tapping a notification item or OS notification banner marks it as read and navigates to the target Class, Assignment, or Today screen.
  4. Toggling reminder preferences in `Settings → Reminders`, `Settings → Check-ins`, or a course's detail screen (`/course/[id]`) persists and immediately reschedules device alarms.

## AGENTS.md updates

- Under **Who owns what → Reminders & Alarms**: document that `src/lib/reminders.ts` and `src/lib/notifications.native.ts` / `.web.ts` manage class/exam/study reminders, evening-before + 3h assignment alerts, 7:00 am morning summaries, post-class check-in prompts, per-course overrides, OS notification tap deep-linking, and the live in-app Notifications inbox (`/notifications`).

## Result

- Upgraded `src/lib/notifications.native.ts`, `src/lib/notifications.web.ts`, and `src/lib/notifications.ts` with `subscribeToNotificationResponses` so tapping a system notification banner deep-links to `/class/[id]`, `/assignment/[id]`, or `/(tabs)` and marks the corresponding in-app notification as read (`src/app/_layout.tsx`).
- Overhauled `src/lib/reminders.ts` with local wall-clock date rollback (`buildLocalWallClockDate`), real local timezone offsets, preference change subscriptions (`subscribeToReminderPreferenceChanges`), per-course reminder and check-in overrides (`courseRemindersEnabled`, `courseCheckInsEnabled`), and persistent in-app notification state (`loadInAppNotifications`, `appendInAppNotification`, `markNotificationRead`, `markAllNotificationsRead`).
- Expanded `syncScheduledClassAlarms` (`src/lib/reminders.ts` & `src/hooks/useTimetable.ts`) to schedule class, exam, and study session reminders (`30 min` or `1 hr` before), assignment due alerts (`7:00 pm` evening before and `3 hours` before due), `7:00 am` morning summaries, and post-class attendance check-in prompts (`10 min` or `30 min` after class + `8:00 pm` follow-up), plus immediate notifications when classes are moved or cancelled (`notifyClassMovedOrCancelled`).
- Replaced hardcoded mock items in `src/app/notifications.tsx` and `src/app/settings/check-ins.tsx` with dynamic live data (`useInAppNotifications` and `data.courses`), wired Today's Bell unread badge (`src/app/(tabs)/index.tsx`) to live `unreadCount`, and added per-course reminder & check-in toggles on `src/app/course/[id].tsx`.
