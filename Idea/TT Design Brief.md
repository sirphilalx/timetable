# TT: Design Brief

Oct 22, 2026 · @Philiwonder\_

## Project summary

We need UI and UX design for TT (store name "TT: Student Timetable"), a mobile app for iOS and Android that helps university students manage classes, assignments, exams, reading time and personal events, from user flows through to developer-ready Figma files.

TT opens on a Today screen and has five areas: Classes, Assignments, Exams, Reading and Others, each with a list view and a calendar view. It reminds students before each class and checks in with them afterwards ("Did you attend? Any assignment?"). Its main growth feature is sharing: a course rep builds the class timetable once and the whole class follows it through a link, getting every update after that.

The full product requirements are in the TT Product Requirements Document (shared separately). Two supporting docs are shared with it: the TT Calendar App Design Research (patterns to take from ten apps) and the TT User Flow and Edge Case Review (journeys, edge cases and the states each screen needs). Read all three before kickoff. Where this brief and the PRD disagree, the PRD wins on features and rules, and this brief wins on design scope.

## Users and the feel we want

The users are Nigerian university students, aged about 17 to 26, mostly on mid-range and budget Android phones (Tecno, Infinix, Itel, Samsung A series), with a smaller group on iPhones. The pilot runs at the University of Benin (UNIBEN), the Federal University of Petroleum Resources, Effurun (FUPRE), and Delta State University (DELSU).

There are two kinds of user to design for:

- Followers, the majority. They join a class from a link a course rep sent on WhatsApp. They want to see what's next and answer a check-in with one tap, and they won't fill in long forms.
- Organizers, meaning the course rep and up to two co-reps. They set up and maintain the class timetable, post assignments, create groups for group work, and push changes to everyone. They need fast entry and a clear view of who has joined.

The app should feel calm, quick and dependable. A student opening it between lectures should know in under three seconds where their next class is and what is due. It should look like a well-made tool, without the cartoon look of a children's app or the busy look of a social feed. Exams already make students anxious, so nothing in the Exams tab should add to that.

## What is fixed and what is open

The features and rules are decided. How they are laid out and navigated is the designer's call, and we expect proposals.

| Fixed (from the PRD) | Open for the designer |
| --- | --- |
| Bottom bar: Today, Classes, Assignments, Exams, More (Reading and Others sit under More). Avatar menu: Reports, Settings, Notifications, Join a class | Icon set, label styling, and how More opens |
| Today screen content and order (PRD FR-2.3): next class first, then the rest of today, due soon, pending check-ins, change notices | Today screen layout and visual weight |
| List view is the default in every tab, with a week strip and busy-day dots; month view shows dots and the selected day's list; hour grids are secondary | How the week strip, month grid and hour grids look |
| Import preview shown before sign-up; account with date of birth and display name; parental consent for students under 18 | The onboarding sequence and how short it can be made |
| Roles: owner, up to two editors, followers | How roles and permissions show in the interface |
| One combined post-class check-in (attended, missed, add assignment) | The check-in layout, in the notification and inside the app |
| Assignments in Due soon, Missing, Done and Suggested sections; group assignments with a join poll, tagging and counts | How sections, the poll, groups and counts are presented |
| QR share card and projector mode | Card artwork and QR styling, within the rules in section 4 |
| Others tab is private and never shared | Visual style, typography, iconography and illustration, within the design system |
| The screen list (section 7) covers every feature | Merging, splitting or adding screens, agreed after wireframes |

If a design idea needs a feature or rule to change, raise it with the reasons. Don't build it in quietly.

## Visual direction

The palette below is a starting direction. The designer can adjust the shades, but the rules under it stand.

