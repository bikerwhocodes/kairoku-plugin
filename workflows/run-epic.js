export const meta = {
  name: 'run-epic',
  description: 'Execute a Jira epic as dependency waves: one worktree-isolated agent per story, tests first, merge barrier and full suite between waves, adversarial review, flow test, then one pull request.',
  whenToUse: 'When an approved epic is ready to build. Pass the epic key, e.g. /kairoku:run-epic KAIR-179. Add dryRun to print the wave plan without touching anything.',
  phases: [
    { title: 'Scout', detail: 'read the epic, build the dependency graph, partition into waves' },
    { title: 'Build', detail: 'one agent per story, in its own worktree, tests first' },
    { title: 'Merge', detail: 'merge the wave into the integration branch and run the full suite' },
    { title: 'Verify', detail: 'adversarial review of what the wave changed', model: 'opus' },
    { title: 'Flow test', detail: "walk the phase's Done when end to end" },
    { title: 'Close', detail: 'open the epic PR, report progress, draft the journal entry' },
  ],
}

// ---------------------------------------------------------------------------
// Input. Accepts "KAIR-179", {epic}, or {epic, dryRun, sprint, maxWaves}.
// ---------------------------------------------------------------------------

const input = typeof args === 'string' ? { epic: args } : (args || {})
const epicKey = (input.epic || input.key || '').toString().trim().replace(/\s+--?dry-?run$/i, '')
const dryRun = Boolean(input.dryRun ?? /--?dry-?run/i.test(String(args ?? '')))

if (!epicKey) {
  return { error: 'No epic key. Run /kairoku:run-epic KAIR-179, or pass {epic: "KAIR-179"}.' }
}

// ---------------------------------------------------------------------------
// Schemas. Structured returns beat parsing prose, and they make a stage's
// contract explicit to the agent filling it.
// ---------------------------------------------------------------------------

const PLAN_SCHEMA = {
  type: 'object',
  required: ['epicName', 'integrationBranch', 'waves', 'blocked'],
  properties: {
    epicName: { type: 'string' },
    integrationBranch: { type: 'string' },
    baseBranch: { type: 'string' },
    sprint: { type: 'string' },
    flowTestKey: { type: 'string', description: 'key of the "Flow test — <phase>" story, if present' },
    waves: {
      type: 'array',
      description: 'ordered; each entry is the set of story keys whose dependencies are satisfied by earlier waves',
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['key', 'summary'],
          properties: {
            key: { type: 'string' },
            summary: { type: 'string' },
            hard: { type: 'boolean', description: 'architectural, or touches a boundary several stories share' },
            touches: { type: 'array', items: { type: 'string' }, description: 'files or modules it is likely to change' },
          },
        },
      },
    },
    blocked: {
      type: 'array',
      description: 'stories that cannot run — placeholder Test notes, unresolved spec contradictions, missing dependencies',
      items: {
        type: 'object',
        required: ['key', 'reason'],
        properties: { key: { type: 'string' }, reason: { type: 'string' } },
      },
    },
    crossEpicBlocks: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
}

const STORY_SCHEMA = {
  type: 'object',
  required: ['key', 'status'],
  properties: {
    key: { type: 'string' },
    status: { type: 'string', enum: ['done', 'blocked'] },
    branch: { type: 'string' },
    tests: { type: 'string', description: 'command run and its result' },
    commits: { type: 'array', items: { type: 'string' } },
    blockedBy: { type: 'string' },
    specAmbiguity: { type: 'string' },
    notes: { type: 'string', description: 'anything the next wave must know' },
  },
}

const MERGE_SCHEMA = {
  type: 'object',
  required: ['merged', 'suiteGreen'],
  properties: {
    merged: { type: 'array', items: { type: 'string' } },
    suiteGreen: { type: 'boolean' },
    suiteOutput: { type: 'string', description: 'the failing tail, when it is not green' },
    conflicts: { type: 'array', items: { type: 'string' }, description: 'conflicts resolved, and how' },
  },
}

