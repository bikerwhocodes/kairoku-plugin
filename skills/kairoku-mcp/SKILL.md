---
name: kairoku-mcp
description: How Kairoku agents read from and write back to the Kairoku app over MCP — which of its tools to use for what, how to report progress without spamming the activity log, and which writes belong to the app rather than the agent. Background knowledge for agents; not a user command.
user-invocable: false
---

# Working with the Kairoku app

Kairoku is where the user thinks: ideas, documents, and the plan live there, and the app is
what pushes them out to Jira and Confluence. Agents read that context and report progress back.
They do not keep a second copy of it.

Default project: `${user_config.kairoku_project_slug}`.

## The tools, and what each is for

| Tool | Reach for it when |
|---|---|
| `list_projects(stage?)` | Orienting across projects, or finding what is in `building` |
| `get_project(project)` | One project's overview, plan summary, and document index — the cheapest way to get oriented |
| `get_plan(project, release?)` | The release's phases and items with their statuses and **Jira keys**. This is how you map a plan item to the issue you are about to work |
| `list_documents(project, type?)` / `get_document(id)` | Reading the spec, plan, or a design doc as the app holds it |
| `search_documents(query, project?)` | Finding the document that mentions a thing when you don't know its title |
| `update_item_status(item_id, status, note?)` | A plan item genuinely changed state: `not_started` / `in_progress` / `blocked` / `done` |
| `add_progress_note(project, note)` | A milestone worth a line on the activity feed |

`get_project` before `get_plan` before anything else — one call usually answers what three
Jira searches would.

## Reporting progress without noise

The activity log is something a human reads. Treat it that way.

- **One `add_progress_note` per wave**, not per story and never per commit. "Wave 2 of KAIR-179
  merged green: KAIR-183, KAIR-184, KAIR-192" is a note. "Committed 3 files" is noise.
- **`update_item_status` when the item's state actually changed**, mirroring the Jira status —
  `blocked` included. The app refreshes item status from Jira on its own, so this is for
  keeping the dashboard live *between* refreshes, not for driving it.
- Never write a note to say you are starting. Start, then say what happened.

## What agents write, and what the app writes

This is the line that keeps the dashboard trustworthy:

**The app owns structure.** Pushing the plan to Jira, publishing documents to Confluence, and
maintaining the `sync_mappings` that tie them together — all of that is the app's, triggered by
the user or by the app's own Sync tab. An agent that creates Jira issues directly produces
issues with no mapping, which the app's status refresh will never see. The Plan tab then goes
quiet and nobody knows why.

**Agents own runtime.** Transitions, comments, subtask closure, progress notes, item status.
The things that happen while work is being done.

So: never call `createJiraIssue` for plan structure, and never publish a page that the app also
manages. Write the plan into Kairoku and let the app push it.

## Hybrid mode (current)

Kairoku's MCP surface is read-plus-progress today — there are no document or plan write tools
yet (SPEC §8). Until they land:

- **Read** context from Kairoku as above.
- **Write** documents to Confluence and plan structure to Jira the way the writing skills do
  now, and **link back**: put the Kairoku project and document URLs on the pages you create so
  the two records point at each other.
- **Always** `add_progress_note` at the end of a session or wave, so the dashboard is not blind
  to work that happened outside it.

When `create_document` / `upsert_plan` / `push_plan` ship, the writing skills switch to writing
into Kairoku and triggering the app's push. Nothing else in this protocol changes.

## When the server is not connected

Kairoku is optional. If the MCP server is absent or unconfigured, say so once, then carry on —
Jira and Confluence are enough to run the loop. Do not fail a story because the dashboard is
unreachable, and do not silently skip the progress note without mentioning it.