| Role | Color | Hex |
| --- | --- | --- |
| Brand, primary buttons, active tab | Indigo | #4F46E5 (dark mode #818CF8) |
| Due soon, reminders, pending check-ins | Amber | #F59E0B |
| Attended, submitted | Green | #16A34A |
| Overdue, attendance below threshold | Red | #DC2626 |
| Classes tab tint | Light indigo | #EEF2FF |
| Assignments tab tint | Light amber | #FEF3C7 |
| Reading tab tint | Light teal | #CCFBF1 |
| Exams tab tint | Light violet | #EDE9FE |
| Others tab tint | Light pink | #FCE7F3 |
| Light background / text and dark background | Slate | #F8FAFC / #0F172A |

Course colors, picked by the student: #2563EB, #0D9488, #7C3AED, #DB2777, #EA580C, #0891B2, #A16207, #475569.

Color rules:

- Red appears only when something is wrong (overdue, below attendance threshold, a clash). Never use it as a decoration or as the Exams color. (Elliot and colleagues, Journal of Experimental Psychology: General, 2007, found that brief exposure to red before a test lowered scores.)
- Green, amber and red keep their usual meanings (done, soon, late) everywhere in the app.
- Course colors never use pure red or green, so a course can't be mistaken for a status.
- Every status has an icon or label as well as a color, for color-blind users.
- Strong color is kept for the few things that need action. The everyday screens stay mostly neutral.
- Text and background pairs meet WCAG AA (4.5:1 for body text). Amber and teal are for fills and icons; use darker shades for text.

