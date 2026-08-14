---
name: sprint-start
description: Fill the next sprint from the release's stories, get it approved, start it in Jira, and hand over the wave plan. Use when a release has stories ready and the next slice of work needs picking, ordering and kicking off.
argument-hint: "[sprint name or release]"
allowed-tools: Bash(kairoku-jira *)
---

# Sprint start

Turn a release into the next buildable slice, and start it — with a gate in the middle that is
the user's, not yours.

Delegate the filling to **Hancho**; it owns sprint composition and the wave plan. This skill is
the ritual around that: the inputs, the gate, and the Jira side.

## 1. Establish where we are

```
!`kairoku-jira sprint list --state active,future 2>&1 | head -20`
```

If that helper is unconfigured (exit 2), say so once — sprint start becomes a manual click in
Jira and everything else here still works.

Then read the Release page (scope and gates), the plan phase this sprint would cover, and the
release's stories in `${user_config.jira_project_key}`.

**If a sprint is already active, stop.** Two active sprints is a mess nobody wants. Offer
`/kairoku:sprint-close` for the current one, or ask whether to add to it.

## 2. Fill it

Hancho's job (see its definition for the detail): one plan phase, stories in dependency order,
each with its testing subtasks listed, sized to about a week of focused agent work.

Two things must be surfaced, not glossed:

- **Stories with placeholder Test notes.** They are not sprint-ready — there is no definition of
  done to build against. List them separately as "needs test notes before this can run".
- **Cross-epic `Blocks` links**, which decide what can run concurrently.

## 3. Stop for approval

Present: the goal (the phase's "Done when", verbatim), the epic and story table, the wave plan,
anything blocked, and the estimate of size. Mark the page `draft`.

**Then stop.** Do not create the sprint, do not move issues, do not start anything. The user
approves the slice — that is the whole point of the gate, and an approved-by-default sprint is
just a backlog with extra ceremony.

## 4. On approval

1. Flip the sprint page to `approved`.
2. Create the sprint if it does not exist: `kairoku-jira sprint create "<name>" --goal "<goal>"`.
3. Move the stories in: `kairoku-jira sprint add "<name>" <KEY> <KEY> …`.
4. Start it: `kairoku-jira sprint start "<name>"`. If the helper is unconfigured, tell the user
   to press Start in Jira and carry on.
5. Hand over the run command — `/kairoku:run-sprint "<name>"`, or the per-epic
   `/kairoku:run-epic <KEY>` list with the parallel-safe ones marked.

## 5. Report

The sprint name and goal, what is in it, what is deliberately not, the wave plan, and the one
command to start building. If anything was left out for lack of test notes, say what unblocks it.
