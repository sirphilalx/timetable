# TT: Product Requirements Document

Oct 22, 2026 · @Philiwonder\_

## Overview

TT (short for timetable, listed in the app stores as "TT: Student Timetable") is a mobile app that helps university and college students keep their classes, reading time, assignments and personal events in one place, with reminders before each one and a quick check-in after each class.

Most students keep their timetable as a photo of the department notice board or a screenshot passed around on WhatsApp. Venues change, classes get moved or cancelled, and assignment details live in someone's chat history. Students who do try a planner app give up because entering a full semester by hand takes too long.

TT addresses this in two ways. It turns a timetable into reminders and records (attendance, assignments, study hours) that the student can act on. And it lets one organized student, usually the course rep, build a timetable or assignment list once and share it with the whole class through a link. Classmates install the app, the tab imports itself, and later changes from the course rep reach everyone.

The app has five main areas:

- Class timetable: lectures, tutorials and labs tied to registered courses
- Reading timetable: personal study sessions, linked to courses
- Exam timetable: exam dates, times and venues for the semester, with countdowns
- Others: personal events such as birthdays, gym sessions and church services (private, never shared)
- Assignments: work collected after each class, shown by due date

Each area can be viewed as a calendar or as a list. A Today screen opens the app and brings together the next class, what is due soon and anything the reps changed.

## Goals and success metrics

TT succeeds if students keep using it past the first month of a semester and if most new users arrive through a shared link rather than an ad.

| Goal | Metric | First target (proposed) |
| --- | --- | --- |
| Students set up quickly | Time from install to first class on the timetable | Under 5 minutes, under 2 minutes via a shared link (sign-up included) |
| Growth through sharing | Share of new installs that come from a TT link or share code | 50% or more |
| Students keep using it | Users still active 30 days after install | 40% or more |
| Check-ins get answered | Post-class check-ins answered within 24 hours | 60% or more |
| Reminders are trusted | Reminders delivered on time (within 1 minute of schedule) | 99% |

The targets are starting points to revise after the first pilot semester.

## Users and personas

TT has three kinds of user, and the same person can be more than one. The design has to make the organizer's job easy, because the follower's experience depends on it.

| Persona | Who they are | What they need from TT |
| --- | --- | --- |
| Organizer | Course rep, class governor, or the student who always has the timetable first. Up to three per class: one owner and two editors. | Build the class timetable and assignment list fast, share it once, push changes (venue moved, class cancelled) to everyone without re-sharing |
| Follower | The typical student. Wants reminders but will not type in a semester of classes. | Import from a link in under a minute, get reminders, answer check-ins with one tap, keep personal notes and reminder times |
| Self-organizer | A student whose class has no organizer, or who studies on their own schedule | Enter courses and classes manually, plan reading sessions, track attendance and assignments |

A single student usually follows several sources: the course rep's class timetable, a study group's reading timetable, and their own Others tab.

## Scope

The first release (MVP) covers what a student needs in the first week of a semester: courses, the class timetable, reminders, check-ins, assignments, and sharing. Everything else follows once real usage shows what matters.

| Feature | MVP | Release 2 | Later |
| --- | --- | --- | --- |
| Course registration (onboarding and settings) | Yes |  |  |
| Import preview before sign-up; date of birth; parental consent for under-18s | Yes |  |  |
| Today screen, bottom bar navigation, avatar menu | Yes |  |  |
| Class timetable, list view with week strip, calendar views | Yes |  |  |
| Recurring classes, semester dates, cancel or move one class | Yes |  |  |
| Reminders with chosen lead time, Reminder setup screen | Yes |  |  |
| Combined post-class check-in (attendance and assignment) | Yes |  |  |
| Notifications screen | Yes |  |  |
| Assignments tab, solo and group, with Due soon, Missing and Done | Yes |  |  |
| Group sign-up poll, tagging, group and class member counts | Yes |  |  |
| Create shared class, shared class with one link, live updates | Yes |  |  |
| QR share card, projector mode, in-app scanner | Yes |  |  |
| Owner plus up to two editors, ownership transfer | Yes |  |  |
| Followers suggest assignments to editors | Yes |  |  |
| Semester end and rollover, archived semesters | Yes |  |  |
| Pause a class, remove a follower, report a class | Yes |  |  |
| Offline use, restore on a new phone | Yes |  |  |
| Reading timetable, linked to courses, mark session done |  | Yes |  |
| Share reading timetable |  | Yes |  |
| Exam timetable tab with countdowns and exam reminders |  | Yes |  |
| Share exam timetable |  | Yes |  |
| Others tab (private events) |  | Yes |  |
| Home-screen widget (next class, next assignment) |  | Yes |  |
| Linked sign-in methods |  | Yes |  |
| Reports: attendance %, hours per course, study hours | Basic attendance % | Full reports |  |
| Notification sound and vibration choices |  | Yes |  |
| Ads |  | Yes |  |
| Revision sessions suggested before each exam |  |  | Yes |
| Share a single event from Others |  |  | Yes |
| Set up a class from a photo of a printed timetable |  |  | Yes |
| Typed class entry ("CSC 301 Monday 10am LT2") |  |  | Yes |

