---
name: wrap
description: End-of-session ritual — Build Journal entry, Decision Log rows, status sync. Use when the user says they are done for the session, asks to "wrap up", or when a working session is ending and its record has not been written.
argument-hint: "[note to include]"
disable-model-invocation: true
---

# Wrap

Close out this working session so the next one — yours or another agent's — can pick it up cold.

1. **Build Journal entry.** Draft it from what actually happened in *this* session, not from
   the plan: **shipped / decided / blocked / next**. Append it to the journal page, newest
   first. Include issue keys and PR links so the entry is navigable.
2. **Decision Log.** Any decision made here that is not yet a row gets one now — numbered,
   dated, with the *why* and a revisit-when. Chat decisions evaporate; this is the only
   place they survive.
3. **Sync status.** Update the sprint page's story table and flip any release gate that
   actually moved. Do not tick a gate on the strength of intent.
4. **Kairoku.** If the MCP server is connected, `add_progress_note` on
   `${user_config.kairoku_project_slug}` with the one-line version of the journal entry, so
   the dashboard reflects the session without anyone opening Confluence.

Reply with the journal entry text and what to run next session.

If nothing happened worth recording, say so plainly instead of inventing content. A journal
of manufactured progress is worse than a gap.

`$ARGUMENTS`, if given, is a note from the user to weave into the entry.
