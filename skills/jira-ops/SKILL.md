---
name: jira-ops
description: The Jira lifecycle protocol every Kairoku agent follows — how to discover transitions rather than hardcode them, who moves which issue when, how to close testing subtasks with evidence, how to comment, and how to block a story without stalling its epic. Background knowledge for agents; not a user command.
user-invocable: false
---

# Jira operations protocol

Every agent that touches Jira follows this. It exists because the failure mode is not "the API
call errored" — it is a board that quietly stops describing reality, which is worse than no
board at all.

Project: `${user_config.jira_project_key}`. Never create or transition anything outside it.

## Finding the tools

Jira reaches you over MCP. The server name varies by install — look for tools matching
`*atlassian*` or `*jira*` (commonly `mcp__plugin_atlassian_atlassian__*`). Resolve `cloudId`
once with `getAccessibleAtlassianResources` and reuse it; do not call it per issue.

Board, sprint, and ranking operations are **not** on the MCP server — they are Agile API only.
Use `kairoku-jira` for those. Everything else goes through MCP.

## Never hardcode a transition

Transition ids and names differ per project and per workflow, and they change under you.
Resolve them every time:

1. `getTransitionsForJiraIssue(issueIdOrKey)`.
2. Match on the **target status category** (`To Do` / `In Progress` / `Done`), then on name
   as a tiebreak. Category is stable across workflow renames; names are not.
3. `transitionJiraIssue` with the id you found.

If no transition reaches the state you want, **do not force it and do not fail the story**.
Comment what you wanted, leave the status alone, and report it. A workflow with no
`In Review` state is a normal thing to encounter, not an error.

## Who moves what, and when

| Moment | Who | Action |
|---|---|---|
| Story claimed | implementer (daiku) | → *In Progress*, assign to itself, one `[agent]` comment naming the branch |
| Tests green, work committed | implementer | close the `Automated tests` subtask with an evidence comment |
| PR opened | implementer / workflow | → *In Review*, comment the PR URL on the story |
| Epic PR merged **and** tests green | lead (hancho) | → *Done* |
| Flow test run | QA (metsuke) | record the result on the `Flow test` story and the QA Run page |
| Anything at all | any agent | **never touch a `Manual test` subtask** |

Two rules that keep "done" honest:

- **A story is not Done on green tests alone.** Green tests plus a merged PR. Until then it is
  *In Review*, however finished it feels.
- **`Manual test` subtasks and the Manual Test Checklist belong to the human.** No agent closes
  them, ticks them, or transitions them. That is the preview gate, and it is the only thing
  standing between "the agents say it works" and "it works".

## Closing an `Automated tests` subtask

Only on green, and only with evidence a human could check:

```
[agent] Automated tests green.
Ran: <the exact command> → <N passed, 0 failed>
Covers: <the behaviours from the story's Test notes, in a line or two>
Commit: <sha> on <branch>
```

Never close it on skipped tests, on "tests would pass", or after retrying until green — a test
that needed three runs is a flaky test, and a flaky test is a defect. File it as one.

## Comment protocol

One structured comment per state change, prefixed `[agent]` so the human can filter agent
chatter from their own. Not one per commit, not a running log. The story's history should read
as a handful of meaningful events, not a transcript.

## When a story cannot be done

Blocking is a normal outcome, not a failure. Do all three:

1. Comment: what blocked it, precisely what is needed to unblock, and who or what can supply it.
2. Transition to a blocked state if the workflow has one; otherwise leave the status and say so.
3. Return it in the wave report as blocked, and **carry on with the rest of the wave**. One
   unimplementable story must never stall its epic.

Placeholder `Test notes` are a block, not an invitation to improvise. "Define tests before
implementing" is the whole point of the scaffold; a story that skips it has no definition of done.

Spec contradictions are a block too — file `/kairoku:spec-change` rather than adapting silently.

## Sprint field

Do not assume `customfield_10020`. Resolve it with `getJiraIssueTypeMetaWithFields` for the
project's Story type and match on the field named `Sprint`. To *move* issues between sprints,
prefer `kairoku-jira sprint add` over editing the field directly — the Agile endpoint handles
the board's ranking, an `editJiraIssue` does not.

## Reading before writing

Before transitioning anything, read the issue. An agent that transitions a story someone
already moved, or reopens something a human closed, destroys the board's credibility faster
than it builds it. If the current status contradicts what you expected, stop and report.
