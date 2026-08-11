---
name: writing-jiras
description: Turn an approved implementation plan into Jira issues written so an AI coding agent can execute each one without asking questions — epic per phase, story per task carrying full context, acceptance criteria and test notes, testing subtasks, and a flow-test story per epic. Use when the user wants to "push the plan to Jira", "create the tickets", "write the stories/epics/Jiras", or hand work off to coding agents. Requires a plan (writing-plans output, a Confluence plan page, or equivalent); drafts payloads in a temp directory and never stores anything in the repo.
---

# Writing Jiras

A coding agent gets **one issue** as its entire brief. It can't walk over to your desk, so every story must be self-sufficient: why this exists, what to build, where the code goes, how to prove it works, and links to the deeper documents. Vague tickets are where agent runs go to die — this skill exists to make each ticket a complete, executable contract.

Work in the same temp workspace as the spec/plan (`${TMPDIR:-/tmp}/specs-and-plans/<date>-<slug>/`); never write into the repo, never commit anything.

## Inputs

Resolve the plan: a Confluence plan page (fetch it), the workspace `plan.md`, or a plan agreed in conversation. No plan → route to **writing-plans**. Also collect the spec link — stories cite both.

## Target selection

Find the Jira tools among available tools (commonly `mcp__Atlassian_Rovo__*`; any Jira MCP works). Resolve the cloudId, list projects (`getVisibleJiraProjects`), and confirm the target project with the user unless they named it. Check its issue types: use **Epic + Story + Subtask** where available; fall back to Task when Story doesn't exist (team-managed projects vary). If Subtask isn't available, fold test tasks into the story checklist and say so.

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

End with a table: issue key → summary → type → link, grouped by epic. Write the keys back into the workspace `plan.md` next to their tasks. Then offer the kickoff: a ready-to-paste prompt for the coding agent, e.g. *"Work KAIR-42: fetch the issue, read its Context links, write the tests from Test notes first, implement until acceptance criteria pass, then close the testing subtasks."*
