---
name: spec-change
description: Propose a spec change properly instead of silently diverging. Use whenever the spec is ambiguous, wrong, or contradicted by what the code needs — including when an agent hits the contradiction mid-implementation.
argument-hint: "[what bit, and where]"
disable-model-invocation: false
---

# Spec change

The spec is the source of truth. When reality and the spec disagree, one of them changes on
the record — never quietly in the code.

Run the change in four beats, and **stop after step 2 for approval**:

1. **State the problem.** What the spec says, what reality demands, and where it bit —
   `$ARGUMENTS` if the user named it, otherwise the issue key and the line that forced it.
   Quote the spec text rather than paraphrasing it.
2. **Propose the minimal edit.** The exact section, old wording → new wording, and the ripple:
   which other spec sections, plan items, and Jira issues are affected. If the ripple reaches
   more than a handful of issues, say so — that is a signal the change is bigger than it looks.
3. **Wait for approval.** Do not edit, do not publish, do not comment on Jira before this.
4. **On approval, land it everywhere at once:**
   - edit the spec (repo file and/or the Kairoku document — whichever is the record here),
   - republish so the Confluence page matches,
   - add the Decision Log row: number, date, the why, and revisit-when,
   - comment on every affected Jira issue so agents building against them see the change
     before they start, not after,
   - if a story is mid-flight in a running epic, say which one and whether it should be
     blocked pending the change.

Never batch unrelated changes into one proposal — one problem, one proposal, one decision row.
A proposal that says "and while we're here" is two proposals wearing a coat.