const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['file', 'summary', 'severity'],
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          summary: { type: 'string' },
          failureScenario: { type: 'string', description: 'concrete inputs or state → wrong behaviour' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['real'],
  properties: {
    real: { type: 'boolean' },
    reasoning: { type: 'string' },
  },
}

// ---------------------------------------------------------------------------
// The protocol every stage inherits. Repeating it per prompt is what stops a
// stage from quietly inventing its own conventions.
// ---------------------------------------------------------------------------

const PROTOCOL = `
Load the skills kairoku:jira-ops and kairoku:git-pr before doing anything, and follow them
exactly. In particular: resolve Jira transitions rather than hardcoding them, never close or
tick a "Manual test" subtask, and never merge into the repository's default branch.
`.trim()

// ---------------------------------------------------------------------------
// Scout
// ---------------------------------------------------------------------------

phase('Scout')

const plan = await agent(
  `${PROTOCOL}

Scout epic ${epicKey} so it can be executed as dependency waves. Do not change any code and do
not transition anything — this stage only reads.

1. Read the epic and every child story in full, including their "Automated tests" / "Manual test"
   subtasks and the "Flow test — <phase>" story if one exists.
2. Build the dependency graph from "Blocks" links and each story's Dependencies section. Also
   look for implicit dependencies the links miss: two stories that will edit the same module,
   a story that creates the type another consumes.
3. Partition into waves. A wave is the set of stories whose dependencies are all satisfied by
   earlier waves. Prefer more, smaller waves over fewer large ones when stories are likely to
   touch the same files — a wrong wave costs a whole merge.
4. Mark a story "hard" when it is architectural or defines a boundary several stories build on.
5. Move any story with placeholder Test notes, an unresolved spec contradiction, or a missing
   dependency into "blocked" with the reason. Do not schedule those.
6. Name the integration branch (mvp/${epicKey} unless the epic already has one) and the base
   branch it should come from. Report any cross-epic Blocks links, which tell the caller whether
   this epic can run alongside another.`,
  { label: `scout:${epicKey}`, phase: 'Scout', schema: PLAN_SCHEMA, effort: 'xhigh' },
)

if (!plan) {
  return { error: `Could not scout ${epicKey}. Check the key and that Jira is reachable.` }
}

const waves = (plan.waves || []).filter((wave) => wave && wave.length)
const scheduled = waves.reduce((total, wave) => total + wave.length, 0)

log(`${epicKey} — ${plan.epicName}: ${scheduled} stories across ${waves.length} wave(s), ${plan.blocked.length} blocked`)
for (const entry of plan.blocked) log(`  blocked ${entry.key}: ${entry.reason}`)

if (dryRun) {
  return {
    dryRun: true,
    epic: epicKey,
    name: plan.epicName,
    integrationBranch: plan.integrationBranch,
    waves: waves.map((wave, index) => ({ wave: index + 1, stories: wave.map((s) => `${s.key} — ${s.summary}`) })),
    blocked: plan.blocked,
    crossEpicBlocks: plan.crossEpicBlocks || [],
    note: 'Nothing was changed. Re-run without dryRun to execute.',
  }
}

if (!scheduled) {
  return { epic: epicKey, error: 'Nothing runnable.', blocked: plan.blocked }
}

// ---------------------------------------------------------------------------
// Waves. Sequential by construction: the barrier between them is the point.
// ---------------------------------------------------------------------------

const sprintLabel = input.sprint || plan.sprint || 'Sprint'
const results = []
const findingsByWave = []
let stoppedAt = null

