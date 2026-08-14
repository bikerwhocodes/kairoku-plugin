---
name: status-report
description: A status report worth sending — sprint progress, what is blocked and why, gate state, and delivery metrics, rendered in the terminal and publishable to Confluence or Kairoku. Use when the user asks for a status report, a progress summary, or something to share with someone else.
argument-hint: "[sprint | release | project]"
---

# Status report

The difference between this and `/kairoku:standup` is the audience. Standup is for the person
doing the work; this is for someone who was not in the room and needs to trust it.

## Live data

```
!`kairoku-jira sprint current 2>&1 | head -3`
```

```
!`kairoku-jira sprint issues "$(kairoku-jira sprint current --json 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin)["name"])' 2>/dev/null)" 2>&1 | head -40`
```

If either is empty or the helper is unconfigured, fall back to JQL against
`${user_config.jira_project_key}` and say which source you used. Never present a report without
saying where the numbers came from.

Add, from Kairoku if connected: `get_plan` for computed release progress, and the release stage.

## The report

```markdown
# <Project> — <release> · <sprint>
<date> · source: <Jira sprint N / JQL / Kairoku plan>

**Where it stands.** <Two sentences. Stage, what shipped, what is next.>

## Progress
<done>/<total> stories · <phases complete>/<phases> phases · release <N>%

| Epic | Stories | State | PR |
|---|---|---|---|

## Blocked
| Item | Blocked on | Since | Who unblocks |
|---|---|---|---|

## Gates
- [x] <gate that genuinely moved>
- [ ] <gate still waiting> — waiting on <what>

## Delivery signal
- Cycle time: <median days from In Progress to Done, this sprint>
- First-pass test rate: <stories whose Automated tests closed without a re-run>
- Agent corrections: <stories that needed a second attempt or were re-opened>

## Next
<the single next action, and who owns it>
```

## Rules that keep it trustworthy

- **Blocked is the most important section.** Put it above the fold and name what unblocks each
  item and who owns that. A report that leads with progress and buries blockers is a report
  people stop reading.
- **Never count a story done because its tests passed.** Green plus merged.
- **Never tick a gate the human has not verified.** If the preview is unverified, the gate is
  open, and the report says "waiting on manual verification" with the URL.
- **Compute the metrics or omit them.** A cycle time you estimated is worse than no cycle time.
  If the data is not there, say "not enough closed stories to compute" and move on.
- If the sprint is going badly, the report says so in the first line. Softening it here is how a
  project ends up surprised.

## Publishing

Render in the terminal by default. Offer to publish — as a Confluence page under the project's
Planning parent, or as a Kairoku document once write tools exist. Ask before publishing; a
status report that appears without warning is rarely welcome.

`$ARGUMENTS` scopes to a sprint, release, or project. Default: the active sprint.
