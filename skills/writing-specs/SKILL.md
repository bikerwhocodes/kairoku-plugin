---
name: writing-specs
description: Turn a rough idea into an approved spec through short, one-at-a-time questions, then publish it to Confluence — drafting only in a temp directory, never in the repo. Use whenever the user wants to brainstorm, design, spec, or think through a feature, product, or change before building it — phrases like "write a spec", "design doc", "help me figure out how X should work", "let's design this", or any new-feature conversation that has no spec yet, even if the word "spec" never appears. Do not use for breaking an existing spec into implementation work (that is writing-plans) or for creating Jira issues (writing-jiras).
---

# Writing Specs

Turn an idea into a validated, published spec. The spec's home is **Confluence** — the repo never holds design docs, so nothing here is ever committed to git. Drafts live in a temp workspace; the published page is the deliverable.

## The hard gate

Do not write implementation code, scaffold projects, create Jira issues, or invoke any implementation skill until the spec is approved by the user **and** published (or explicitly parked). Designing first is the whole point: the expensive mistakes are the ones you code before anyone agrees on what's being built.

## Workspace rules (why the repo stays clean)

Specs in a repo rot: they drift from the code, clutter reviews, and duplicate the real system of record. Confluence is where teammates and tools will look.

- Create a workspace: `${TMPDIR:-/tmp}/specs-and-plans/<YYYY-MM-DD>-<topic-slug>/` and draft `spec.md` there.
- Never write the spec (or notes for it) inside the current project directory, and never run `git add`/`git commit` for anything this skill produces.
- If a repo is relevant, read it freely for context — reading is encouraged, writing is forbidden.
- Leave the workspace in place after publishing (the OS cleans temp); tell the user the path.

## Process

### 1. Absorb context (read-only)

Skim whatever exists: the repo, prior Confluence pages (search by topic), earlier conversation. Come to the interview already knowing what's knowable.

### 2. Interview — one question at a time

Ask exactly one question per message; prefer multiple-choice (use the AskUserQuestion tool when available). Cover, in rough order: the problem and who has it, what success looks like, constraints (stack, auth, integrations), scope edges, and non-goals. Apply YAGNI ruthlessly — challenge any feature that doesn't serve the stated problem.

**Unattended mode:** if the user has said they're away, or questions go unanswered, don't stall. Make the most reasonable assumption, record it in a visible **Assumptions** section of the spec, and continue. Assumptions the user can correct beat questions nobody answers.

### 3. Propose approaches

Present 2–3 genuinely different approaches with trade-offs, and recommend one with reasons. Let the user pick before any detail work.

### 4. Present the design in sections

Walk through the design section by section, scaled to complexity — a few sentences for the obvious parts, a few hundred words where it's subtle (data model, sync, failure modes). Get a nod per section before moving on. In unattended mode, present all sections at once and mark them provisional.

### 5. Write `spec.md`

Use this structure (drop sections that are truly empty, keep the order):

```markdown
# <Topic> — Spec
> Status: draft | approved · <date> · Assumptions: <count>

## Problem
## Goals / Non-goals
## Approach (chosen + alternatives considered, with why)
## Design
   (subsections as needed: data model, flows, API, UI)
## Edge cases & error handling
## Testing approach          ← how we'll know it works; feeds TDD later
## Assumptions               ← everything decided without the user
## Open questions
## Decisions log             ← what the user chose during the interview
```

### 6. Self-review before showing it

Reread the whole draft hunting for: placeholder text (TBD, "appropriate handling", "etc."), contradictions between sections, ambiguity a stranger would trip on, and scope that crept past the stated goals. Fix what you find — the user should review a clean document.

### 7. User approval

Show the spec (or its path) and ask for approval or edits. Iterate until approved. In unattended mode, mark the spec `draft — pending review` and proceed to publish anyway, saying so.

### 8. Publish to Confluence

Find Atlassian tooling among available tools (commonly `mcp__Atlassian_Rovo__*` in Claude/Cowork sessions; any Confluence MCP works — search available tools for "confluence"). Then:

1. Resolve the cloudId (`getAccessibleAtlassianResources`) and list spaces (`getConfluenceSpaces`); ask the user which space (and optional parent page) unless they already said — remember their choice for the session.
2. Search for an existing page with this title (`searchConfluenceUsingCql`, `title ~ "<title>"` in that space). Found → update it (`updateConfluencePage`); not found → create (`createConfluencePage`). On a title conflict, append a short slug.
3. Keep the markdown Confluence-friendly: headings, lists, tables, code fences — no raw HTML.
4. Report the page URL, and record it at the top of the temp `spec.md`.

**No Atlassian tools available?** Stop, leave the draft in the workspace, give the user the path, and tell them exactly what to connect (Atlassian/Confluence MCP). Don't fake a publish.

**Dry run:** if the user asked for a dry run, write the exact would-be payload (space, parent, title, body) to `confluence-payload.md` in the workspace instead of creating anything, and say clearly that nothing was created.

### 9. Hand off

The terminal state is offering the next step: *"Spec published: <link>. Want me to break it into an implementation plan?"* — that is the **writing-plans** skill. Never jump from spec straight to code.
