export const meta = {
  name: 'run-sprint',
  description: 'Execute an approved sprint: order its epics by dependency, run independent epics concurrently through the epic workflow, then draft the sprint review.',
  whenToUse: 'When a sprint page is approved and its epics are ready to build. Pass the sprint name or id, e.g. /kairoku:run-sprint "Sprint 13". Add dryRun to see the epic order without touching anything.',
  phases: [
    { title: 'Scout sprint', detail: 'read the sprint, order its epics by cross-epic dependency' },
    { title: 'Epics', detail: 'run each epic through the epic workflow' },
    { title: 'Review', detail: 'draft the sprint review and journal entry' },
  ],
}

const input = typeof args === 'string' ? { sprint: args } : (args || {})
const sprintName = (input.sprint || input.name || '').toString().trim()
const dryRun = Boolean(input.dryRun ?? /--?dry-?run/i.test(String(args ?? '')))
// Two epics at a time by default: each one fans out to its own stories, and the
// runtime's agent cap is shared, so more epics simply queue behind each other.
const concurrency = Math.max(1, Number(input.concurrency) || 2)

if (!sprintName) {
  return { error: 'No sprint. Run /kairoku:run-sprint "Sprint 13", or pass {sprint: "Sprint 13"}.' }
}

const SPRINT_SCHEMA = {
  type: 'object',
  required: ['sprintName', 'epicWaves'],
  properties: {
    sprintName: { type: 'string' },
    sprintId: { type: 'string' },
    goal: { type: 'string' },
    state: { type: 'string', description: 'future | active | closed' },
    epicWaves: {
      type: 'array',
      description: 'ordered; each entry is a set of epic keys with no dependency on each other',
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['key', 'name'],
          properties: {
            key: { type: 'string' },
            name: { type: 'string' },
            storyCount: { type: 'number' },
          },
        },
      },
    },
    notApprovable: {
      type: 'array',
      description: 'reasons the sprint should not run — placeholder Test notes, unapproved page, missing flow test',
      items: { type: 'string' },
    },
  },
}

phase('Scout sprint')

const sprint = await agent(
  `Read the sprint "${sprintName}" and plan the order its epics should run in. Change nothing.

1. Find the sprint page and the sprint in Jira. Use \`kairoku-jira sprint list\` and
   \`kairoku-jira sprint issues "${sprintName}"\` for the Jira side; if that helper exits 2 it is
   unconfigured, so fall back to a JQL search on the sprint field or label and say so.
2. Confirm the sprint page is approved. If it is still a draft, that belongs in notApprovable —
   an unapproved sprint must not run.
3. Group its issues into epics. Order the epics into waves using cross-epic "Blocks" links:
   epics in the same wave have no dependency on each other and can run concurrently.
4. List anything that makes the sprint unrunnable: stories with placeholder Test notes, an epic
   with no flow-test story, a dependency on an epic outside this sprint that has not shipped.`,
  { label: `scout:${sprintName}`, phase: 'Scout sprint', schema: SPRINT_SCHEMA, effort: 'xhigh' },
)

if (!sprint) {
  return { error: `Could not read sprint "${sprintName}".` }
}

const epicWaves = (sprint.epicWaves || []).filter((wave) => wave && wave.length)
const epicCount = epicWaves.reduce((total, wave) => total + wave.length, 0)

log(`${sprint.sprintName}: ${epicCount} epic(s) in ${epicWaves.length} wave(s)`)
for (const reason of sprint.notApprovable || []) log(`  not approvable: ${reason}`)

if (dryRun || (sprint.notApprovable || []).length) {
  return {
    sprint: sprint.sprintName,
    dryRun: true,
    goal: sprint.goal,
    epicWaves: epicWaves.map((wave, i) => ({ wave: i + 1, epics: wave.map((e) => `${e.key} — ${e.name}`) })),
    notApprovable: sprint.notApprovable || [],
    note: (sprint.notApprovable || []).length
      ? 'Nothing ran. Resolve the blockers above, then re-run.'
      : 'Nothing was changed. Re-run without dryRun to execute.',
  }
}

// Start the sprint if it has not started. The script cannot shell out itself —
// an agent runs the helper and reports what it did.
if (sprint.state !== 'active') {
  await agent(
    `Start the sprint "${sprint.sprintName}" with \`kairoku-jira sprint start "${sprint.sprintName}"\`.
If the helper exits 2 it is unconfigured — say so plainly and note that the sprint must be
started by hand in Jira. Do not treat that as a failure; everything else still runs.`,
    { label: 'sprint:start', phase: 'Scout sprint', effort: 'low' },
  )
}

phase('Epics')

const outcomes = []

for (let index = 0; index < epicWaves.length; index++) {
  const wave = epicWaves[index]
  log(`Epic wave ${index + 1}/${epicWaves.length}: ${wave.map((e) => e.key).join(', ')}`)

  for (let start = 0; start < wave.length; start += concurrency) {
    const batch = wave.slice(start, start + concurrency)
    const batchResults = await parallel(
      batch.map((epic) => async () => {
        try {
          const result = await workflow('kairoku:run-epic', { epic: epic.key, sprint: sprint.sprintName })
          return { epic: epic.key, name: epic.name, result }
        } catch (error) {
          return {
            epic: epic.key,
            name: epic.name,
            error: `could not run: ${error && error.message ? error.message : error}`,
            hint: `Run /kairoku:run-epic ${epic.key} on its own.`,
          }
        }
      }),
    )
    outcomes.push(...batchResults.filter(Boolean))
  }

  const stopped = outcomes.filter((o) => o.result && o.result.stopped)
  if (stopped.length) {
    log(`  stopping the sprint: ${stopped.map((o) => o.epic).join(', ')} did not complete`)
    break
  }
}

phase('Review')

const review = await agent(
  `Draft the sprint review for "${sprint.sprintName}".

What happened:
${outcomes
  .map((o) =>
    o.error
      ? `- ${o.epic} (${o.name}): FAILED TO RUN — ${o.error}`
      : `- ${o.epic} (${o.name}): built ${(o.result.built || []).length}, blocked ${(o.result.blocked || []).length}${o.result.stopped ? `, STOPPED at wave ${o.result.stopped.wave} (${o.result.stopped.reason})` : ''}`,
  )
  .join('\n')}

Write the Sprint review section on the sprint page: demo notes, carry-over **with a destination
for each item** (next sprint, backlog, dropped — never just "carry-over"), and a link to the QA
run. Append a Build Journal entry. Say which release gate moved, and which did not and why.

Do not close the sprint — that is the human's call once they have verified the previews.`,
  { label: 'sprint:review', phase: 'Review', effort: 'high' },
)

return {
  sprint: sprint.sprintName,
  goal: sprint.goal,
  epics: outcomes.map((o) => ({
    key: o.epic,
    name: o.name,
    error: o.error,
    built: o.result ? (o.result.built || []).map((s) => s.key || s) : [],
    blocked: o.result ? o.result.blocked || [] : [],
    stopped: o.result ? o.result.stopped : undefined,
  })),
  review,
  next: 'Verify the previews against each epic\'s manual checklist, then close the sprint.',
}
