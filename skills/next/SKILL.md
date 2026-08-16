---
name: next
description: The one front door — where everything stands and the single thing to do now, answered from live release gates. Use when the user asks "what now", "what should I do next", "where are we up to", or comes back to a project after time away.
argument-hint: "[project]"
---

# What to run next

One question, one answer: **what is the next thing to do, and what do I type to do it.**

Not a status report, not a backlog, not a menu. If the user wanted the longer version they
would have run `/kairoku:standup`.

## Read the gates, not the backlog

Fastest path first, and stop as soon as you can answer:

1. **Kairoku** (if connected): `get_project` then `get_plan` for
   `${user_config.kairoku_project_slug}` — release stage, phase progress, item statuses.
2. **The current Release page** — which gates are ticked, which is next, what it waits on.
3. **The active sprint** — `kairoku-jira sprint current`, then its issues. If the helper exits 2
   it is unconfigured; fall back to JQL on `${user_config.jira_project_key}` and carry on.
4. **Open PRs** — an epic PR sitting unmerged is usually the real answer.

Do not read the whole journal, the decision log, or every document. You are answering one
question.

## Decide the one thing

Walk the loop in order and stop at the first gate that is actually waiting:

| What you find | The answer |
|---|---|
| No idea captured yet | `/kairoku:capture "<thought>"` |
| An idea at `idea` stage, nothing specced | `/kairoku:writing-specs` |
| A spec approved, no plan | `/kairoku:writing-plans` |
| A plan approved, nothing in Jira | push the plan from Kairoku's Sync tab |
| Stories in Jira, no sprint filled | ask Hancho to fill the sprint |
| A sprint page in draft | review and approve it — link it |
| A sprint approved, epics unstarted | `/kairoku:run-sprint "<name>"` |
| One epic ready, others blocked | `/kairoku:run-epic <KEY>` |
| An epic PR open, tests green | review and merge it — link it |
| A preview deployed, checklist compiled | **verify it yourself** — give the URL and the checklist link |
| Everything green, release gates ticked | promote the release |
| Stories blocked on placeholder Test notes | name them; they need defining before anything runs |

## Answer in this shape

```
<Project> <release> — <stage>. <One line on where it actually is.>

Next: <the single action>
  <the exact command, or the exact link>

Also waiting: <at most two, one line each — only if genuinely parallel>
```

Under 100 words. If two things are genuinely independent, say which is the critical path
rather than listing both as equals.

**When the next action is the human's** — verifying a preview, approving scope, merging a PR —
say so plainly and give them the link. That is a real answer, not a failure to find one. The
manual gate is the point, not an obstacle.

If nothing is waiting, say the project is idle and offer the smallest useful next step. Do not
manufacture urgency.

`$ARGUMENTS`, if given, scopes this to one project.