Out of scope for now: grades and GPA tracking, chat between students, lecturer or school admin accounts, and a web version.

## Business model

TT is free to download and earns money from paid ads that never interrupt the student. A feature that is free at launch stays free: nothing students rely on is moved behind a paywall later. Ads start in Release 2, after the pilot, so they do not slow early adoption.

- Ads appear only in calm places: a single banner at the bottom of list views and the weekly report.
- No ads in reminders, check-ins, notifications, the import preview, or during onboarding.
- No full-screen or video ads that play on their own.
- Ads use contextual targeting only. Attendance, assignments, notes and the Others tab are never sent to an ad network.

## Functional requirements

Requirements are numbered so they can be referenced in design, development and testing. MVP items are listed first in each group.

### 1. Onboarding and courses

- FR-1.1 A student who arrives through a shared link or QR code sees the import preview first, without an account, and is asked to sign up only when they tap Follow. A student who opens TT directly signs up first, then chooses between joining a class (link, code or QR) and setting up manually. Sign-up uses Google, Apple or email, asks for date of birth, and asks for a display name (pre-filled from Google or Apple where available). Students under 18 go through the parental-consent step (FR-11.8). Notification permission is asked right after the first follow or the first class added, with a one-line reason, never during sign-up.
- FR-1.2 Manual setup asks for institution (optional), current semester start and end dates, and the courses for that semester. Students who follow a shared class skip the semester dates; they come from the class (FR-11.1).
- FR-1.3 Each course has: course code (required), course title (required), units (required, number), lecturer name (optional), course description (optional), level and semester (optional), and a colour (auto-assigned, changeable).
- FR-1.4 Courses can be added, edited, archived or deleted from Settings at any time. Archiving keeps past attendance and assignment records.
- FR-1.5 A new semester starts with an empty course list, with an option to carry courses over.

### 2. Navigation, Today screen and views

- FR-2.1 The bottom bar has five items: Today, Classes, Assignments, Exams and More. More holds Reading and Others. In the MVP the bar shows Today, Classes and Assignments; Exams and More are added in Release 2.
- FR-2.2 Every main screen has a header with the page title, a class switcher (shown when the student follows more than one shared class) and the student's avatar. The avatar menu opens Reports, Settings, Notifications, and Join a class (scan a QR code or enter a share code).
- FR-2.3 Today is the first screen the app opens on. It shows, in this order: the next class (course, time, venue, a countdown, and a clear flag if it was moved or cancelled), the rest of today's classes, assignments due in the next 3 days (and exams within 7 days, from Release 2), pending check-ins, and the latest change notices from the reps. Every item opens its detail screen. Banners at the top of Today show when reminders are off (with a button to the Reminder setup screen), when a followed class is paused, and when the semester has ended.
- FR-2.4 On a 360 × 800 screen, the next class and its venue are visible on Today without scrolling. From Release 2, a home-screen widget in small and medium sizes shows the next class with its time and venue; the medium size also shows the next assignment due.
- FR-2.5 Classes, Assignments, Exams, Reading and Others each support a list view and a calendar view (day, week, month). The list view is the default everywhere and has a strip of the week's dates across the top, with a dot under any day that has entries. Month view shows dots on busy days and opens the selected day's list below the grid. The day and week hour grids remain available as secondary views. The app remembers the last view used per tab.
- FR-2.6 Entries are coloured by course. Entries from a shared class carry a small source badge (for example, "from CSC 300L rep").
- FR-2.7 The calendar opens on today; the list view starts at the next upcoming entry. Classes that have already ended today are shown faded, on Today and in the list view.
- FR-2.8 A Notifications screen lists change notices, assignment suggestions, editor invites and ownership transfers from the last 30 days, so a notice swiped away on the phone can still be found.

