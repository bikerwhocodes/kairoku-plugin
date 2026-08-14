---
name: warroom
description: Run a sprint as an agent team you can talk to — dedicated implementer and QA teammates you can message directly, steer mid-task, and scale up. Use when the user wants an interactive sprint rather than a hands-off workflow run, or asks for agent teams, teammates, or a war room.
argument-hint: "[epic or sprint]"
disable-model-invocation: true
---

# War room

An interactive alternative to `/kairoku:run-epic`. Same work, different control surface: instead
of a script that runs to completion, you get teammates you can open, message, redirect, and add
to while they work.

**Choose deliberately.** Teams cost more tokens and give up the workflow's guarantees:

| | `/kairoku:run-epic` | War room |
|---|---|---|
| Isolation | a worktree per story | **none — you must partition by file** |
| Resumable | yes, within the session | no |
| Steering | stop / restart an agent | talk to any teammate directly |
| Scaling | fixed by the wave plan | add implementers or QA mid-run |
| Cost | lower | higher — each teammate is a full session |

Use the war room when the work needs judgment you want to be in the loop for. Use the workflow
when the stories are well specified and you want them built.

## Before anything: three caveats that bite

1. **Agent teams are experimental and off by default.** They need
   `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings or the environment. If it is not set,
   say so, show the setting, and offer the workflow instead — do not try to work around it.
2. **Teammates get no worktree.** Two teammates editing one file overwrite each other. Partition
   the work so each owns a distinct set of files, or have each teammate create its own worktree
   before it starts. Say which you chose.
3. **A teammate does not inherit an agent definition's preloaded skills or MCP config.** So a
   `kairoku:daiku` teammate arrives without `jira-ops` and `git-pr` in context. **Every spawn
   prompt must tell it to load those skills first.** This is the single most common way a war
   room produces work that ignores the protocol.

Also: while teams are enabled, any subagent Claude names launches as a teammate — which can
stall a workflow that is waiting on a subagent result. Do not run a workflow and a war room in
the same session.

## Setting up

1. **Scout first, exactly as the workflow does** — read the epic or sprint, build the dependency
   graph, and partition the stories. Here the partition must be by **file ownership**, not just
   dependency, because there is no isolation.
2. **Spawn a small team.** Three to five teammates, not one per story. Typically: two or three
   implementers using the `kairoku:daiku` type, one QA using `kairoku:metsuke`. Scale up when a
   teammate is genuinely idle, not preemptively.
3. **Give each spawn prompt everything**, because teammates share no conversation history:

   ```
   Load the skills kairoku:jira-ops and kairoku:git-pr first and follow them exactly.
   You own <KEY> — <summary>. You own these files and no others: <paths>.
   Branch from <integration-branch>. Tests first from the Test notes, then implement.
   Never touch the Manual test subtask. Report status, tests, commits when done.
   ```

4. **Models per teammate** — implementers on Sonnet, the reviewer on Opus. Say it in the spawn
   request; a teammate's model is fixed once it starts.

## Running it

- Keep the same gates: tests before implementation, full suite before merging a wave, and the
  human's preview verification untouched.
- **Merge centrally.** Teammates commit; you merge, in dependency order, running the full suite
  after each wave. Letting teammates merge each other's work is where teams get messy.
- Check in rather than letting it run. The advantage of a team is that you can redirect a wrong
  approach at minute three instead of reading about it at minute forty.
- Ask a teammate to shut down when its work is done; idle teammates still cost context.

## Ending

Same close as any epic: one PR per epic with unticked manual checkboxes, PR URL commented on
the stories, progress note to Kairoku, journal entry drafted. The control surface changed; the
definition of done did not.
