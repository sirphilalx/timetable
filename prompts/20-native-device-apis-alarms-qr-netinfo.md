# 20 · Native Device APIs: Local Alarms, QR Camera Scanner, Clipboard & NetInfo Auto-Sync

Status: done

## Goal

Students receive real local device notifications before classes and assignments (`expo-notifications`), scan classmate QR codes with the live hardware camera (`expo-camera`), copy share codes and links to the system clipboard (`expo-clipboard`), and have their offline outbox automatically flush the moment connectivity returns (`@react-native-community/netinfo`).

## Decisions

- **Strict Platform Boundaries for Native APIs**: Place `expo-notifications` behind `src/lib/notifications.native.ts` / `src/lib/notifications.web.ts` and `expo-camera` behind `src/components/timetable/QrScannerView.native.tsx` / `src/components/timetable/QrScannerView.web.tsx` so `npx expo export -p web` continues to bundle with zero native module leaks.
- **Wall-Clock Local Alarm Scheduling & Quiet Hours**: Schedule upcoming class and assignment notifications using `buildClassReminderPayload` and `isWithinQuietHours` (`src/lib/reminders.ts`), creating a high-priority Android notification channel (`tt-class-reminders`) and persisting student reminder preferences (`30 min` / `1 hour`, toggles, battery check) in `platformStorage`.
- **Live QR Code Parsing with Simulator Fallback**: `QrScannerView.native.tsx` uses `CameraView` (`barcodeTypes: ["qr"]`) to extract 6-character share codes from either raw codes (`CSC3X9`) or join URLs (`https://.../join/CSC3X9`, `tt://join/CSC3X9`), while keeping a tap-to-simulate action when running in an emulator without a camera feed.
- **Automatic NetInfo Reconnection Sync**: Attach a `NetInfo.addEventListener` listener in `useTimetable` that triggers `flushSyncOutbox()` and `pullSubscribedGroupsFromCloud()` whenever the device reconnects.

## Out of scope

- Remote APNs/FCM push notification servers (all class and assignment alarms are scheduled locally on-device per spec 0007).

## Steps

### 1. Install SDK-Compatible Native Packages & Configure Platform Adapters

Install `expo-notifications`, `expo-camera`, and `expo-clipboard` via `npx expo install`. Create `src/lib/notifications.ts` (`.native.ts` / `.web.ts`), `src/lib/clipboard.ts`, and `src/components/timetable/QrScannerView.tsx` (`.native.tsx` / `.web.tsx`), and add camera/notification permission descriptions to `app.json`.

### 2. Wire Local Class & Assignment Alarms, Reminder Preferences & Setup Check

Expand `src/lib/reminders.ts` with persisted reminder preferences (`loadReminderPreferences`, `saveReminderPreferences`) and `syncScheduledClassAlarms()`. Connect `src/app/settings/reminders.tsx` to persist changes and reschedule alarms, and connect `src/app/settings/reminder-check.tsx` to request OS notification permissions, fire a real local test notification (`sendTestReminderNotification`), and open OS battery settings (`Linking.openSettings`).

### 3. Wire Live QR Camera Scanner, System Clipboard & NetInfo Auto-Sync

Update `src/app/join/scan.tsx` to render `QrScannerView` and navigate to `/join/[code]` on QR detection. Update `src/components/timetable/ShareClassSheet.tsx` to copy share codes and join URLs to the system clipboard via `copyToClipboard()`. Add a `NetInfo.addEventListener` reconnection hook in `src/hooks/useTimetable.ts` that automatically flushes `sync_outbox` and pulls remote updates when connectivity is restored.

## Verification

- Run `npm run format && npm run check` (`tsc --noEmit`, `expo lint`, `prettier --check`) with zero errors.
- Run `npx expo export -p web` to verify static web export succeeds with zero native module leaks.
- Open `/settings/reminder-check` and tap **Send a test reminder** to verify the OS notification permission check and immediate local notification dispatch.
- Open `/join/scan` to verify the camera permission flow and QR code parser, and test **Tap to copy** in `ShareClassSheet` to confirm system clipboard copy.

## AGENTS.md updates

- Under **Who owns what → Reminders & Alarms**: document `src/lib/notifications.native.ts` / `.web.ts`, `syncScheduledClassAlarms` in `src/lib/reminders.ts`, and `QrScannerView` platform boundary files.

## Result

- Installed SDK-compatible `expo-notifications`, `expo-camera`, and `expo-clipboard` packages and configured `app.json` plugins and permission strings.
- Created platform-isolated modules (`src/lib/notifications.native.ts` / `.web.ts`, `src/lib/clipboard.native.ts` / `.web.ts`, and `src/components/timetable/QrScannerView.native.tsx` / `.web.tsx`) so web export bundles with zero native module leaks.
- Expanded `src/lib/reminders.ts` with persistent reminder preferences (`loadReminderPreferences`, `saveReminderPreferences`), immediate test notification dispatch (`sendTestReminderNotification`), and automatic 7-day class/assignment alarm scheduling (`syncScheduledClassAlarms`).
- Wired `src/app/settings/reminders.tsx`, `src/app/settings/reminder-check.tsx`, `src/app/join/scan.tsx`, `src/components/timetable/ShareClassSheet.tsx`, and `src/hooks/useTimetable.ts` (including automatic `NetInfo` reconnection outbox flushing and cloud pull).
