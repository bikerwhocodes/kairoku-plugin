---
name: sprint-close
description: Close a sprint honestly — review section, carry-over with destinations, QA run link, journal entry, and the gates that actually moved. Use at the end of a sprint, or when the user asks to wrap one up.
argument-hint: "[sprint name]"
allowed-tools: Bash(kairoku-jira *)
---

# Sprint close

A sprint closes on what happened, not on what was planned. The job here is to make the record
match reality, including the parts that did not go well.

## 1. Gather

```
!`kairoku-jira sprint current 2>&1 | head -5`
```

Then, for the sprint being closed: its issues and their real statuses, the epic PRs and whether
they merged, the QA Run page, and the sprint page's working notes.

## 2. Write the review

On the sprint page:

- **Demo notes** — what a person can now do that they could not before. In their language, not
  issue keys.
- **What landed** — stories done, with the epic PRs.
- **Carry-over, each with a destination.** Next sprint, backlog, or dropped — never a bare list.
  An item with no destination reappears every sprint and nobody ever decides about it.
- **What blocked, and why.** Placeholder test notes, spec contradictions, a dependency that
  turned out to be real. This is the section that makes the next sprint better; do not soften it.
- **QA run link**, and whether the automated gate flipped.

## 3. Honesty checks

- A story is not done because its branch merged — its tests must be green **and** its PR merged.
- **Never tick a Manual test item or the Manual Test Checklist.** If the human has not verified
  the preview, the sprint closes with that outstanding and the review says so.
- If the sprint goal was not met, say that in the first line of the review. A sprint that
  quietly reports partial success as success teaches nobody anything.

## 4. Close it

1. `kairoku-jira sprint close "<name>"` — unconfigured helper means a manual close in Jira.
2. Move carry-over issues to the next sprint where that is the destination.
3. Update the Release page: tick only the gates that genuinely moved.
4. Append the Build Journal entry (`/kairoku:wrap` covers the session-level version; this is the
   sprint-level one).
5. Post one `add_progress_note` to Kairoku with the sprint outcome.

## 5. Report

Goal met or not, what landed, what carried and where to, what is still waiting on the human,
and the next action — usually `/kairoku:sprint-start` for the following slice, or the manual
checklist if a preview is still unverified.
