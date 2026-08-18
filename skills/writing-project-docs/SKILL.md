---
name: writing-project-docs
description: Create the full project-planning document layer on Confluence — project poster, decision log, risk register + premortem, roadmap, test strategy, runbook, release checklist, build journal, and phase-retrospective template — pre-filled with the project's real facts, organized under a Planning parent page. Use whenever the user wants "project planning docs", "the other documents for the project", a decision log / risk register / roadmap / runbook / charter, or asks what documentation a project needs — no research required, the taxonomy is in this skill. Drafts in a temp directory, publishes to Confluence, never commits to the repo. For the product spec itself use writing-specs; for implementation plans use writing-plans; for Jira issues use writing-jiras.
---

# Writing Project Docs

The planning layer around a spec: orientation (poster, roadmap), memory (decision log, build journal), risk (register + premortem), and quality (test strategy, runbook, release checklist, retros). This skill exists so nobody researches "what docs does a project need" twice — the answer, tuned for a solo builder driving AI agents, is below.

**The one rule that makes these docs worth having: pre-fill with real project facts.** An empty template is furniture; a decision log seeded with the ten decisions already made this month is memory. Mine the spec, the conversation, the repo, and existing pages for real content before writing a word. If you can't seed a section with something true, write the seed question into it instead of lorem.

Work in `${TMPDIR:-/tmp}/specs-and-plans/<date>-<project-slug>/docs/` (drafts), publish to Confluence, never write into the repo, never `git add`/`commit` anything.

## The nine documents

| Doc | Job | Written | Cadence after |
|-----|-----|---------|---------------|
| Project Poster | Orient any human/agent in 2 min: problem, solution, success measures, scope guardrails, links hub, status | At project start | Update at phase gates |
| Decision Log | Append-only decision memory (+ ADR sections for architecture calls). **The critical one with AI agents — chat decisions evaporate** | Seed with every decision already made | The moment each decision lands |
| Risk Register & Premortem | Likelihood × impact table with real mitigations; premortem ("it failed — why?") with counters | At project start | Review each phase gate |
| Roadmap | Now (= the spec, changes only via spec-change) / Next / Later + milestone table | After spec | When tempted by scope; at milestones |
| Test Strategy | Test layers, tools, the TDD contract with agents, fixtures, what's deliberately untested | After spec | Stable; revisit on evidence |
| Runbook | Environments, env vars, secrets rotation, break-glass playbooks ("X fails → do Y") | Skeleton at start | Harden during build |
| Release Checklist | Acceptance criteria as live checkboxes + security pass + production checks + post-ship | From the spec's done-when | Run once before shipping |
| Build Journal | Newest-first session entries: shipped / decided / blocked / next. What a fresh agent session reads to catch up | Seed with entry #1 covering work to date | Every working session |
| Phase Retro (template) | Copy per phase: went well / dragged / agent performance / spec drift / one change | Once | Copied after each phase |

Solo-builder tuning (default): skip OKRs, RACI, comms plans, meeting notes, personas — they assume teams and stakeholders. If the user has a team, offer those as additions rather than silently including them.

## The growth layer (as the project starts building)

Once a release is in motion, three more sections join the space — each a parent page whose body embeds the template its owner-agent copies:

