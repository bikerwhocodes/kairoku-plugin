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
| `create_document(project, type, title, content)` | Filing a spec, plan, or report **into** Kairoku. Types: `spec`, `plan`, `prd`, `research`, `note`, and the design/diagram kinds |
| `update_document(document_id, content, title?)` | Revising one you (or the Confluence pull) already put there — the correct move whenever the title already exists |
| `upsert_plan(project, release, phases[])` | Writing plan structure: phases, items, `testNotes`. Idempotent by name; never overwrites an item's status or its Jira key |

`get_project` before `get_plan` before anything else — one call usually answers what three
Jira searches would.

**List before you create.** `create_document` has no dedupe, and no tool on this server can
delete anything. The app pulls the whole Confluence space in, so a document you are about to
create very often already exists under the same title. `list_documents` first, then
`update_document` on the id you find. A duplicate is permanent until a human removes it in the UI.

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

## What is still the human's click

The write tools landed (SPEC §8 v1.1), so authoring now happens *in* Kairoku. What did **not**
land is anything that fires the app's outbound sync — and that omission is deliberate:

| Still manual | Why |
|---|---|
| Creating a project or release | Quick capture is the app's front door, and stage is a human judgment |
| **Push plan → Jira** (Sync tab) | The only writer that creates `sync_mappings`. No `push_plan` tool exists |
| **Publish document → Confluence** | Same: the publish path is what records the page mapping |
| Changing a release stage | A gate, not a status |

So the shape is: **agents write into Kairoku, the human pushes out of it.** Write the document
or the plan, then say plainly what the user needs to click and what scope to push. Do not
route around it by writing to Confluence or Jira yourself — that is the second-writer problem
this whole protocol exists to prevent.

One consequence worth knowing: a plan written by `upsert_plan` carries no mappings until it is
pushed. If its items already have Jira issues, pushing again duplicates them rather than
linking. `get_plan` and check for existing Jira keys before telling anyone to push.

**Always** `add_progress_note` at the end of a session or wave, so the dashboard is not blind
to work that happened outside it.

## Signing in

The server is an OAuth resource server and the plugin sends no token of its own. A call against
a signed-out server comes back 401 with a `WWW-Authenticate` header, the client reads the
authorization server out of it, and the user finishes in a browser. Once per machine, not once
per session — the grant survives restarts. Nobody pastes a token any more.

An agent cannot do this for the user. If the tools are missing or every call 401s, name the
command and move on:

| Client | Sign in with |
|---|---|
| Claude Code | `/mcp` → **kairoku** → **Authenticate**, or `claude mcp login kairoku` |
| OpenAI Codex CLI | `codex mcp login kairoku` |
| Augment auggie | the TUI's `/mcp` popover, which offers it once the server 401s |

Headless runs have no browser, so a token from Settings → MCP access still works there — but the
run supplies it, not the plugin (Codex's `bearer_token_env_var`, or a `--mcp-config` carrying the
header). Never ask an interactive user for one: Claude Code treats a rejected `Authorization`
header as a failed connection and stops, so a stale token reads as an outage and the sign-in
prompt never appears.

## When the server is not connected

Kairoku is optional. If the MCP server is absent, unconfigured, or signed out, say so once — with
the sign-in command if that is what it needs — then carry on. Jira and Confluence are enough to
run the loop. Do not fail a story because the dashboard is unreachable, and do not silently skip
the progress note without mentioning it.