### 3. Class schedule

- FR-3.1 Adding a class: pick the course from a dropdown of registered courses, then set class type (lecture, tutorial, lab), one or more days of the week, start and end time, and venue. Picking several days creates the class on each of them in one step. The form pre-fills the last venue used for that course, a default length (1 hour, changeable in Settings) and weekly repeat.
- FR-3.2 Classes repeat weekly between the semester start and end dates by default. A one-off class (extra lecture, makeup class) can also be added.
- FR-3.3 Breaks or holidays can be added as date ranges with no classes.
- FR-3.4 A single occurrence can be cancelled or moved (new date, time or venue) without changing the weekly pattern.
- FR-3.5 Clashing classes are allowed but shown with a warning.

### 4. Reminders

- FR-4.1 The student sets a default lead time (for example 15 min, 30 min, 1 hour, 2 hours) and can override it per course or per class.
- FR-4.2 A reminder leads with what and where (for example "CSC 301 in 30 min, LT2") and also shows the course title, class type and start time.
- FR-4.3 Reminders are scheduled on the device so they fire without an internet connection.
- FR-4.4 When a shared class is moved or cancelled by an owner or editor, followers' reminders update on the next sync, and the follower gets a change notice ("MTH 201 moved to LT2, 10am"). If the reminder for that class has already gone out, the notice is sent immediately and says the earlier reminder is no longer right ("Cancelled: CSC 301 at 10am").
- FR-4.5 Assignment reminders fire at chosen intervals before the due date (default: 2 days and 1 day before, and the morning it is due).
- FR-4.6 Reading sessions and Others events have their own reminder settings (Release 2).

### 5. Post-class check-in

- FR-5.1 When a class ends, TT sends one notification asking about it, with quick actions: Attended, Missed, Add assignment. If two clashing classes end together, one check-in asks which of them the student attended.
- FR-5.2 Tapping Add assignment opens a short form pre-filled with the course (see section 6).
- FR-5.3 If the student follows a shared assignments tab and the owner has already posted an assignment for that class, the check-in shows it and skips the assignment question.
- FR-5.4 Unanswered check-ins collect in a Pending check-ins list, answerable for up to 7 days. After that the class is marked Unknown. Unknown classes are left out of the attendance percentage and shown as their own count.
- FR-5.5 A cancelled class gets no check-in and does not count toward attendance.
- FR-5.6 The student can turn check-ins off per course (for example, a course they audit).

### 6. Assignments

- FR-6.1 Fields: course (required), title (required), description (optional), due date and time (required), type (solo or group), and the student's own status (not started, in progress, submitted). An assignment with a date but no time is due at 11:59 pm and shows as "Due Friday". An assignment posted after its due date goes straight to Missing, marked "posted after the due date". If a rep deletes an assignment, it leaves everyone's lists with a notice.
- FR-6.2 Calendar views show each assignment as a due-date marker on its due date, never as a time block beside classes. The list view has four sections: Due soon (grouped into This week, Next week and Later, each with a count, nearest due date first), Missing (past due and not submitted, most recently missed first), Done (most recently submitted first), and for followers, Suggested. Missing items carry a red badge with plain wording such as "2 days late"; the card itself stays neutral.
- FR-6.3 Assignments can be added from a check-in, from the Assignments tab, or arrive from a shared class. On a shared class, a follower's assignment goes to the editors as a suggestion (FR-8.7).
- FR-6.4 On assignments from a shared class, the follower can still set their own status, personal notes and reminders. Edits by the owner or editors to title, description and due date overwrite the shared fields only.
- FR-6.5 Submitted assignments move to a Done section and stay searchable.
- FR-6.6 A solo assignment created by the owner or an editor goes to every member of the class.
- FR-6.7 For a group assignment, the owner or editor adds the groups by name (for example Group 1 to Group 8, or "Team Alpha"), with an optional maximum size per group and an optional deadline for joining.
- FR-6.8 The group assignment goes to every member as a poll: "Which group are you in?", listing the group names. Picking a name joins that group. A student can switch groups until the editors lock the groups or the joining deadline passes.
- FR-6.9 The owner or an editor can also tag followers into a group by display name. A tagged follower gets a notice ("You've been added to Group 4 for CSC 305 project") and the assignment shows in their list with the group name.
- FR-6.10 Each group shows its member count (and the maximum, if set). The assignment shows how many members have joined a group and how many have not, so the reps know who to follow up. Members of a group can see each other's display names. A full group shows "Full (6/6)" and can't be picked. Tagging a student who is already in another group moves them, with a notice. If a rep removes a group, its members go back to "not in a group" and are told. Reps see a "not in a group" list to follow up after the joining deadline.
- FR-6.11 Members appear in group lists and tag searches under the display name on their account.
- FR-6.12 On a personal assignment (not from a shared class), the student types their group name as a note.

