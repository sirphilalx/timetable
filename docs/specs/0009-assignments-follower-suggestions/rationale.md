# Rationale — 0009. Assignments & Follower Suggestions

- **Personal first, rep broadcast second**: When a follower adds an assignment after a lecture (`Screens/47–48`), it saves to their personal SQLite store immediately so their own reminders work even if the course rep is offline or rejects the suggestion.
- **Deduplicated suggestion counter**: Aggregating identical classmate suggestions (`Suggested by 6` on `Screens/58`) gives the rep high confidence before broadcasting to 128 followers.
