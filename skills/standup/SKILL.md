---
name: standup
description: Catch-up brief — where the project is, what moved since last session, what is blocked, and the single thing to run now. Use when returning to a project after time away, or when the user asks "where are we", "what's the status", or "what should I do next".
argument-hint: "[project or release]"
disable-model-invocation: false
---

# Standup

Read, in this order, and stop as soon as you can answer honestly — do not fetch what you will not use:

1. **Kairoku** (if the MCP server is connected): `get_project` and `get_plan` for
   `${user_config.kairoku_project_slug}` — the current release, its phases, and computed
   progress. This is the fastest path to "where are we" and it already knows the Jira keys.
2. **The Build Journal's latest entries** — what the last session actually did.
3. **The current Release page** — which gates are ticked and which is next.
4. **The active Sprint page** — story table and working notes.
5. **The Decision Log's newest rows** — decisions taken since you last looked.
6. **Jira**: open issues in `${user_config.jira_project_key}` on the active sprint.
   Get the sprint from `kairoku-jira sprint current`; if that exits 2 the helper is
   unconfigured, so fall back to a JQL search on the sprint label.

Then brief in **under 200 words**:

- **Moved** — what closed or changed since the last journal entry.
- **Blocked** — what is stuck and precisely why. A story whose `Test notes` are still
  placeholders is blocked, not ready; say so.
- **Next gate** — which release gate is closest and what it is waiting on.
- **Run this** — one concrete command or action. `/kairoku:run-epic KAIR-42`, "approve the
  sprint page", "verify the manual checklist against <preview URL>". Not a list of options.

No filler, no restating the project's purpose, no summarising documents the user wrote.
If nothing moved since the last entry, say that in one line rather than manufacturing progress.

If `$ARGUMENTS` names a project or release, scope the whole brief to it.