### 7. Reports

- FR-7.1 Per course: scheduled classes, attended, missed, unknown, and attendance percentage for the semester and the current week.
- FR-7.2 The student sets an attendance threshold (default 75%). TT warns when a course falls below it ("You're at 68% for MTH 201") and shows how many of the remaining classes they need to attend to get back above it.
- FR-7.3 Weekly summary: classes and hours per course, total hours, assignments due this week (Release 2 adds study hours from the reading timetable).
- FR-7.4 Reports are calculated on the device from local data.

### 8. Shared classes, roles and following

Every student has an account, and any student can build tabs on their own phone. Sharing turns those tabs into a shared class that classmates follow, and that class is run by up to three reps.

| Action | Owner | Editor | Follower |
| --- | --- | --- | --- |
| Edit classes, assignments and exams | Yes | Yes | No |
| Add personal notes to shared entries | Yes | Yes | Yes |
| Approve assignments suggested by followers | Yes | Yes | No, can suggest |
| Create groups for a group assignment | Yes | Yes | No |
| Join a group from the poll | Yes | Yes | Yes |
| Tag members into a group | Yes | Yes | No |
| See the class member count and group counts | Yes | Yes | Yes |
| See members' display names | Yes | Yes | Own group only |
| Send the class link or share code to others | Yes | Yes | Yes |
| Add or remove editors | Yes | No | No |
| Transfer ownership | Yes | No | No |
| Regenerate the link, delete the shared class | Yes | No | No |
| Account needed | Yes | Yes | Yes |

