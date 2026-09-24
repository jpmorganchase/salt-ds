# About the numbers salt-eval produces

This page explains what a salt-eval result means and what it does not. It is the
condensed, current form of the starter's methodology notes. Read it before quoting an
uplift to anyone.

## What is measured

A paired experiment. The same planner agent runs the same tasks under two or more
toolchain profiles. Everything else is frozen: planner prompt per track, generation
settings, message and time limits, judge prompt, judge model, suite content. The run
manifest records every one of these with a hash, and `report` refuses to summarise logs
whose hashes differ.

A trial passes when every mandatory criterion is `correct`. `missing` and `wrong` both
fail but stay distinct in the report because they call for different fixes. `review`
means the graders could not decide. Advisory criteria are logged and never counted.

The primary comparison is the mean over tasks of (treatment pass fraction minus baseline
pass fraction), in percentage points. Repeated trials estimate each task's pass fraction.
They are not extra tasks. Criteria are not statistical units either; a plan with five
criteria is still one observation.

## Why the uplift is sometimes withheld

The report publishes no uplift while any of these hold:

- a criterion is `review` (judge abstained, judge output failed validation, a grader
  errored, or two reviewers disagree),
- a trial ended in an execution error,
- a trial the manifest scheduled is missing from the logs,
- the arms are not paired trial for trial on a task.

Nothing is silently dropped. Fix the infrastructure or finish the run, then report again.
Do not resample a hard task until it passes.

## Tracks

The `instruct` track asks for implementation instructions and grades the Salt-specific
decisions with an LLM judge. The judge sees the request, the criteria, trusted reference
facts, and the response. It never sees the arm, the tool trace, or the tooling under test.
`normalize_judgment` rejects structurally invalid judgments: a criterion missing or
repeated, a quote that is not in the response, a source id outside the criterion, a
correct or wrong verdict without evidence. That is structural validation only. A judge can
still be wrong, which is why `calibrate` and human review exist.

The `code` track asks for one TSX module and grades it deterministically. The repository
is the ground truth: `ts:typecheck` resolves `@salt-ds/*` to `packages/*/src`, the export
census reads the same entry points, and the JSX rules read the syntax tree. A grader
error (a harness fault such as a crashed process or a computed prop value the syntax
cannot decide) is `review`, never an agent failure. A response with no artifact fails
with reason `no-artifact` and is counted separately.

Keep the tracks separately reported. An improving instruct track can hide a regressing
code track.

## Statistics

Per arm and task, avg@k is the pass fraction over k trials and pass^k is the estimated
probability that all k trials pass (the pass fraction to the power k). avg@k measures
typical quality. pass^k measures reliability, which is what a user who runs the tool once
experiences.

For a paired comparison the report gives the task-weighted mean delta and, treating each
`cluster_id` as one independent unit, a clustered standard error with a normal 95%
interval. It also gives the minimum detectable effect at 80% power and the number of
clusters needed to detect 5 and 10 percentage points. A suite whose minimum detectable
effect is 40 points cannot test a 10 point change; grow the suite instead of reading tea
leaves. With ten or more clusters the report adds a paired cluster bootstrap interval.

`cluster_id` must group paraphrases of one underlying request. It is not a component
category. Two cases about different FormField questions are two clusters.

All intervals describe sampling uncertainty. They say nothing about rubric or judge error.

## Judge governance

`calibrate` runs the real judge on maintainer-labelled responses and computes the false
accept rate (judge says correct, maintainer says not) over maintainer-incorrect labels,
the false reject rate over maintainer-correct labels, and the review rate. `suite.json`
declares the thresholds; the command exits non-zero above them. Five labelled examples
per case is a smoke check. A defensible judge needs a separate labelled validation sample
that includes apparent successes, because reviewing only failures cannot find false
accepts.

`review` applies human verdicts to a blinded queue and reports Cohen's kappa for every
pair of reviewers who labelled the same items. Low kappa means the rubric is ambiguous,
not that one reviewer is wrong.

## Turning failures into the next change

Each failed criterion in the review queue takes one attribution label. Each label maps
to one kind of next change:

| Attribution                | Next change to test                                                     |
| -------------------------- | ----------------------------------------------------------------------- |
| `knowledge-missing`        | Add or correct documentation or annotations.                            |
| `tool-not-discovered`      | Improve tool descriptions, schemas or routing guidance.                 |
| `tool-response-incomplete` | Change retrieval, chunk boundaries or response contents.                |
| `agent-ignored-evidence`   | Test clearer presentation, conflict resolution or planner instructions. |
| `rubric-error`             | Fix the rubric or grader and rescore both arms.                         |

These are hypotheses for the next controlled experiment, not proven root causes. Run the
next paired experiment to find out.

## Contamination

Every case carries the suite canary string. If a model reproduces it unprompted, the
suite has leaked into training data. Cases also declare `contamination`:
`public-stable` answers are likely memorised, `post-cutoff` and `counterfactual` cases
discriminate tooling from memory. Prefer the latter two when the question is whether the
tooling adds anything beyond what the model already knows.

`held_out` cases are excluded from runs unless `--include-held-out`. Once you inspect a
held-out failure to tune a toolchain, that case is a development case; change its status
and replace it. A paraphrase of a development case can never be held out; `validate`
rejects mixed clusters.

## What this instrument cannot tell you

It measures your toolchain with a fixed Inspect-hosted agent. It does not reproduce a
particular coding assistant's hidden context selection, agent policies or model settings.
To claim uplift for those users, run the same tasks through that assistant and grade its
output with the same frozen graders.

## Reading

- Anthropic, "Demystifying evals for AI agents": repeated trials, task-specific grading,
  calibration against experts.
- Anthropic, "Writing effective tools for agents": programmatic evaluation of tools and
  transcript analysis.
- Inspect AI documentation: MCP tools, custom scorers, rescoring saved logs.
