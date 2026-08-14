# Epic execution prompt — for a separate session

> **Prefer `/kairoku:run-epic <EPIC-KEY>`.** It runs this plan as a workflow you can watch,
> stop, and resume, with a worktree per story and an explicit barrier between waves.
>
> This template is for the cases that need a *different* session: a second terminal running a
> parallel epic, another machine, or an environment with dynamic workflows turned off.
> `/kairoku:epic-prompt <EPIC-KEY>` fills it in for you.

Paste everything below into a fresh Claude Code session in the repository.

---

ultracode

You are executing epic **<EPIC-KEY> — <epic name>** of release <vX>, in this repository.

## Load context first, in this order

1. The `kairoku:jira-ops` and `kairoku:git-pr` skills — the protocol you follow throughout.
2. `CLAUDE.md` for this repo's rules, and the spec sections this epic touches.
3. The plan phase backing this epic.
4. Jira: the epic, all child stories, their `Automated tests` / `Manual test` subtasks, the
   `Flow test` story, and every `Blocks` link.
5. Sprint page: <sprint-page-url> · Release page: <release-page-url>

## Mission

Complete every story in this epic, tests first, exploiting parallelism safely. Use the
**Workflow tool** to orchestrate:

1. **Scout, inline, before any workflow.** Read every story. Build the dependency graph from
   `Blocks` links and each story's Dependencies section, plus the implicit ones the links miss —
   two stories editing the same module, a story defining the type another consumes. Partition
   into **waves**: a wave is the set of stories whose dependencies are satisfied by earlier
   waves. Print the wave plan before you run it.
2. **Per wave, one agent per story**, `isolation: "worktree"`, since parallel stories touch
   overlapping files. Each story agent: reads its whole issue, writes the tests first from the
   Test notes and watches them fail, implements to green, runs the lint and build gate, commits
   with the issue key first, closes the `Automated tests` subtask with evidence, transitions the
   story — and **never touches the `Manual test` subtask**. It returns story key, status, test
   result, commit refs, and any spec ambiguity found.
3. **Barrier between waves.** Merge each story branch into the epic's integration branch using
   `Merge <branch> into <integration-branch> (<Sprint N> Wave M)`, resolve conflicts on their
   merits, then run the **full** suite on the merged state — not just the stories' own tests.
   A red barrier stops the epic.
4. **Review each wave** on the strong model, and try to refute every finding independently
   before reporting it.
5. **After the last wave**, execute the `Flow test — <phase>` story end to end against the
   running app and record the result.
6. **Close.** Open one pull request for the epic with the manual checkboxes unticked, post a
   progress note to Kairoku, and draft the Build Journal entry.

## Rules

- Never close `Manual test` subtasks or tick the Manual Test Checklist — that is the human's
  preview gate, and it is the only independent check on this run.
- Nothing is done with failing, skipped, or missing tests. Placeholder Test notes make a story
  **blocked**, not improvisable.
- Diverging from the spec requires a filed spec-change proposal, not a silent adaptation.
- If a story is unimplementable as written, block it with a comment and continue the wave —
  one story must never stall the epic.
- Do not merge the pull request.
