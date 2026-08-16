---
name: writing-plans
description: Convert an approved spec into a phased, test-first implementation plan — drafted in a temp directory and published to Confluence, never saved into the repo or committed. Use when a spec or design exists (a Confluence page, a file, or an agreed design in conversation) and the user wants an implementation plan, a work breakdown, phases/milestones, or asks "how do we build this". If there is no spec yet, run writing-specs first; if the user wants actual Jira issues created, that is writing-jiras, which consumes this skill's output.
---

# Writing Plans

Turn a spec into a plan a builder — human or AI — could execute without asking questions. The plan's home is **Kairoku**, as phases and items alongside its spec — or Confluence directly when no Kairoku project holds this work (see *Where it lands*). The repo never holds plan files and nothing is ever committed. The implementation agent later derives its work directly from this plan.

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

## Where it lands

A plan has two halves, and Kairoku holds them differently.

**The structure** — phases, items, and the `testNotes` on each — goes in with
`upsert_plan(project, release, phases[])`. This is the half that becomes Jira: the app's push
turns each phase into an epic, each item into a story, and each `testNotes` into the TDD
scaffold. It is idempotent, matching phases and items by name, and it will not overwrite an
item's status or its Jira key — so re-running it after an edit is safe.

**The prose** — the reasoning, the sequencing argument, the "done when" per phase — goes in as
a document: `create_document(project, type: "plan", title, content)`, or `update_document` on a
re-run. Check `list_documents(project)` first; the app pulls the Confluence space in, so the
page may already be there, and a duplicate cannot be deleted over MCP.

Then **stop and hand the push to the user.** There is no `push_plan` tool — the Jira push lives
on the app's Sync tab, by design: it is the only writer that maintains the `sync_mappings`
tying each issue back to its item. Give them the release name and the scope to push.

> **Push once.** A plan written by `upsert_plan` carries no mappings of its own. If these items
> already have Jira issues — because the plan was pushed before, or the issues were created by
> hand — pushing again creates duplicates rather than linking. When in doubt, `get_plan` and
> look for existing Jira keys before telling anyone to push.

**No Kairoku project, or the server is unconfigured?** Publish to Confluence directly: same
mechanics as writing-specs (find the Atlassian tools; create-or-update by title search), as a
child of the spec page when one exists, so the pair travels together. Record the page URL at
the top of the temp `plan.md` and report it. Say which route you took.

No Atlassian tools either → stop, leave the draft, say what to connect. Dry run → write `confluence-payload.md` with the exact would-be page instead, and say nothing was created.

## Hand off

Terminal state: *"Plan published: <link>. Want me to turn it into Jira issues the coding agents can pick up?"* — that is the **writing-jiras** skill. Never create Jira issues from this skill, and never start implementing yourself.
