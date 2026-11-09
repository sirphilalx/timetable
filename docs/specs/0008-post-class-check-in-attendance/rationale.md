# Rationale — 0008. Post Class Check In & Attendance Tracking

- **7-day window**: Students frequently forget to respond immediately after a lecture ends. Keeping unanswered check-ins open for 7 days in `/check-ins/pending` lets students batch-log attendance without fabricating records from weeks ago.
- **Target threshold nudges**: Nigerian universities commonly mandate 75% lecture attendance for exam eligibility. Highlighting courses below target (`71%` on `MTH 301`) and computing consecutive classes needed (`Need 2 more in a row to reach 75%`) gives actionable guidance rather than raw percentages.
