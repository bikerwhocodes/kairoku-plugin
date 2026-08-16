---
name: writing-jiras
description: Turn an approved implementation plan into Jira issues written so an AI coding agent can execute each one without asking questions — epic per phase, story per task carrying full context, acceptance criteria and test notes, testing subtasks, and a flow-test story per epic. Use when the user wants to "push the plan to Jira", "create the tickets", "write the stories/epics/Jiras", or hand work off to coding agents. Requires a plan (writing-plans output, a Confluence plan page, or equivalent); drafts payloads in a temp directory and never stores anything in the repo.
---

# Writing Jiras

A coding agent gets **one issue** as its entire brief. It can't walk over to your desk, so every story must be self-sufficient: why this exists, what to build, where the code goes, how to prove it works, and links to the deeper documents. Vague tickets are where agent runs go to die — this skill exists to make each ticket a complete, executable contract.

Work in the same temp workspace as the spec/plan (`${TMPDIR:-/tmp}/specs-and-plans/<date>-<slug>/`); never write into the repo, never commit anything.

## Who creates the issues — read this first

**Prefer the app's plan push.** When the Kairoku app holds this project, the plan goes into Kairoku as phases and plan items with `testNotes`, and the *app* pushes them to Jira. That push is what creates and maintains the `sync_mappings` tying each issue back to its plan item.

This matters because issues created any other way have no mapping. The app's "Refresh status ← Jira" only maps issues it created, so directly-created issues never appear on the Plan tab, never feed release progress, and never show a tests indicator. The board looks fine and the dashboard quietly goes blind — which is worse than either failing loudly.

So, in order:

1. **Kairoku project exists** → write the phases and items into Kairoku with `upsert_plan`, then hand the push to the user: the Sync tab, and the exact release scope to push. There is no `push_plan` tool and that is deliberate — the app's push is the only writer that creates the mappings. Everything below still applies; it is what the *item* content must contain for the push to produce a good issue. Check `get_plan` for existing Jira keys before telling anyone to push — a second push of already-pushed items duplicates them.
2. **No Kairoku project** → create in Jira directly, using the whole procedure below. This is the fallback, and it is fine: Kairoku is optional.
3. **Kairoku exists but you were asked to create directly anyway** → do it, and say plainly in your report that these issues will not appear on the Plan tab until someone reconciles them. Do not bury that.

## Target selection

Find the Jira tools among available tools (commonly `mcp__*atlassian*__*`; any Jira MCP works). Resolve the cloudId, list projects (`getVisibleJiraProjects`), and confirm the target project with the user unless they named it — default to `${user_config.jira_project_key}`. Check its issue types: use **Epic + Story + Subtask** where available; fall back to Task when Story doesn't exist (team-managed projects vary). If Subtask isn't available, fold test tasks into the story checklist and say so.

## Inputs

Resolve the plan: a Confluence plan page (fetch it), the workspace `plan.md`, or a plan agreed in conversation. No plan → route to **writing-plans**. Also collect the spec link — stories cite both.

## Issue anatomy — the agent-readable story

Every story description follows this template. The headings matter: agents scan for them.

```markdown
## Context
Why this exists, in 2-3 sentences. Links: [Spec](<confluence-url>) · [Plan](<confluence-url>) · Phase N of M.

## Objective
One paragraph: the observable outcome of this story.

## Implementation notes
Exact file paths, key steps, and code snippets from the plan task. Known
constraints (conventions, libraries, patterns to follow or avoid).

## Acceptance criteria
- [ ] Objectively checkable statements — each one testable by a stranger.

## Test notes (TDD)
Expected behavior + edge cases, written before implementation. The testing
subtasks below are derived from this section.

## Out of scope
What a diligent agent might be tempted to do but must not.

## Dependencies
Blocked by: <issue keys>. Do not start until they are Done.

## Definition of done
Tests written and passing · lint/build clean · acceptance criteria checked off.
```

Summaries are imperative and specific ("Add CSV column-mapping UI to import flow", never "Import work pt. 2").

## Structure to create

- **Epic per phase** — description: the phase goal, its "Done when", and the plan link.
- **Story per task** under its phase's epic, using the template above, in plan order.
- **Two subtasks per story** — `Automated tests: <story>` and `Manual test: <story>` — each carrying concrete instructions derived from the story's Test notes. This is deliberate TDD scaffolding: the testing work is visible and assignable from the moment the story exists. (Skip only if the user says so.)
- **One `Flow test — <phase>` story per epic** — instructions to verify the phase's "Done when" end to end once its stories close.
- **Dependencies:** where the plan orders tasks, link them (`getIssueLinkTypes` → `createIssueLink`, "Blocks") or list keys in the Dependencies section when links aren't available.
- **Labels:** add `ai-agent-ready` and a plan slug label to everything created, so the batch is findable and filterable.

## Approve before creating — and never duplicate

1. Draft the full payload to `jira-payload.md` in the workspace: a summary table (epics, stories, subtasks, flow tests, counts) plus every issue body.
2. Show the user the summary table and get an explicit go-ahead before creating anything. **Dry run** (or no Jira tools): stop here, deliver the payload file, state clearly that nothing was created.
3. On go-ahead, create idempotently: before each create, search the project (`searchJiraIssuesUsingJql`, `project = X AND summary ~ "<title>"`) — an existing match gets updated (`editJiraIssue`), not duplicated. Re-running this skill must converge, not multiply.
4. Never transition or overwrite the status of existing issues.

## Report

End with a table: issue key → summary → type → link, grouped by epic. Write the keys back into the workspace `plan.md` next to their tasks.

Then hand off the execution, which is a command now rather than a pasted prompt:

- **`/kairoku:run-epic <EPIC-KEY>`** — run one epic as dependency waves. Suggest `dryRun` first
  so the user sees the wave plan before anything moves.
- **`/kairoku:run-sprint "<name>"`** — once the stories are in a filled, approved sprint.

Say which epics have no cross-epic `Blocks` links, since those can run concurrently.

If you created issues directly while a Kairoku project exists, repeat the mapping warning here rather than only at the top — it is the one thing in this report that will bite silently later.
