# TT: User Flow and Edge Case Review

Nov 6, 2026 · @Philiwonder\_

## Summary

Seven of TT's ten main journeys connect from start to finish with the current screens. Three do not:

- Nothing happens at the end of a semester.
- The rep is never asked to name the class before sharing it.
- A follower whose suggested assignment is rejected is left without an answer.

Across all journeys the review found:

| Rating | Count | Most serious |
| --- | --- | --- |
| Break | 4 | End of semester; semester dates missing from shared classes; a class orphaned when its owner leaves; dead links |
| Gap | 14 | Sign-up before the preview; duplicate classes when following; reminders silently off |
| Polish | 2 | When notification permission is asked; pre-filled display names |

Fixing them adds about 10 screens (taking the list to about 70), a set of states on existing screens, and 16 rules for the PRD. The five decisions at the end of this doc were made on 6 November 2026, and every fix has been added to the PRD (mainly the new section 11) and to the design brief's screen list.

## How the review was done

Every journey a student or rep can take was walked through step by step against two documents: the TT Product Requirements Document (requirements FR-1 to FR-10 and NFR-1 to NFR-11) and the screen inventory in the TT Design Brief (about 60 screens). At each step the review asked three questions:

1. Is there a screen for this step, and does it lead somewhere?
2. Does the PRD say what the app should do here, or would a developer have to guess?
3. What happens if something goes wrong at this step (no data, wrong input, someone else changed something, the phone blocks it)?

Findings are rated by how much they would hurt a student:

| Rating | Meaning |
| --- | --- |
| Break | The student gets stuck or loses data. Must be fixed before development starts. |
| Gap | A screen or rule is missing, so developers would guess. Fix before wireframes are signed off. |
| Polish | Works, but could be smoother. Fix during visual design. |

This is a desk review of the documents. It does not replace testing the clickable prototype with students at UNIBEN, FUPRE and DELSU (design stage 6).

## Happy paths checked against the screen list

Ten journeys cover everything TT does. Seven connect end to end with the current screens. Three have a missing step.

| # | Journey | Screens in order | Result |
| --- | --- | --- | --- |
| 1 | Follower joins from a WhatsApp link | Link → store → splash → sign up → display name → import preview → follow → notification permission → Today | Connects, but the order works against the student (see the next section) |
| 2 | Follower joins by scanning the rep's QR code in a lecture | Phone camera → (install) → import preview → sign up → follow → Today | Connects |
| 3 | Rep sets up a class and shares it | Sign up → set up manually → semester dates → add courses → add classes → share sheet | Missing step: nothing asks the rep to name the shared class ("CSC 300L, UNIBEN, 2026/2027 first semester") before the link is made |
| 4 | Self-organizer with no rep | Sign up → set up manually → semester dates → add courses → add classes → Today | Connects |
| 5 | Daily loop: reminder, class, check-in | Reminder → class detail → check-in notification → Attended / Missed / Add assignment → Today | Connects |
| 6 | Rep posts an assignment; follower submits it | Assignments → add → broadcast → follower notice → Today (due soon) → detail → mark submitted → Done | Connects |
| 7 | Group assignment | Rep adds groups → poll to all → follower picks group → group detail with counts → rep tags stragglers | Connects |
| 8 | Follower suggests an assignment | Check-in → Add assignment → "Sent to reps" → rep reviews → approve → broadcast | Connects for approval. No screen or rule for what the follower sees if it is rejected |
| 9 | Rep adds an editor, later hands over to the new course rep | Class settings → invite editor → accept invite → transfer ownership → accept transfer | Connects |
| 10 | End of semester, start of the next | None | Missing entirely: no screen, no rule. Every student hits this twice a year |

## Join from a link