- FR-8.1 A shared class groups the Classes, Assignments and Exams tabs for one set of students (for example "CSC 300L, UNIBEN, 2026/2027 first semester"). One link or share code follows all three. A Reading tab can be shared on its own, for a study group. Others is never shared.
- FR-8.2 The student who first shares a class becomes its owner. Before the link is made, the rep names the class on a Create shared class screen: class name, institution, level, session and semester (dates come from the rep's semester setup).
- FR-8.3 The owner can add up to two editors by sending an editor invite link. The invited student must accept. The owner can remove an editor at any time.
- FR-8.4 The owner can transfer ownership to an editor or to any follower, for example when a student set up the class before the course rep was chosen. The new owner must accept. The old owner then becomes an editor, or leaves if they choose.
- FR-8.5 Every change made by the owner or an editor is broadcast to all followers on sync. Changes that affect the next 7 days (class moved or cancelled, new assignment, exam date or venue changed) also send a change notice. A change log shows who made each edit.
- FR-8.6 Followers cannot change shared entries. They can add personal notes to any shared entry. Their reminder times, attendance answers and assignment status are their own records and settings, never shared.
- FR-8.7 When a follower uses Add assignment from a check-in on a shared class, the assignment goes to the class editors as a suggestion and shows in the follower's own list marked "suggested". When an owner or editor approves it, it is broadcast to everyone. If they reject it, the follower gets a notice and the item stays in their own list as a personal assignment they can keep or delete. Matching suggestions (same course and day) from several followers reach the reps as one item marked "suggested by 6".
- FR-8.8 A student can follow more than one shared class (for example a carryover course in another level) and keep their own personal tabs alongside.
- FR-8.9 Sharing creates a link, a short share code (for example CSC3X9) and a QR code. The share sheet sends the link and code on WhatsApp, SMS or any installed app. The QR code uses rounded indigo dots with the TT mark in the centre (highest error-correction level, clear margin around it) and sits on a share card ("Scan to join CSC 300L" plus the member count) sized for a WhatsApp status or Instagram story, which the rep can save as an image. A projector mode shows the QR code full screen at maximum brightness so a lecture hall can scan it at once.
- FR-8.10 Opening a link with TT installed goes straight to an import preview that needs no account: class name, the owner's display name, member count, number of courses and classes, and the date the class was created. A student who already follows the class sees "You already follow this class" with an Open button. A link that was regenerated or whose class was deleted opens a "This link no longer works" screen with a share-code field. Offline, the preview asks the student to connect and remembers the link. With TT not installed, the link opens the app store, and after install TT opens on the same preview (deferred deep link). If that fails, the student types the share code on the first screen. Scanning the QR code with the phone's camera opens the same preview, and Join a class (in the avatar menu) has a built-in scanner and a code field for students already using the app.
- FR-8.11 Following a class also imports its courses, matched to the student's own courses by course code. If the student already has their own classes for any of those courses, TT asks whether to use the rep's timetable (their own copies are hidden, not deleted) or keep their own. Where a course code matches but the title or units differ, the shared class's values are used for shared entries, and the student's own course record returns if they unfollow.
- FR-8.12 A follower can unfollow at any time and choose to keep a local copy or remove everything.
- FR-8.13 Everyone in the class sees its total member count (owner, editors and followers). The owner can regenerate the link to stop new joins and can delete the shared class (followers keep a local copy).

&#91;embedded content: share and import flow · 2 decisions\]

Whether TT is already installed, the deferred link works, or the student types the code, they reach the same preview before following the tab.

### 9. Settings

- FR-9.1 Courses (see section 1), semester dates and breaks.
- FR-9.2 Default reminder lead time, assignment reminder intervals, quiet hours, and a Reminder setup screen that checks notification permission and, on Android, exact alarms and battery optimisation, opening the right phone settings for each.
- FR-9.3 Check-ins on or off, per course.
- FR-9.4 Attendance threshold.
- FR-9.5 Notification style (Release 2): choice of sound, vibration pattern on Android, and a loud alarm-style option for classes. Volume follows the phone's own setting (see Non-functional requirements).
- FR-9.6 Account: required for every user, with a display name the student can change here. The account backs up the student's data and restores it on a new phone, where a short "Restoring your classes" state shows while reminders are rebuilt. From Release 2, Settings lets a student link sign-in methods (for example Google and Apple) to one account. Reminders ring on every phone the student is signed in on unless they turn them off on one.

### 10. Exam timetable (Release 2)

- FR-10.1 Each exam has: course (dropdown of registered courses), date, start and end time, venue, paper type (written, CBT, practical), seat or index number (optional), and notes such as materials allowed (optional).
- FR-10.2 The Exams tab has calendar and list views. The list shows the nearest exam first with a countdown ("MTH 201 in 4 days").
- FR-10.3 Exam reminders fire 1 week, 1 day and 2 hours before by default, changeable per exam.
- FR-10.4 When the first exam is added, TT offers to mark the exam period as a break, so lecture reminders and check-ins stop for those weeks.
- FR-10.5 The Exams tab can be shared like Classes. Department exam timetables usually come out for everyone at once, so one shared link saves the whole class from retyping it, and date or venue changes reach followers through live updates. Seat number and notes stay personal.
- FR-10.6 Exams have no post-exam check-in and do not count toward attendance.
- FR-10.7 Later: TT suggests revision sessions in the Reading tab during the two weeks before each exam.

### 11. Semesters, pauses, safety and young users

- FR-11.1 Semester start and end dates and breaks belong to the shared class. Followers inherit them and never see the semester-dates screen.
- FR-11.2 When the semester end date passes, the owner is asked to start the next semester (reuse courses, set new dates, then add or carry over classes). A new semester in the same academic session continues in the same shared class, so followers stay and the link keeps working. A new session (for example 300L to 400L) starts a new shared class, and followers of the old one are invited to follow it. Past semesters are archived and stay viewable, read-only, with their attendance and assignments.
- FR-11.3 The owner or an editor can edit the semester end date (recurring classes and reminders extend with it) and can pause the class "until further notice", for example during a strike. While paused, reminders and check-ins stop and followers see a banner on Today. Resuming asks for the new semester end date.
- FR-11.4 The owner and editors can remove a follower from the class. Any student can report a class to TT from the import preview or the class menu.
- FR-11.5 An owner who deletes their account must first transfer ownership. If they don't, the longest-serving editor becomes owner. If there are no editors, the class freezes as read-only and followers are told.
- FR-11.6 Ownership transfer offers expire after 7 days if not accepted. An editor who is removed while holding unsynced offline edits loses those edits and is told. When a class has two editors, the invite option is disabled with "A class can have up to 2 editors".
- FR-11.7 Display names are unique within a class. If a student's name is already taken when they follow, TT asks them to adjust it for that class (for example "Chioma O.").
- FR-11.8 Students under 18 (from the date of birth given at sign-up) must have a parent or guardian's consent before TT stores their data. The student enters the parent or guardian's name and email or phone number, and TT sends them a consent request with a plain explanation of what TT collects. Until consent is given, the student can see the import preview but cannot follow a class or save anything; TT reminds the parent once after 48 hours. A parent or guardian can withdraw consent later, which deletes the account. The exact wording and process must be checked by a lawyer against the Nigeria Data Protection Act 2023 before launch.
- FR-11.9 Member lists and group lists load in pages for very large classes (1,000 or more members); counts stay instant.

## Data model

The key design choice is to separate a shared source from each follower's personal layer, so owner updates and follower notes never overwrite each other.

| Entity | Main fields | Notes |
| --- | --- | --- |
| Student | id, name, institution, display name, email, sign-in providers, date of birth, guardian consent status (under 18) | Account required for every user |
| Semester | id, student, name, start date, end date | Holds breaks as date ranges |
| Course | id, semester, code, title, units, lecturer, description, level, colour, archived | Merged by course code on import |
| Class rule | id, course, type, weekday, start time, end time, venue, source | The weekly pattern |
| Class occurrence | rule, date, status (scheduled, cancelled, moved), override time and venue | Created on the fly; stored only when changed |
| Attendance | occurrence, student, answer (attended, missed, unknown), answered at | Personal, never shared |
| Assignment | id, course, title, description, due at, type (solo, group), source, status (live, suggested), groups locked, join deadline | Shared fields |
| Group | id, assignment, name, max size (optional) | Created by the owner or an editor |
| Group member | group, student, joined by (self or tagged), joined at | One group per student per assignment; counts come from here |
| Assignment personal | assignment, student, status, notes, reminders | Follower's own layer |
| Reading session | id, course (optional), weekday or date, start, end, done flag, source | Release 2 |
| Exam | id, course, date, start, end, venue, paper type, source | Release 2; shared fields |
| Exam personal | exam, student, seat number, notes, reminders | Follower's own layer |
| Entry note | student, entry (class, assignment or exam), text | A follower's personal note on a shared entry |
| Event (Others) | id, title, date or rule, start, end, location, reminders | Private, no source field |
| Shared class | id, name, institution, level, session and semester, semester start and end, breaks, paused, link, share code, version, member count, created at | Groups Classes, Assignments and Exams; edits bump the version |
| Shared reading | id, owner, link, share code, version | Reading tab shared on its own |
| Membership | shared class, student, role (owner, editor), added by, accepted at | One owner, at most two editors |
| Change log | shared class, entry, changed by, change, at | Shown to editors; drives change notices |
| Subscription | student, shared class or shared reading, last synced version | One per follower per source |

A reminder is a local device notification generated from these records and rebuilt after every sync.

## Non-functional requirements and platform constraints

TT must work offline, run on low-end Android phones, and be honest about what the phone lets an app control.

- NFR-1 Offline first. All viewing, editing, check-ins and reminders work without data. Changes sync when a connection returns. Creating the account on first launch needs a connection once; after that the app works offline.
- NFR-2 Low-end devices. Target Android 8 and above on phones with 2 GB RAM, and iOS 16 and above. App download under 30 MB. Every screen is checked at 200% text size, with cards growing and text wrapping instead of being cut off.
- NFR-3 Low data use. A full timetable sync should be a few kilobytes; no images in shared tabs.
- NFR-4 Reminder reliability. Reminders are scheduled locally. On Android, TT asks for exact alarm permission and guides the student to turn off battery optimisation for TT, since some phone brands kill background apps. Class and reminder times are stored as local wall-clock times together with the student's time zone, so reminders stay correct if the phone's time zone or clock changes.
- NFR-5 Notification volume. iOS does not let an app set notification volume; TT can only choose the sound. On Android, notification channels set importance, sound and vibration when first created, and after that the student controls them in system settings. TT's settings screen must explain this and link to the system page instead of showing a volume slider.
- NFR-6 Deferred deep links. Firebase Dynamic Links shut down in August 2025, so TT needs another provider (Branch or AppsFlyer OneLink) or its own setup: Play Install Referrer on Android, with the share code as the fallback on iOS.
- NFR-7 Privacy. Attendance, personal notes, group notes and the Others tab stay private to the student. Every member is shown by the display name on their account. The owner and editors can see members' display names so they can tag them into groups. Followers see counts only, plus the names of members in their own group. The change log shows editors' names only.
- NFR-8 Data protection. Handle personal data in line with the Nigeria Data Protection Act 2023 and app store rules: a clear privacy policy, account deletion from inside the app, Sign in with Apple on iOS whenever Google sign-in is offered, and no sale of student data. Students under 18 need a parent or guardian's consent before their data is stored (FR-11.8).
- NFR-9 Suggested stack. React Native with Expo (the same stack as the e-directory app), local SQLite storage, and a backend for accounts and shared classes (for example Supabase or Firebase Firestore).
- NFR-10 Ads. Ads load in the background and must not delay app start or reminders. Ad data use stays small, ads are hidden when the phone is offline, and no student records are passed to the ad network (see Business model).
- NFR-11 Concurrent edits. When two editors change the same entry, the later edit wins and the earlier editor gets a notice. Edits made offline are sent when the editor reconnects.

## Open questions and risks

### Decisions

| Question | Decision |
| --- | --- |
| Is an account needed to follow a shared tab? | Yes. Every user creates an account and sets a display name during onboarding. |
| Can a follower change shared entries? | No. Followers can only add personal notes to shared entries. |
| Can a class have more than one rep editing? | Yes. One owner plus up to two editors, and every edit is broadcast to followers. In MVP. |
| How will TT make money? | Paid ads that do not interrupt the student (see Business model). |
| Who runs the pilot? | University of Benin (UNIBEN), Federal University of Petroleum Resources, Effurun (FUPRE), and Delta State University (DELSU). |
| Is the name available? | Yes, on the Play Store and App Store. Store listing: "TT: Student Timetable". |

Decisions from the User Flow and Edge Case Review (6 November 2026):

| Question | Decision |
| --- | --- |
| Should students see a class before signing up? | Yes. The import preview comes first; sign-up is asked when they tap Follow. |
| How do semesters roll over? | Same session: the shared class continues. New session: a new shared class, and followers are invited to follow it. |
| How are students under 18 handled? | A parental-consent step at sign-up (FR-11.8), to be checked by a lawyer. |
| Must display names be unique? | Within each class only. |
| Should reps be able to pause a class during a strike? | Yes, in the MVP. |

### Still open

- [ ] Which ad network to use, and which ad formats it supports at low data cost
- [ ] Should a follower's assignment suggestion go straight to followers, or wait for an editor to approve it? (Proposed: wait for approval.)
- [ ] Which departments and levels at UNIBEN, FUPRE and DELSU, and who recruits the course reps

### Risks

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Course reps do not adopt it | Few shared tabs, so followers must enter data by hand and drop off | Recruit reps directly for the pilot; make sharing the first thing a new owner sees |
| Check-in fatigue | Students dismiss check-ins, attendance reports become empty | One combined notification, pending list, per-course opt-out |
| Reminders do not fire on some Android brands | Students stop trusting the app | Exact alarms, battery optimisation guidance, test on Tecno, Infinix, Itel and Samsung |
| Wrong data from a shared source | A mistake by the rep misleads the whole class | Change notices on every update, report-a-problem to the owner, easy unfollow |
| Deferred link fails after install | Import does not happen | Share code fallback on the first screen |

## Release plan

TT moves through four phases, and each gate must be passed before the next phase starts. Dates will be set once the build team and pilot institutions are confirmed.

&#91;embedded content: TT roadmap · 4 phases, 3 gates\]

The pilot semester is the main test: if course reps share and followers keep using the app, Release 2 goes ahead.
