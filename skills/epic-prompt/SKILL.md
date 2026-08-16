---
name: epic-prompt
description: Fill the epic-execution prompt for an epic, ready to paste into a separate Claude Code session. Use when running an epic in another terminal or on another machine, or when dynamic workflows are unavailable — otherwise prefer /kairoku:run-epic, which runs the same plan here.
argument-hint: "<EPIC-KEY>"
disable-model-invocation: true
---

# Epic prompt

> **Prefer `/kairoku:run-epic $ARGUMENTS`.** It runs the wave plan in this session as a
> workflow you can watch, stop, and resume, with worktree isolation per story. This skill
> exists for the cases that need a *separate* session: a second terminal running a parallel
> epic, a different machine, or an environment with dynamic workflows turned off.

Fill the template for epic **$ARGUMENTS**:

1. Fetch the epic and all child stories from Jira, with their `Automated tests` / `Manual test`
   subtasks, the `Flow test` story, and every `Blocks` link.
2. Resolve the sprint and release page URLs.
3. Check for cross-epic `Blocks` links and state plainly whether this epic can run in parallel
   with others, or must wait for a named epic.
4. Flag any story whose `Test notes` are placeholders — those are blocked, not runnable, and
   the receiving session needs to know before it starts.

Output the complete prompt in **one code block**, placeholders resolved, nothing left to edit.
Keep the wave / worktree / tests-first structure intact — the template is at
`${CLAUDE_PLUGIN_ROOT}/epic-execution-prompt.md`.