Journey 1 decides whether TT grows, so it gets the closest look. The PRD (FR-1.1) asks a student to create an account and enter a display name before they see what they are joining. A student who taps a link in the class WhatsApp group has no reason yet to trust the app, and the first thing they meet is a form. The proposed order shows the import preview first (class name, rep's display name, number of courses and members, which needs no personal data) and asks for sign-up only when they tap Follow.

&#91;embedded content: Join from a link · proposed order, 5 decisions\]

The drawing also shows two branches the current screen list does not cover: a link that no longer works (the rep regenerated it, or deleted the class), and a student who already has their own classes for the same courses. Both are covered in the next section.

## Breaks and gaps found

Four breaks, fourteen gaps and two polish items. The breaks are listed first.

| ID | Rating | Where | What is wrong | Fix |
| --- | --- | --- | --- | --- |
| B1 | Break | End of semester | Nothing happens when the semester end date passes. Today goes empty, the shared class keeps running with stale classes, and there is no way to start the next semester. Every student hits this twice a year. | New semester-end flow: owner gets "Start next semester" (reuse courses, new dates); followers get "Your rep started the next semester, follow it?"; last semester's attendance and assignments are archived and still viewable |
| B2 | Break | Following a class | The shared class has no semester dates or breaks, so a follower's weekly classes have no end date, or the follower is sent to the manual semester-dates screen meant for self-organizers | Semester start, end and breaks belong to the shared class and are inherited by followers. Followers never see the semester-dates screen |
| B3 | Break | Owner deletes account or leaves | The class has no owner. Nobody can add editors, transfer it or regenerate the link | Before deleting, the owner must transfer ownership. If they skip it, the longest-serving editor becomes owner. With no editors, the class freezes as read-only and followers are told |
| B4 | Break | Opening an old link | A regenerated or deleted link leads nowhere; there is no screen for it | New "This link no longer works" screen with a share-code field and a line suggesting they ask their rep for the new link |
| G1 | Gap | Join from a link | Sign-up comes before the student sees what they are joining (FR-1.1) | Show the import preview first; ask for sign-up when they tap Follow (see the diagram) |
| G2 | Gap | Rep shares for the first time | Nothing asks the rep to name the class before the link is made | New "Create shared class" screen: class name, institution, level, session and semester (dates come from the rep's semester setup) |
| G3 | Gap | Following a class | A student who already entered their own CSC 301 classes ends up with two copies | New clash screen: "Use the rep's timetable for these courses" (own copies hidden, not deleted) or "Keep mine" |
| G4 | Gap | Course merge (FR-8.11) | Same course code but a different title or unit count: no rule says which wins | Shared class values win for shared entries; the student's own course record is kept hidden and returns if they unfollow |
| G5 | Gap | Import preview | A student who already follows the class taps the link again | Preview shows "You already follow this class" with an Open button |
| G6 | Gap | Suggested assignment | No rule or screen for a rejected suggestion | Follower gets a notice ("Reps didn't add this"); the item stays in their own list as a personal assignment they can keep or delete |
| G7 | Gap | Suggested assignment | Six followers suggest the same assignment; reps get six items | Suggestions for the same course and day are grouped into one review item showing "suggested by 6" |
| G8 | Gap | Reports (FR-7.1) | "Unknown" attendance (check-in never answered) has no rule in the percentage | Unknown is left out of the percentage and shown as its own count, with a nudge to answer pending check-ins |
| G9 | Gap | Reminders | No screen for notifications being off, or for Android's exact-alarm and battery-optimisation settings (NFR-4 mentions them) | A "Reminders are off" banner on Today, and a Reminder setup screen that opens the right phone settings |
| G10 | Gap | Adding an assignment | No rule for an assignment with a date but no time | Default due time 11:59 pm, shown as "Due Friday" without a time |
| G11 | Gap | Last-minute changes | A rep cancels or moves a class after the reminder has already gone out | Send an immediate change notice that says the reminder was wrong ("Cancelled: CSC 301 at 10am") |
| G12 | Gap | Tagging into groups | Two members with the same display name can't be told apart | Display names must be unique within a class; a clash on following asks the student to adjust it ("Chioma O.") |
| G13 | Gap | Scanning a QR code | Camera permission denied leaves the scanner blank | The code field sits on the same screen as the scanner, with a short line explaining camera access |
| G14 | Gap | Check-in | Two clashing classes (allowed by FR-3.5) end together and send two check-ins | One check-in that asks which class the student attended |
| P1 | Polish | Onboarding | Notification permission is asked before the student has any classes, so many will refuse | Ask right after the first follow or first class added, with a one-line reason |
| P2 | Polish | Sign-up | Google and Apple sign-in already know the student's name | Pre-fill the display name from the sign-in provider |

## Edge cases by area

"Covered" means the PRD already handles it (requirement shown). "New" means a rule or state needs adding.

### Time and schedule

| Edge case | Status | What TT does |
| --- | --- | --- |
| Lecturer moves one class or adds a makeup class | Covered (FR-3.2, FR-3.4) | One-off move or one-off class |
| Holidays and mid-semester breaks | Covered (FR-3.3) | Date ranges with no classes |
| Strike or indefinite shutdown, such as an ASUU strike | New | Reps can pause the class "until further notice": reminders and check-ins stop, followers see a banner, and resuming asks for a new semester end date |
| Semester extended (exams delayed) | New | Owner edits the end date; recurring classes and reminders extend automatically |
| Two classes at the same time | Covered (FR-3.5) | Allowed with a warning; one combined check-in (G14) |
| End time before start time | New | Form blocks saving with a plain message |
| Phone time zone or clock changes | Covered (NFR-4) | Times stored as local wall-clock with time zone |

### Sharing and roles

| Edge case | Status | What TT does |
| --- | --- | --- |
| Two editors edit the same class | Covered (NFR-11) | Later edit wins; the other editor is told |
| An editor is removed while they have unsynced offline edits | New | Their pending edits are dropped and they get a notice saying so |
| Owner sends a transfer that is never accepted | New | Transfer offer expires after 7 days; ownership stays put |
| Owner tries to add a third editor | New | Invite option disabled with "A class can have up to 2 editors" |
| Follower unfollows during a group assignment | New | Removed from the group; counts update; reps see who left |
| Someone creates a fake class with a real course name | New | Preview shows the rep's display name, member count and created date; followers can report the class |
| A follower posts offensive content in a display name or suggestion | New | Owner and editors can remove a follower from the class |
| Very large classes (general studies courses with 1,000+ students) | New | Member list and group lists load in pages; counts stay instant |

### Assignments and groups

| Edge case | Status | What TT does |
| --- | --- | --- |
| Due date or time changed by a rep | Covered (FR-8.5) | Reminders reschedule; change notice sent |
| Assignment posted after its due date | New | Goes to Missing with "posted after the due date" so students can still see it |
| Rep deletes an assignment students already marked submitted | New | Removed from everyone's lists with a notice; nothing is lost from personal notes |
| A group is full | New | Poll option shows "Full (6/6)" and can't be picked |
| A student is tagged into Group 4 while already in Group 2 | New | Moved to Group 4, with a notice; both counts update |
| Joining deadline passes with students still not in a group | New | Reps see a "not in a group" list and can tag them in |
| A rep renames or removes a group after people joined | New | Members of a removed group go back to "not in a group" and are told |

### Account and devices

| Edge case | Status | What TT does |
| --- | --- | --- |
| New phone | New | Sign in, then a short "Restoring your classes" state; reminders are rebuilt on the device |
| Signed in with Google on one phone and Apple on another (Apple can hide the email) | New | Settings lets the student link sign-in methods to one account |
| Signed in on two phones | New | Data syncs to both; reminders ring on both unless the student turns them off on one |
| Forgot password | Covered (screen list) | Email reset |
| Deleting an account | Covered (NFR-8), plus B3 | Data deleted; owners must transfer first |

### Offline and sync

| Edge case | Status | What TT does |
| --- | --- | --- |
| First launch with no data | New | Sign-up screen says a connection is needed once, with a retry button |
| Opening a class link offline | New | "Connect to the internet to follow this class", with retry; the link is remembered |
| Answering a check-in offline | Covered (NFR-1) | Saved and synced later |
| Follower offline for several days | New | On reconnect, changes arrive as one summary notice instead of many |

### Accessibility and privacy

| Edge case | Status | What TT does |
| --- | --- | --- |
| Large text (Android and iOS font size up to 200%) | New | Cards grow and text wraps; the screens are checked at 200% before sign-off |
| Screen reader on the QR share card | New | The card reads out the share code and class name |
| Colour-blind students | Covered (design brief) | Status is always a badge with a word |
| Others tab appearing anywhere shared | Covered (FR-8.1) | Never shared; the home-screen widget shows classes and assignments only |
| Students under 18 | New, needs a decision | See Decisions needed |

## Changes to make

### New screens (about 10, taking the list to about 70)

| Screen | Fixes | Release |
| --- | --- | --- |
| Create shared class (name, institution, level, session and semester) | G2 | MVP |
| This link no longer works | B4 | MVP |
| Course clash on follow (use the rep's timetable or keep mine) | G3 | MVP |
| Semester end for the owner (start next semester, reuse courses) | B1 | MVP |
| Follow the next semester (follower prompt) | B1 | MVP |
| Reminder setup (notifications, exact alarms, battery optimisation on Android) | G9 | MVP |
| Pause class until further notice, and the paused banner | Strikes | MVP |
| Restoring your classes (new phone) | Devices | MVP |
| Remove a follower and report a class (sheets) | Safety | MVP |
| Linked sign-in methods (Settings) | Devices | Release 2 |

### New states on existing screens

- Import preview: already following; offline; rep name, member count and created date shown.
- Join a class: camera access denied, with the code field kept visible.
- Today: reminders off banner; class paused banner; semester ended.
- Group poll: group full; joining closed.
- Assignments: posted after due date; suggestion rejected; grouped suggestions ("suggested by 6").
- Display name: already taken in this class.
- Class settings: editor limit reached; transfer pending and expired.

### New PRD rules

1. Semester dates and breaks belong to the shared class; followers inherit them (B2).
2. Semester-end flow for owners and followers; past semesters are archived and viewable (B1).
3. Owners must transfer ownership before deleting their account; otherwise the longest-serving editor takes over, or the class freezes read-only (B3).
4. Import preview comes before sign-up (G1), if approved.
5. When following, a clash with the student's own courses asks which to use; hidden personal copies return on unfollow (G3, G4).
6. Rejected suggestions stay in the follower's own list; matching suggestions are grouped for reps (G6, G7).
7. Unknown attendance is left out of the percentage and shown separately (G8).
8. Assignments with no due time default to 11:59 pm (G10).
9. A cancellation or move after a reminder has gone out sends an immediate correction (G11).
10. Display names are unique within a class (G12).
11. Clashing classes produce one combined check-in (G14).
12. Notification permission is asked after the first follow or first class, not during onboarding (P1).
13. Owners and editors can pause a class until further notice, and remove a follower; followers can report a class.
14. Transfer offers expire after 7 days; removed editors' unsynced edits are dropped with a notice.
15. Group rules: full groups can't be picked, tagging moves a student between groups, removed groups send members back to "not in a group".
16. Layouts are checked at 200% text size.

## Decisions needed from Philemon

All five were decided on 6 November 2026, and the PRD and design brief have been updated to match.

- [x] Preview before sign-up (G1): approved. FR-1.1 now shows the import preview first and asks for sign-up when the student taps Follow.
- [x] Semester rollover (B1): approved as recommended. A new semester in the same session continues the same shared class; a new session starts a new class and followers are invited (FR-11.2).
- [x] Students under 18: a parental-consent step at sign-up (FR-11.8). The wording and process still need a lawyer's check against the Nigeria Data Protection Act 2023 before launch.
- [x] Unique display names (G12): unique within each class only (FR-11.7).
- [x] Pause for strikes: in the MVP (FR-11.3).
