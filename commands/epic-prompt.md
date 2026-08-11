---
description: Fill the epic-execution prompt for a given epic key, ready to paste into an ultracode session
---

Fill the epic-execution prompt template for epic $ARGUMENTS: fetch the epic and its stories from Jira, confirm the release and sprint page URLs, check for cross-epic Blocks links (state whether this epic can run in parallel with others), and output the complete ready-to-paste prompt in one code block — placeholders resolved, nothing left to edit. The template lives in the plugin (agents/epic-execution-prompt reference) and on the Sprints page in Confluence; keep its wave/worktree/TDD structure intact.
