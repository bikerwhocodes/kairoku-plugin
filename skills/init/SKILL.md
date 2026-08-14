---
name: init
description: Bootstrap a project onto the Kairoku road — verify Atlassian and the app, create the Confluence structure pre-filled with real project facts, and scaffold the repo's CLAUDE.md. Use when setting up Kairoku for a new project or repository for the first time.
argument-hint: "[project name]"
disable-model-invocation: true
allowed-tools: Bash(kairoku-jira *)
---

# Init

Bootstrap this project onto the Kairoku road. Ask for anything you cannot infer from the repo
or the conversation: project name, Confluence space key, Jira project key, Kairoku project slug.

Prefer the configured values — `${user_config.jira_project_key}`,
`${user_config.confluence_space_key}`, `${user_config.kairoku_project_slug}` — and only ask
when they are blank or the user is setting up a different project.

## 1. Verify the ground

- **Jira**: confirm the project exists and has Epic / Story / Subtask issue types. Note the
  Story → Task fallback if Story is absent (team-managed projects vary).
- **Confluence**: confirm the space exists.
- **Sprint helper**: run `kairoku-jira config check`. Exit 2 means sprint start/close will be
  manual — that is a supported mode; tell the user rather than treating it as a blocker.
- **Kairoku app**: if the MCP server is connected, `list_projects` and confirm the slug
  resolves. If it is not connected, say which features degrade (progress notes, plan reads)
  and continue.

Spaces and Jira projects are not API-creatable. If either is missing, give the exact
click-path and stop — do not improvise a substitute.

## 2. Confluence structure

Use the **writing-project-docs** skill. Replace the space-home template with a real project
home, then create:

- **Planning/** with the nine planning docs, **pre-filled from this project's real facts** —
  decisions already made, real env vars, real risks. An empty template is furniture.
- **Releases/**, **Sprints/**, and **QA/** parent pages with their embedded templates.

## 3. Repo scaffolding

Write `CLAUDE.md` with the rules that make the loop work: spec is source of truth, the plan is
authored then reviewed before code, TDD stated per task, the station agents and what each owns,
and how epics execute (`/kairoku:run-epic`). Never scaffold documents into the repo — they live
in Kairoku and Confluence.

## 4. Report

Every page link, what is still manual, and the first next step — usually `/kairoku:capture` if
there is no idea written down yet, or `/kairoku:spec` if there is.