| Section | Owner | Contents |
|---------|-------|----------|
| **Releases/** | release-planner agent | One page per release (`v1`, `v1.1`…): status, scope in/out (from the roadmap's Next bucket, never past non-goals), links (spec, plan, Jira epics, preview URL, QA run), **gates** (plan approved → sprints done → QA green → manual checklist verified on preview → ship checklist), release notes drafted as it builds |
| **Sprints/** | sprint-lead agent | One page per sprint (= one plan phase, usually): goal (the phase's "Done when"), stories table in dependency order with their testing subtasks, working notes, sprint review |
| **QA/** | qa-agent | One QA Run page per release: automated results per story, flow-test results per epic, defects table, and the **Manual Test Checklist** — one checkbox per Manual-test subtask, verified by the human on the preview deployment; agents never tick manual items |

The pipeline these serve: release-planner scopes → writing-plans + writing-jiras produce plan and issues → sprint-lead sequences sprints (human approves) → implementation builds TDD-first → qa-agent writes/runs automated tests and compiles the manual checklist → human verifies on preview → ship.

## Confluence content types — what to use when

The add-content menu offers more than pages. The rule for an agent-driven project: **anything agents read or write is a Page** — pages have a full API, versions, and markdown round-tripping. The rest:

- **Live Doc** — a page without a draft/publish cycle (auto-saving, realtime). Fine for high-churn human docs; creatable via API (`subtype: "live"`), but plain pages are safer for agent create-or-update flows. Optional.
- **Whiteboard** — human sketching only: no content API, so agents can neither read nor write them. Anything decided on a whiteboard must be distilled into a page (Decision Log row, ADR) or it never enters agent memory.
- **Database** — structured rows with views; tempting for decision logs and risk registers, but no MCP/API access today — keep those as tables on pages so agents can maintain them. Revisit if the API lands.
- **Smart Link** — embeds (a Jira board, a GitHub PR) for human glanceability inside release/sprint pages; agents ignore them and query Jira/GitHub directly.
- **Folder** — organization-only and not creatable via API; use **parent pages** as sections instead (Planning/, Releases/, Sprints/, QA/) so agents can create children.

## Process

1. **Gather facts first.** Read the spec (Confluence or repo), the decision trail in the conversation, existing pages in the target space, and the Jira project if one exists. List concrete facts to seed each doc: actual decisions with dates, actual risks with real mitigations from the spec, actual env vars, the spec's real done-when list.
2. **Confirm the set and structure.** Offer all nine (recommended) or a subset; confirm the target space and that docs nest under a **Planning** parent page (create it under the space home if absent). One question round, not an interview.
3. **Draft all pages in the workspace** (one markdown file each). Content rules:
   - Every page opens with a one-line blockquote stating its job and cadence.
   - Decision rows: `# · Date · Decision · Why/context · Revisit-when`. Number them (D1…) so other docs can cite them.
   - Risk rows: `# · Risk · Likelihood · Impact · Mitigation · Status` — a High-impact risk needs a mitigation that exists in the plan, not a wish. Premortem items each get an explicit counter that points at a mitigation or decision.
   - Release checklist items as markdown checkboxes (`- [ ]`) — Confluence renders them as live tasks.
   - Cross-link: journal cites decision numbers; retro template feeds decision revisits; poster links everything.
4. **Self-review**: no lorem, no empty sections without a seed question, dates and links real, tone plain.
5. **Publish — into Kairoku when a Kairoku project holds this work.** One `create_document(project, type: "note", title, content)` per page, then tell the user to Publish them; the app's publish is what creates the Confluence pages and records the mapping. **List first, always:** call `list_documents(project)` once and match every intended title against it before creating anything. Nine documents is nine chances to duplicate, the app pulls the Confluence space in so several may already exist, and nothing over MCP can delete a duplicate — `update_document` on the existing id is the correct move. Full protocol in the `kairoku-mcp` skill.

   **No Kairoku project, or the server is unconfigured** — publish to Confluence directly: find the Atlassian tools (commonly `mcp__Atlassian_Rovo__*`), resolve cloudId and space, create the Planning parent (if a just-created page 404s as a parent, wait ~10s and retry once), create each child, then update the parent with an index table (doc · what it's for · cadence). Create-or-update by title search — re-running converges, never duplicates. Say which route you took.
6. **Report** all page links, grouped, and note which pages are living (journal, decision log) vs periodic (risks, roadmap) vs one-shot (release checklist).

**Dry run / no Atlassian tools:** leave drafts + a payload file in the workspace, state clearly nothing was created, and say what to connect.

## After creating

Offer the maintenance loop, briefly: decisions go in the log the moment they're made; the journal gets an entry per session; risks and roadmap get re-read at phase gates; the retro's "one change" actually gets made. Documents that aren't in a loop die — say which loop each page belongs to.
