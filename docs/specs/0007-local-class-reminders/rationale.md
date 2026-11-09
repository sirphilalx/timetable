# Rationale: Local class reminders & reliable scheduling · spec 0007

## Context

On budget Android phones popular across Nigerian campuses (Tecno, Infinix, Itel, and Samsung), aggressive OEM battery killers suppress background tasks unless the student grants exact alarm permission and sets battery saver to "No restrictions". Furthermore, when a student glances at their lock screen 30 minutes before a lecture, the single most important piece of information is the **venue** (`CSC 301 in 30 min, LT1`).

## Decision

We format every reminder title to lead with `{courseCode} in {leadMinutes} min, {shortVenue}` and provide a dedicated `Reminder setup check` diagnostic screen (`Screens/83`) that checks permissions, guides users past Tecno/Infinix battery restrictions, and sends a live test reminder.
