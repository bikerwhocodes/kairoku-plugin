---
name: writing-plans
description: Convert an approved spec into a phased, test-first implementation plan — drafted in a temp directory and published to Confluence, never saved into the repo or committed. Use when a spec or design exists (a Confluence page, a file, or an agreed design in conversation) and the user wants an implementation plan, a work breakdown, phases/milestones, or asks "how do we build this". If there is no spec yet, run writing-specs first; if the user wants actual Jira issues created, that is writing-jiras, which consumes this skill's output.
---

# Writing Plans

Turn a spec into a plan a builder — human or AI — could execute without asking questions. The plan's home is **Confluence**, next to its spec; the repo never holds plan files and nothing is ever committed. The implementation agent later derives its work directly from this plan.

## Workspace rules

Same as writing-specs, same reasons: draft in `${TMPDIR:-/tmp}/specs-and-plans/<YYYY-MM-DD>-<topic-slug>/plan.md` (reuse the spec's workspace when it exists), read the repo freely, write to it never, no `git add`, no `git commit`.

## Get the spec first

Resolve the input in this order: a Confluence URL the user gives (fetch it with `getConfluencePage`), a spec file path, or a design agreed earlier in the conversation. If none of these exist, say so and switch to **writing-specs** — planning without a spec produces confident nonsense.

## Plan structure

Open with a header that orients any reader in ten seconds:

```markdown
# <Topic> — Implementation Plan
> Spec: <Confluence link> · Status: draft | approved · <date>

**Goal:** <one sentence>
**Architecture approach:** <one short paragraph>
**Tech stack:** <the concrete pieces>
**Decisions already made:** <bullets — choices the user locked in, so nobody relitigates them>
```

Then **phases** in dependency order. Each phase has a name, a one-line goal, and a **"Done when"** — an observable end state that doubles as the phase's flow test later.

Each phase contains **tasks**. A task is a coherent unit of work that passes the three-part scope test:

1. Can it be verified independently?
2. Does it touch one concern only?
3. Would it get its own commit?

Format per task:

```markdown
### <N.M> <Imperative title>
**Files:** <exact paths — src/lib/csv/parse.ts, src/app/import/page.tsx>
**Steps:** <concrete steps; include code where code says it best>
**Test notes:** <expected behavior, edge cases, how to verify — the TDD contract>
**Verify:** <the command or check that proves it done — bun test src/lib/csv, manual step, etc.>
```

## The rules that make plans executable

- **Test-first, inside the task.** `Test notes` are written *now*, at planning time, for every task — expected behavior and edge cases before any implementation exists. That is the TDD hook: the tests are figured out before the code, so the code can't quietly drift from intent. Red-green-refactor happens within a task, never as a separate "write tests" task.
- **No placeholders.** Forbidden: "TBD", "add appropriate error handling", "similar to task N", "etc.", or any step that says *what* without *how*. If you can't write the step concretely, the spec has a hole — go resolve it, don't paper over it.
- **Exact paths.** Name real files. If the repo exists, verify paths against it; if greenfield, commit to a layout in the header.
- **Right-size the tasks.** Aim for units a builder finishes in one sitting with one commit. A plan of 40 micro-steps is as unexecutable as a plan of 3 boulders.

## Self-review, then approval

Reread the draft as the person who has to build it: hunt placeholders, missing test notes, tasks that fail the scope test, phases whose "Done when" isn't observable, and anything the spec promises that no task delivers (walk the spec's Goals list one by one). Fix, then show the user and iterate to approval. Unattended: mark `draft — pending review`, list assumptions, continue.

## Publish to Confluence

Same mechanics as writing-specs (find the Atlassian tools; create-or-update by title search). Publish the plan **as a child of the spec page** when a spec page exists, so the pair travels together. Record the page URL at the top of the temp `plan.md` and report it.

No Atlassian tools → stop, leave the draft, say what to connect. Dry run → write `confluence-payload.md` with the exact would-be page instead, and say nothing was created.

## Hand off

Terminal state: *"Plan published: <link>. Want me to turn it into Jira issues the coding agents can pick up?"* — that is the **writing-jiras** skill. Never create Jira issues from this skill, and never start implementing yourself.
