# 0013. Rationale — Reading timetable & personal study sessions

## Context

Students use TT Student Timetable not only for official lectures, assignments, and exams, but also to plan personal reading blocks (`Others · Study`) so they can stay ahead of challenging courses (such as `MTH 301`, `CSC 301`, or carry-over `STA 211`). Previously, `Study` was a generic preset under `Others` without a link to a specific `Course` or a way to track study hours per course in `CourseDetailScreen` and `ReportsScreen`.

## Options considered

### Option A (Chosen): Course-linked `Study` items within the unified `Others` calendar

- Extend `PersonalOtherItem` with optional `linkedCourseId`, `studyTopic`, and `completedDates`.
- Project `Study` items through `getOccurrencesForDate(isoDate)` with `courseCode: linkedCourse ? "STUDY · " + linkedCourse.code : "STUDY"`.
- **Pros**:
  - Preserves the 4 canonical calendars (`1. Classes`, `2. Assignments`, `3. Exams`, `4. Others`) specified by the user.
  - Automatically guarantees 100% parity between Card view and Calendar view on Today and Classes tabs.
  - Respects subscription filters when a reading block is linked to a Main, Carry-over, or Elective course.

### Option B: Separate 5th calendar category (`Reading`)

- **Cons**: Violates the user's explicit 4-calendar structure (`Classes`, `Assignments`, `Exams`, `Others` where `Others` holds Gym, Church, Club, Study, etc.).
