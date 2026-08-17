# Kairoku 一里塚

**The road from idea to shipped** — a Claude Code plugin for solo builders driving AI agents.
You think in Kairoku; the plugin executes what you decided, and keeps Jira honest while it does.

Kairoku (回顧録) is the record of the journey. **Kairoku marks the milestones along it** — named
for the mounds (一里塚) placed every ri along the Edo-era kaidō roads — so you always know how
far you have come and which station is next.

```
thought ──[capture]──▶ idea ──[spec]──▶ spec ──[plan]──▶ plan ──▶ Jira
                                                    epics · stories · TDD scaffold
                                                              │
  ship ◀──[preview gate: you]◀──[QA]◀──[run-epic: waves]◀──[sprint-start]
```

## Why this exists

Ideas evaporate, plans drift from tickets, and parallel agent work turns a board into fiction.
The plugin exists to stop each of those: a two-minute capture so nothing is lost, one record so
the plan and the tickets cannot disagree, and an execution path where every status on the board
was set by something that actually ran.

## The one human gate

Agents write tests, run them, open pull requests, and move issues. They do **not** close
`Manual test` subtasks, tick the Manual Test Checklist, or merge their own PR. You verify the
preview and you merge. That line is what keeps "done" meaning something.

## Commands

**Thinking**

| Command | Does |
|---|---|
| `/kairoku:capture "<thought>"` | Park an idea somewhere structured. Two minutes, three questions at most |
| `/kairoku:next` | Where everything stands and the one thing to do now |
| `/kairoku:standup` | The longer catch-up brief after time away |
| `/kairoku:spec-change` | Propose a spec change properly, with its ripple, instead of diverging |

**Structuring**

| Command | Does |
|---|---|
| `/kairoku:writing-specs` | Idea → interview → spec, at product, feature, or change scale |
| `/kairoku:writing-plans` | Spec → phased, test-first plan with test notes per task |
| `/kairoku:writing-jiras` | Plan → agent-executable issues with the TDD scaffold |
| `/kairoku:writing-project-docs` | The planning layer: decision log, risk register, roadmap, runbook, journal |

**Doing**

| Command | Does |
|---|---|
| `/kairoku:sprint-start` | Fill the next slice, stop for your approval, start it in Jira |
| `/kairoku:run-epic <KEY>` | Run an epic as dependency waves. Add `dryRun` to see the plan first |
| `/kairoku:run-sprint "<name>"` | The same, one level up, two epics at a time |
| `/kairoku:warroom` | Interactive alternative: teammates you can talk to (experimental) |
| `/kairoku:sprint-close` | Close honestly — carry-over with destinations, gates that really moved |

**Reporting**

| Command | Does |
|---|---|
| `/kairoku:status-report` | A report worth sending someone, from live data |
| `/kairoku:budget` | What an epic will cost before you launch it |
| `/kairoku:wrap` | End-of-session ritual: journal entry, decision rows, status sync |
| `/kairoku:init` | Bootstrap a new project onto the road |

## Agents

| Agent | Is | Owns | Runs on |
|---|---|---|---|
| **Toryo** 棟梁 | Master builder — release architect | Release pages: scope, gates, notes. The front door | `opus` / high |
| **Hancho** 班長 | Squad leader — sprint lead | Sprint composition, the wave plan, launching the work | `opus` / xhigh |
| **Daiku** 大工 | Carpenter — story implementer | One story: tests first, green, committed, honest status | `sonnet` / xhigh, worktree |
| **Metsuke** 目付 | Inspector — QA | Tests from test notes, flow tests, the manual checklist it never ticks | `sonnet` / high |
| **Yuhitsu** 右筆 | Scribe — documentation | The writing skills, decision log, build journal | `sonnet` / medium |

Implementation runs on Sonnet because that is where the tokens go and Sonnet 5 at `xhigh` is
strong on agentic coding; review runs on Opus because a confident wrong finding costs more than
a missed one. Hancho escalates individual stories to Opus when they are architectural.

Three more skills are protocol rather than commands — `jira-ops`, `git-pr`, `kairoku-mcp` — and
are preloaded into the agents that need them. They are why every agent transitions issues the
same way and writes the same shape of PR.

## How execution works

`/kairoku:run-epic KAIR-179` is a workflow, not a prompt:

1. **Scout** reads every story and builds the dependency graph — including implicit conflicts
   the `Blocks` links miss — and partitions it into waves. Stories with placeholder test notes
   are blocked here, not improvised later.
