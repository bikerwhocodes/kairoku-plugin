# Epic Execution Prompt — ultracode + Workflow

> Sprint-lead fills the `<placeholders>` when a sprint is approved and hands Neil one copy per epic.
> Paste the whole block below into a fresh Claude Code session in the Kairoku repo.
> Independent epics (no cross-epic Blocks links — sprint-lead marks these) can run as **separate parallel Claude Code sessions**, each with its own copy.

---

ultracode

You are executing epic **<EPIC-KEY> — <epic name>** of Kairoku release <vX>, in this repository.

## Load context first, in this order

1. `CLAUDE.md` — workflow rules (TDD, commit style, stop conditions) and `mvp/SPEC.md` — the sections this epic touches.
2. `IMPLEMENTATION_PLAN.md` — the phase backing this epic.
3. Jira (Atlassian MCP): the epic, all child stories, their `Automated tests` / `Manual test` subtasks, the `Flow test` story, and all `Blocks` links.
4. Sprint page: <sprint-page-url> · Release page: <release-page-url>

## Mission

Complete every story in this epic, tests-first, exploiting parallelism safely. Use the **Workflow tool** to orchestrate:

1. **Scout (inline, before any workflow):** read every story; build the dependency graph from `Blocks` links and each story's Dependencies section. Partition stories into **waves** — a wave is the set of stories whose dependencies are all satisfied. Print the wave plan.
2. **Per wave, fan out one agent per story** with `isolation: "worktree"` (parallel stories may touch overlapping files). Each story agent:
   - Reads its full issue: Context (follow the spec/plan links), Objective, Implementation notes, Acceptance criteria, Test notes, Out of scope, Definition of done.
   - Writes the tests **first** from Test notes (red), implements to green, runs `bun run lint && bun run build`.
   - Commits per story (small, reviewable), closes the story's `Automated tests` subtask with a one-line evidence comment, transitions the story, and **never touches the `Manual test` subtask**.
   - Returns: story key, status, test results, commit refs, any spec ambiguity found.
3. **Barrier between waves:** merge worktrees back, run the full test suite on the merged state, resolve conflicts before launching the next wave.
4. **After the last wave:** execute the `Flow test — <phase>` story's instructions end to end against the running app; record the result on that story.
5. **Report:** a table (story → status → tests → commits), anything blocked and why, spec-change proposals filed, and a draft Build Journal entry for the Confluence page.

## Rules

- Never close `Manual test` subtasks or tick the Manual Test Checklist — that's the human's preview-verification gate.
- Nothing is done with failing, skipped, or missing tests; placeholder Test notes make a story **blocked**, not improvisable.
- Diverging from spec requires a filed spec-change proposal, not silent adaptation.
- If a story is unimplementable as written, block it with a comment and continue the wave — don't stall the epic.