for (let index = 0; index < waves.length; index++) {
  const waveNumber = index + 1
  const wave = waves[index]
  const carried = results
    .flat()
    .filter((story) => story && story.notes)
    .map((story) => `- ${story.key}: ${story.notes}`)
    .join('\n')

  phase('Build')
  log(`Wave ${waveNumber}/${waves.length}: ${wave.map((s) => s.key).join(', ')}`)

  const built = (
    await parallel(
      wave.map((story) => () =>
        agent(
          `${PROTOCOL}

Build exactly one story: ${story.key} — ${story.summary}

Branch from ${plan.integrationBranch} as story/${story.key.toLowerCase()}-<slug>.
${carried ? `\nWhat earlier waves reported that may affect you:\n${carried}\n` : ''}
Read the whole issue before writing anything. Write the tests first from its Test notes and
watch them fail, then implement to green. The lint and build gate must be clean before you
commit. Close the "Automated tests" subtask with evidence. Do not merge, do not open a PR, and
do not touch the "Manual test" subtask.

If the Test notes are placeholders or the spec contradicts the story, stop and report blocked
with what is needed — do not improvise.`,
          {
            label: `build:${story.key}`,
            phase: 'Build',
            agentType: 'kairoku:daiku',
            isolation: 'worktree',
            schema: STORY_SCHEMA,
            // A hard story gets the stronger model; the rest are Sonnet's work.
            model: story.hard ? 'opus' : undefined,
          },
        ),
      ),
    )
  ).filter(Boolean)

  results.push(built)

  const done = built.filter((story) => story.status === 'done')
  const blocked = built.filter((story) => story.status !== 'done')
  for (const story of blocked) log(`  blocked ${story.key}: ${story.blockedBy || 'no reason given'}`)

  if (!done.length) {
    stoppedAt = { wave: waveNumber, reason: 'every story in the wave blocked' }
    break
  }

  // --- barrier ----------------------------------------------------------

  phase('Merge')

  const merge = await agent(
    `${PROTOCOL}

Merge wave ${waveNumber} of ${epicKey} into ${plan.integrationBranch}.

Branches to merge: ${done.map((s) => s.branch || `story/${s.key.toLowerCase()}`).join(', ')}

Use the merge message convention exactly:
  Merge <branch> into ${plan.integrationBranch} (${sprintLabel} Wave ${waveNumber})

Resolve any conflict on its merits and record what you did and why — a conflict between two
stories in the same wave means the scout missed a dependency, and the next epic's graph needs
to know. Then run the full test suite on the merged state, not just the tests these stories
added, and report whether it is green with the failing tail if it is not.`,
    { label: `merge:wave-${waveNumber}`, phase: 'Merge', schema: MERGE_SCHEMA, effort: 'high' },
  )

  if (!merge || !merge.suiteGreen) {
    stoppedAt = {
      wave: waveNumber,
      reason: 'the full suite is red on the merged state',
      output: merge ? merge.suiteOutput : 'the merge stage did not report',
    }
    break
  }

  // --- review -----------------------------------------------------------
  // Find on the strong model, then try to refute each finding independently.
  // A single pass reports plausible-but-wrong findings with total confidence.

  phase('Verify')

  const review = await agent(
    `Review everything wave ${waveNumber} of ${epicKey} changed on ${plan.integrationBranch}
(diff it against the wave's merge base). Look for correctness defects only: logic that is
wrong, state that can be corrupted, cases the tests do not cover but the acceptance criteria
require. Not style, not naming, not hypothetical hardening.

For each finding give the concrete inputs or state that produce the wrong behaviour. If you
find nothing real, return an empty list — a manufactured finding costs more than a missed one
here, because the next stage will spend agents on it.`,
    { label: `review:wave-${waveNumber}`, phase: 'Verify', schema: FINDINGS_SCHEMA, model: 'opus', effort: 'high' },
  )

  const candidates = review ? review.findings : []
  const confirmed = (
    await parallel(
      candidates.map((finding) => () =>
        agent(
          `Try to REFUTE this claimed defect in ${plan.integrationBranch}:

${finding.file}${finding.line ? `:${finding.line}` : ''} — ${finding.summary}
Claimed failure: ${finding.failureScenario || '(none given)'}

Read the actual code and the tests around it. Decide whether the failure genuinely occurs.
Default to refuted when you are uncertain or cannot reproduce the reasoning from the code.`,
          { label: `verify:${finding.file}`, phase: 'Verify', schema: VERDICT_SCHEMA, model: 'opus', effort: 'high' },
        ).then((verdict) => (verdict && verdict.real ? { ...finding, reasoning: verdict.reasoning } : null)),
      ),
    )
  ).filter(Boolean)

  if (confirmed.length) {
    log(`  wave ${waveNumber}: ${confirmed.length} confirmed finding(s) of ${candidates.length} claimed`)
  }

  results[results.length - 1] = built.map((story) => ({ ...story, wave: waveNumber }))
  findingsByWave.push({ wave: waveNumber, claimed: candidates.length, confirmed })
}