2. **Each wave** fans out one agent per story, each in its own git worktree, tests first.
3. **The barrier** merges the wave into the epic's integration branch and runs the **full**
   suite — wave-level breakage is exactly what per-story green misses. Red stops the epic.
4. **Review** runs on Opus, and every finding is independently refuted before it is reported.
5. **Flow test** walks the phase's "Done when" end to end in the running app.
6. **Close** opens one PR with the manual checkboxes unticked, and drafts the journal entry.

Run it with `dryRun` first. It prints the wave plan and changes nothing.

## Install

```bash
/plugin marketplace add bikerwhocodes/kairoku-plugin
/plugin install kairoku@kairoku-marketplace
```

Then set the config it prompts for. The two that matter are your Jira project key and
Confluence space key; everything else is optional and degrades cleanly.

**Requires** an Atlassian MCP connection — the official `atlassian` plugin is the easy way. This
plugin deliberately does not declare its own, because a second server would duplicate every tool.

**Optional:**

- **Kairoku app** — set `kairoku_url`, then sign in as below. Without it, everything runs on Jira
  and Confluence alone; you lose the dashboard and progress notes.
- **Atlassian API token** — enables `bin/kairoku-jira`, which covers boards, sprints and ranking
  over the Agile API that the MCP server does not expose. Without it, starting and closing a
  sprint is a manual click and nothing else changes.

### Signing in to the app

The Kairoku server authenticates over OAuth. Point a client at it, and the first call comes back
401 saying where to sign in; you finish in a browser and the grant survives restarts. There is no
token to copy and nothing to rotate by hand.

```
/mcp  →  kairoku  →  Authenticate          # or: claude mcp login kairoku
```

The plugin sends no `Authorization` header, and that is the point. Claude Code treats a header
the server rejects as a failed connection rather than falling back to sign-in, so shipping a
default token would turn every expired credential into what looks like an outage — with no way
out of it from the UI.

**Codex and auggie read their own config, not this plugin's.** A Claude Code plugin cannot
register a server for them, so each client is configured once by hand — same URL, same sign-in:

```toml
# ~/.codex/config.toml            then: codex mcp login kairoku
[mcp_servers.kairoku]
url = "https://kairoku.io/api/mcp"
```

```jsonc
// ~/.augment/settings.json       or: auggie mcp add-json kairoku '<json>'
{ "mcpServers": { "kairoku": { "type": "http", "url": "https://kairoku.io/api/mcp" } } }
```

auggie has no login subcommand; open `/mcp` in the TUI and authenticate when it offers. For CI,
where none of the three can open a browser, Codex takes `bearer_token_env_var` and the others
take a static header — that is what a token from Settings → MCP access is still for.

## Where things live

Kairoku holds the thinking — ideas, documents, the plan — and pushes it out to Jira and
Confluence. The plugin reads that, executes it, and reports back. The one rule that keeps the
two honest: **the app owns structure, agents own runtime.** Plan pushes and document publishing
are the app's, because that is what maintains the mappings the dashboard reads. Transitions,
comments, subtask closure and progress notes are the agents'.

## Layout

```
kairoku/
├── .claude-plugin/     plugin.json (userConfig) · marketplace.json
├── .mcp.json           the Kairoku server
├── skills/             4 writing · 3 protocol · 10 commands
├── agents/             toryo · hancho · daiku · metsuke · yuhitsu
├── workflows/          run-epic · run-sprint
├── hooks/              session-start orientation
├── bin/                kairoku-jira (Agile API) · kairoku-context
└── epic-execution-prompt.md    for running an epic in a separate session
```

## Roadmap

The first test app for Kairoku is Kairoku. The loop: run it, notice friction, fix the plugin,
and when a piece proves out, graduate it into the app as a feature.

- ~~**MCP write tools**~~ — `create_document`, `update_document` and `upsert_plan` shipped
  (SPEC §8 v1.1), so the plugin writes *into* the app rather than around it. Still outbound-only
  by hand: pushing a plan to Jira and publishing a document to Confluence are the app's own
  buttons, because they are what maintain the mappings.
- **`get_epic_brief`** — everything an execution session needs in one call, instead of the
  scout agent reassembling it from Jira each run.
- **A phase-status tool** — an item-less phase is stuck at `not_started` with no way to move it.
- **Sprint ops in the app** — retires `bin/kairoku-jira` and its second credential.
- **Defect intake** — bugs need Context/Repro/Expected, not story anatomy.
- **Release notes** from closed epics and journal entries.
- **Metrics** — cycle time, first-pass test rate, agent-correction rate, feeding retros.
