---
name: budget
description: Estimate what an epic or sprint will cost to run at the configured model and effort mix, before launching it. Use when the user asks what a run will cost, whether to use Opus or Sonnet for something, or wants to size a sprint against a budget.
argument-hint: "<EPIC-KEY or sprint name>"
---

# Budget

Estimate before you spend. This is a rough order of magnitude, not an invoice — say so.

## 1. Size the work

Read the epic or sprint: story count, wave count, and how many stories are marked hard. If a
wave plan already exists (from `/kairoku:run-epic <KEY>` with `dryRun`), use it rather than
guessing at the shape.

## 2. Count the agents

A run of N stories in W waves spends roughly:

| Stage | Agents | Model |
|---|---|---|
| Scout | 1 | session model |
| Build | N | `sonnet`, or `opus` for stories marked hard |
| Merge barrier | W | session model |
| Review | W | `opus` |
| Verify findings | 1 per claimed finding | `opus` |
| Flow test | 1 | `sonnet` |
| Close | 1 | session model |

Story agents dominate — they read the issue, the surrounding code, write tests, implement, and
iterate. Everything else is comparatively cheap.

## 3. Apply the rates

Current list prices per million tokens (these drift — check
[pricing](https://platform.claude.com/docs/en/pricing) before quoting anything that matters):

| Model | Input | Output |
|---|---|---|
| Opus 5 | $5 | $25 |
| Sonnet 5 | $3 | $15 (introductory $2 / $10 through 2026-08-31) |
| Haiku 4.5 | $1 | $5 |

Two things move the number more than the model choice:

- **Effort.** `xhigh` buys markedly more thinking than `medium`, and on agentic work it usually
  pays for itself by cutting the number of turns. Do not quote a saving from dropping effort
  without saying what it costs in re-runs.
- **Prompt caching.** Agents in the same run that share a model, agent type, tool set and
  working directory read each other's cached prefix, so a wave of ten story agents does not pay
  ten times for the same system prompt. Fan-out is cheaper per agent than it looks.

## 4. Report

```
<EPIC-KEY> — <name>
<N> stories · <W> waves · <H> hard

Agents:      ~<count>  (<N> build, <W> merge, <W> review, + verify)
Estimate:    $<low>–$<high>
Dominated by: <what — usually the build stage>

Cheaper:     <one concrete lever, with what it costs>
```

Give a range, not a number. Name the assumption the range rests on — typically average tokens
per story agent, which varies enormously between a config change and a new subsystem.

## Honest limits

You cannot know how many turns a story will take before it runs. If the user needs a real
figure, the answer is to run one epic with `dryRun` off and read the actual spend in
`/workflows` — that number beats any estimate, and one real epic calibrates every later guess.

Say that rather than dressing up a guess as a forecast.