Starting design system: the Cadence Academy Design System in Figma ([file](https://www.figma.com/design/100gPj3Ttk8x4MMD3bKFzs/Untitled?node-id=1-2008)). Keep its token names, Inter type, 4 px spacing, radius set and component naming. Replace the orange accent with indigo, use a mobile type ramp (nothing smaller than 12 px), darken `text/muted` and `text/link` for light mode to pass 4.5:1, and set colours as Light and Dark variable modes instead of duplicate theme variants.

Patterns from the TT Calendar App Design Research doc:

- Class and assignment cards are neutral surfaces with a 4 px course-colour stripe on the left and a course tag. Time and venue get the largest type on a class card.
- Status (attended, missed, moved, cancelled, "2 days late") is always a badge with a word. Whole cards never change colour.
- Classes that have ended are shown faded on Today and in lists.
- Assignments appear as due-date markers in calendar views, never as time blocks beside classes.

## Constraints

- Built in React Native with Expo, from one codebase for iOS and Android. Designs should use patterns that work on both rather than two separate native designs.
- Design at 360 × 800 (common Android size) and check at 390 × 844 (iPhone). Layouts must hold up on small screens, around 320 px wide.
- Light and dark mode both ship in the MVP.
- Minimum touch target 44 × 44 px. Body text no smaller than 14 px.
- The app works offline. Design an offline banner, a "changes waiting to sync" state, and what a follower sees when a change arrives ("MTH 201 moved to LT2, 10am").
- No heavy images, video or animation loops. Students often have limited data and budget phones.
- Ads arrive in Release 2: one banner slot at the bottom of list views and the weekly report only. Leave room for it, and never place it in check-ins, reminders, onboarding or the import preview.
- Notification volume can't be set by the app on iOS, and on Android only at first setup. The notification settings screen explains this and links to the phone's settings, with no volume slider.
- The app's name is "TT". The icon must read clearly at small sizes on both stores.

## Scope of work and stages

The work runs in eight stages. Each one ends with a review, and the next stage starts only after sign-off.

| Stage | Designer delivers | Sign-off before moving on |
| --- | --- | --- |
| 1. Kickoff | Questions on the PRD and this brief, a short plan | Plan agreed |
| 2. User flows | Flow diagrams for: joining from a shared link or QR code (preview first, then sign-up), parental consent for under-18s, manual setup, creating a shared class, adding a class, the post-class check-in, a group assignment poll, suggesting an assignment (approved and rejected), editor invite and ownership transfer, semester end and rollover, pausing a class, unfollowing | Flows cover every PRD requirement |
| 3. Wireframes | Greyscale layouts for every screen, with navigation | Final screen list agreed |
| 4. Visual direction | Two or three style options applied to the Today screen and the check-in | One direction chosen |
| 5. High-fidelity screens | Every screen in light and dark mode, with empty, loading, offline and error states | Screens approved |
| 6. Clickable prototype | Figma prototype of the main flows for testing with 5 to 8 students | Test findings addressed |
| 7. Design system and handoff | Figma components, color and type styles, spacing, icons, and notes on behaviour for developers | Developer review passed |
| 8. Store assets | App icon, Play Store and App Store screenshots, feature graphic, QR share card template, and home-screen widget layouts (small and medium, for Release 2) | Assets approved |

All work is delivered in Figma, using components and auto layout, with names that match the screen list.

## Starting screen inventory

There are about 70 screens before light and dark versions. This is a checklist of what must be covered; the final list is agreed at the end of wireframes.

| Area | Screens | Release |
| --- | --- | --- |
| Onboarding | Splash; import preview (before sign-up, with already-following and offline states); this link no longer works; sign up or sign in (Google, Apple, email); forgot password; date of birth; display name (with name-taken state); parental consent request; waiting for consent; join a class or set up manually; enter share code; scan QR code (with camera-denied state); course clash on follow; add courses; semester dates (self-organizers only); notification permission (after first follow or first class) | MVP |
| Today | Today screen (with reminders-off, class-paused and semester-ended banners); Notifications | MVP |
| Classes | List view with week strip; calendar (day, week, month); class detail; course detail; add or edit class (several days at once); cancel or move one class; class switcher | MVP |
| Check-in | Notification wording and quick actions (including the clash version); pending check-ins list | MVP |
| Assignments | List (Due soon, Missing, Done, Suggested); calendar with due-date markers; detail; add or edit; group poll (with full and closed states); groups list with "not in a group"; group detail with member counts; tag members; review suggested assignments (grouped, approve or reject) | MVP |
| Sharing and roles | Create shared class; share sheet with link and code; QR share card; projector mode; class settings (member count, editors, invite editor, transfer ownership, regenerate link, pause class, edit semester end); member list with remove follower; report a class; change log; accept editor invite; accept ownership transfer (with expired state); unfollow confirmation | MVP |
| Semesters | Semester end for the owner (start next semester); follow the next session's class (follower invite); archived semester view | MVP |
| Reports | Attendance per course with the 75% warning and the unknown count | MVP |
| Settings | Courses; reminders; Reminder setup (permission, exact alarms, battery optimisation); check-ins per course; attendance threshold; account and display name; delete account (with transfer-ownership step for owners) | MVP |
| States | Empty state for each tab; offline banner; syncing; restoring your classes; moved and cancelled class cards; faded past class; posted-after-due assignment; rejected suggestion | MVP |
| Exams | List with countdown; exam detail; add or edit exam | Release 2 |
| Reading | List and calendar; add session | Release 2 |
| Others | List; add event | Release 2 |
| Reports | Weekly summary with hours and study time | Release 2 |
| Settings | Notification style (sound, vibration, explanation of phone limits); linked sign-in methods | Release 2 |
| Widgets | Small and medium home-screen widgets, light and dark | Release 2 |

Please design Release 2 screens in the same project, but they can come after the MVP screens are approved.

## Timeline, budget and terms

Philemon Okpokpa, PMP, approves every stage. Feedback on each submission comes back within 3 working days.

- [ ] Budget: to be agreed with the designer (quote per stage, or a fixed fee for stages 1 to 8)
- [ ] Timeline: designer to propose dates per stage; the MVP screens need to be ready before development starts
- [ ] Reference apps: covered in the TT Calendar App Design Research doc (ten apps, with what to take, adapt and avoid from each); shared with the designer at kickoff

Contract terms:

- Once paid, EasyPass Software Solutions owns all design files, assets and rights, including the Figma source files.
- The fee includes two rounds of revisions at each stage. Extra rounds are quoted before they start.
- Payment is tied to stage sign-offs, not to dates.
- The designer may show the work in a portfolio only after TT launches publicly, and only with written approval.

To apply, send a short portfolio with at least one mobile app project, a quote, and a proposed timeline.
