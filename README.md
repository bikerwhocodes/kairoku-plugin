# Kairoku 一里塚

**The road from idea to shipped** — a Claude Code plugin for solo builders driving AI agents, with Confluence and Jira as the systems of record and the repo kept clean of documents.

Kairoku (回顧録) is the record of the journey. **Kairoku marks the milestones along it** — named for the milestone mounds (一里塚) placed every ri along the Edo-era kaidō roads — you always know exactly how far you've come and what station is next:

```
idea ──[writing-specs]──▶ spec ──[writing-plans]──▶ plan ──[writing-jiras]──▶ Jira
      Confluence ◀── published          Confluence ◀── published        epics · stories · TDD scaffold
                                                                              │
   ship ◀──[preview gate: human]◀──[Metsuke: QA]◀──[ultracode waves]◀──[Hancho: sprint]
```

## What's inside

**Skills** (the writing stations — each drafts in a temp dir, publishes to Atlassian, never commits docs to the repo):

| Skill | Does |
|---|---|
| `writing-specs` | Socratic interview → spec → Confluence |
| `writing-plans` | Spec → phased, test-first plan (testNotes per task) → Confluence |
| `writing-jiras` | Plan → agent-executable issues: epic/phase, story/task, `Automated tests` + `Manual test` subtasks per story, `Flow test` story per epic, Blocks links, idempotent create-or-update |
| `writing-project-docs` | The planning layer: poster, decision log, risk register + premortem, roadmap, test strategy, runbook, release checklist, build journal, retro template — pre-filled with real project facts, plus Releases/Sprints/QA structure |

**Agents** (the station masters):

| Agent | Is | Owns |
|---|---|---|
| **Toryo** 棟梁 | Master builder — release architect | Releases/ pages: scope, gates, notes; the conversational front door ("what do I run next?") |
| **Hancho** 班長 | Squad leader — sprint lead | Sprints/ pages: stories in dependency order, approval gate, filled epic-execution prompts |
| **Metsuke** 目付 | Inspector — QA | Tests-first from Test notes, flow tests per epic, QA Run pages, compiles the Manual Test Checklist (never ticks it) |
| **Yuhitsu** 右筆 | Scribe — documentation | Wields the four writing skills; decision log and journal discipline |

**Commands:**

- `/kairoku:init` — bootstrap a new project: Confluence structure (pre-filled), Jira checklist, repo CLAUDE.md
- `/kairoku:standup` — catch-up brief: what moved, what's blocked, what to run now
- `/kairoku:wrap` — end-of-session ritual: journal entry, decision rows, status sync
- `/kairoku:spec-change` — propose → approve → edit → republish → log, never silent divergence
- `/kairoku:epic-prompt <EPIC-KEY>` — fill the ultracode epic-execution prompt, ready to paste

**Epic execution** (`epic-execution-prompt.md`): one ultracode + Workflow session per epic — scout the dependency graph, partition stories into waves, one worktree-isolated agent per story (tests first, subtask evidence), barrier + full suite between waves, flow test at the end. Independent epics run as parallel Claude Code sessions.

## The one human gate

Agents write and run automated tests, but **`Manual test` subtasks and the Manual Test Checklist belong to the human**, verified against the Vercel preview before promote. No agent ever closes them. That's the line that keeps "done" honest.

## Install

```bash
/plugin marketplace add bikerwhocodes/kairoku-plugin
/plugin install kairoku@kairoku-marketplace
```

Requires an Atlassian MCP connection (Jira + Confluence) in the environment where agents run.

## Roadmap — and the Kairoku flywheel

Kairoku's first test app is **Kairoku**, an idea-management dashboard that is itself the productized version of this road. The loop: run Kairoku manually → notice friction → fix it in the plugin → when a piece proves out, **graduate it into Kairoku as a product feature**. Planned graduations and gaps:

- **Defect intake** — a defect template in writing-jiras (bugs need Context/Repro/Expected, not story anatomy) → later Kairoku's activity log auto-files them.
- **Release-notes generator** — draft notes from closed epics + journal entries → later a Kairoku button.
- **Metrics** — cycle time per story, first-pass test rate, agent-correction rate per sprint, feeding retros → later Kairoku's Overview.
- **Auto manual-checklist** — compile the checklist page from `Manual test` subtasks the moment a preview URL exists → later Kairoku does it on deploy detection.
- **`/kairoku:init` full automation** — today it scaffolds Confluence + repo; Jira project/space creation stays manual (no API) → later Kairoku's "new project" wizard walks it.
- **Epic prompts over MCP** — Kairoku's MCP server grows a `get_epic_brief` tool so execution sessions pull their brief live instead of pasting prompts.
- **Journal auto-entries** — agents' MCP progress notes become draft journal entries awaiting approval.

## Layout

```
kairoku/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── skills/            writing-specs · writing-plans · writing-jiras · writing-project-docs
├── agents/            toryo · hancho · metsuke · yuhitsu
├── commands/          init · standup · wrap · spec-change · epic-prompt
├── epic-execution-prompt.md
└── README.md
```
