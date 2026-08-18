---
name: capture
description: Capture a raw idea and give it somewhere to live — a Kairoku project at idea stage plus a document holding the thinking. Use when the user has a thought, a "what if we", a half-formed feature, or a problem worth remembering, and it is not yet a spec. This is the first station, before writing-specs.
argument-hint: "<the thought, in your own words>"
---

# Capture

The point of this skill is that a thought does not stay in your head. Not a spec, not a plan,
not a ticket — somewhere structured, with enough context that it still makes sense in a month.

Keep it short. Capture should take two minutes; if it turns into an interview you have
overshot, and the user should be running `/kairoku:writing-specs` instead.

## 1. Take the thought as given

`$ARGUMENTS` is the idea. Do not improve it, do not restate it back, do not open with "Great
idea". Read it and work out what is missing.

## 2. Ask at most three questions, one at a time

Only ask what changes where this lands. Usually:

- **Scale** — is this a new product, a feature in something that exists, or a change to
  something already specified? This decides the onward route more than anything else.
- **Which project** — if it belongs to an existing one, name it; if not, it needs its own.
- **The itch** — what problem does it solve, or what made you think of it? One line. This is the
  thing you will have forgotten in a month, and it is the reason the note is worth keeping.

Skip any of these you can infer confidently from the repo or the conversation. Do not ask about
scope, timelines, tech choices, or success measures — that is spec work, and asking now is how
a two-minute capture becomes an abandoned one.

## 3. Land it

**New product or standalone idea** → a Kairoku project with a `v1` release at `idea` stage.
Capturing the idea and starting its first release are the same act.

**Feature or change to an existing project** → a document on that project, and a line on the
roadmap's Next or Later bucket. Do not create a release for it; releases get scoped by Toryo.

The document is short and honest:

```markdown
# <A title someone could search for>

**The idea:** <the user's own words, kept>
**Why it came up:** <the itch>
**Scale:** product | feature | change
**Status:** captured — not specced

## Open questions
<the things you deliberately did not ask about>

## What would make this worth building
<one or two lines, if the user said anything; otherwise leave the heading and say "not yet discussed">
```

Open questions matter more than answers here. They are what the spec interview will start from.

### What you can and cannot do here (see `kairoku-mcp`)

**Documents you can write.** `create_document(project, type: "note", title, content)` puts the
capture straight into Kairoku, where the app's chat and this terminal are appending to the same
record. Call `list_documents` first — the app pulls the Confluence space in, so the title may
already exist, and duplicates cannot be deleted over MCP.

**Projects you cannot.** There is no create-project tool: quick capture is the app's own front
door and it stays that way. So for a genuinely new idea:

- give the user the one line to quick-capture in the app, which creates the project and its
  `v1` release at `idea` stage in one act,
- then write the document onto it once it exists — or, if they would rather not switch windows
  right now, write the document to Confluence under `Planning/Ideas` and tell them plainly that
  it is not on the board yet,
- do not silently skip this. An idea that only exists in Confluence is half-captured, and the
  board is what they actually look at.

## 4. Reply in three lines

What you captured, where it lives (with the link), and the route onward — `/kairoku:writing-specs` when
they are ready to think it through, or nothing at all if it is just parked. Parking is a
legitimate outcome; say so rather than pushing them toward a spec they did not ask for.
