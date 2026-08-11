---
description: Bootstrap the Kairoku framework for a new project — Confluence sections, Jira checklist, repo scaffolding, planning docs
---

Bootstrap this project onto the Kairoku road. Ask for (or infer from the repo/conversation): project name, Confluence space key, Jira project key.

1. **Verify Atlassian**: confirm the Confluence space and Jira project exist and the Jira project has Epic/Story/Subtask (note the Story→Task fallback if not). If either is missing, give the exact click-path to create them (spaces/projects aren't API-creatable) and stop.
2. **Confluence structure** (writing-project-docs skill): replace the space-home template with a real project home; create Planning/ with the nine planning docs **pre-filled from this project's real facts**; create Releases/, Sprints/ (with the sprint + epic-execution-prompt templates), and QA/ parents.
3. **Repo scaffolding**: write CLAUDE.md with the how-to-work rules (spec source of truth, agent-authored implementation plan with review gate, TDD-in-plan, delivery loop with Toryo/Hancho/Metsuke/Yuhitsu, epic execution via ultracode waves). Never scaffold docs into the repo — they live in Confluence.
4. **Report**: every page link, what's still manual, and the first next step (usually: writing-specs).
