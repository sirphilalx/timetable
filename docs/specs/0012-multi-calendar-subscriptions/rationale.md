# Rationale: Multi calendar Today, Exams, Others & course subscriptions · spec 0012

## Context

Nigerian university students rarely take courses from only a single static class group. Many students carry over one or two courses from a lower level (such as `STA 211` in `200L`), register for an elective course in another department (such as `ECO 303` in Economics), track semester exams, and balance personal commitments like Church, Gym, or student clubs. If a student joins an entire `200L` or `Economics 300L` shared timetable just to get one course, their Today screen and reminders are flooded with 6 to 8 courses they do not take. At the same time, for the specific carry over or elective courses they do take, they need all of the course rep's settings, venues, lecturer details, assignments, and live move or cancel overrides to carry on automatically.

## Options considered

1. **Unified daily projection across 4 calendars (`Classes`, `Assignments`, `Exams`, `Others`) + course filtered subscriptions (`main`, `carryover`, `elective`)**: Stores a subscription record per followed shared class with `mode: "main" | "carryover" | "elective"` and `selectedCourseIds: string[]`. All upstream course settings, class rules, concrete occurrence overrides, exams, and assignments for the selected course IDs flow into `useTimetable()`, while `Exams` and `Others` (Gym, Church, Club) project alongside classes into the Today Hero card, compact cards, and Calendar day timeline.
2. **Clone carry over and elective courses as disconnected manual courses**: Copies course text once at join time and severs the link to the shared class. Rejected because subscribers would miss venue changes, cancelled lectures, rep notes, and assignments posted by the other class's rep.

## Decision

Option 1 was chosen so subscribers retain live inheritance of all course and class settings for their main class, carry over courses, and department electives while seeing a unified Today schedule across Classes, Assignments, Exams, and Others.