const stories = results.flat().filter(Boolean)
const built = stories.filter((story) => story.status === 'done')
const blocked = [
  ...plan.blocked,
  ...stories.filter((story) => story.status !== 'done').map((s) => ({ key: s.key, reason: s.blockedBy || 'blocked' })),
]

if (stoppedAt) {
  return {
    epic: epicKey,
    name: plan.epicName,
    stopped: stoppedAt,
    built: built.map((s) => s.key),
    blocked,
    next: 'Fix the barrier, then re-run — completed stories are already on the integration branch.',
  }
}

// ---------------------------------------------------------------------------
// Flow test
// ---------------------------------------------------------------------------

phase('Flow test')

const flow = plan.flowTestKey
  ? await agent(
      `${PROTOCOL}

Execute the flow test ${plan.flowTestKey} for epic ${epicKey} on ${plan.integrationBranch}.

Walk the phase's "Done when" end to end in the running application — not in the test suite, and
not by reading the code. Start the app if you need to. Record the result on the story and on the
QA Run page. If it does not pass, say exactly where it broke.`,
      { label: `flow:${plan.flowTestKey}`, phase: 'Flow test', agentType: 'kairoku:metsuke', effort: 'high' },
    )
  : 'No flow-test story on this epic.'

// ---------------------------------------------------------------------------
// Close
// ---------------------------------------------------------------------------

phase('Close')

const closing = await agent(
  `${PROTOCOL}

Close out epic ${epicKey} — ${plan.epicName}.

1. Open ONE pull request: ${plan.integrationBranch} → ${plan.baseBranch || 'the default branch'}.
   Build the body from the epic and its stories using the template in kairoku:git-pr. The manual
   test checkboxes go in UNTICKED — they are the human's gate.
2. Comment the PR URL on the epic and on each story, and transition the stories to In Review.
3. If the Kairoku MCP server is connected, post ONE add_progress_note summarising the epic:
   which stories landed, how many waves, whether the flow test passed.
4. Draft a Build Journal entry — shipped / decided / blocked / next — and return it as text.
   Do not publish it; the caller decides.

Stories built: ${built.map((s) => s.key).join(', ')}
Blocked: ${blocked.length ? blocked.map((b) => `${b.key} (${b.reason})`).join(', ') : 'none'}
Flow test: ${typeof flow === 'string' ? flow : 'see the flow-test stage'}

Do not merge the pull request.`,
  { label: `close:${epicKey}`, phase: 'Close', effort: 'high' },
)

return {
  epic: epicKey,
  name: plan.epicName,
  integrationBranch: plan.integrationBranch,
  waves: waves.length,
  built: built.map((story) => ({ key: story.key, tests: story.tests, commits: story.commits })),
  blocked,
  findings: findingsByWave.filter((wave) => wave.confirmed.length),
  specAmbiguities: stories.map((s) => s.specAmbiguity).filter(Boolean),
  flowTest: flow,
  closing,
}
