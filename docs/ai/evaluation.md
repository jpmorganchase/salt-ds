# Salt AI evaluation and metadata validation

Plan 033 is the active workflow and content pilot plan. Its current checks validate product
behavior and the consistency of evaluation definitions separately. A metadata
validation pass does not establish retrieval quality, model performance,
consumer outcomes, or Doctor qualification.

## Current definitions and checks

The current manifest contains 13 outcome-case definitions, 3 separate activation
definitions, and 40 retrieval gold queries. Each outcome case declares the exact
Salt package vector materialized by its fixture's `package.json`. Ordinary cases
must agree with that manifest; metadata disagreement is an error. The intentional
mixed-version case still has matching case and fixture metadata, and explicitly
expects partial compatibility. It is not an exception to metadata equality.

```shell
yarn eval:salt-ai:validate
yarn validate:salt-ai:contracts
yarn test:ai-tooling
```

`eval:salt-ai:validate` checks metadata: schemas, contained paths, fixture and
protocol identities, case/vector agreement, counts, and preserved baseline
identities. `validate:salt-ai:contracts` combines that validation with current
package, content, and source contracts. Neither command runs model attempts or
scores the declared gold queries. The legacy deterministic-validation helper
likewise counts declared checks; it does not execute those checks.

`test:ai-tooling` executes Knowledge and CLI regressions, including retrieval,
compatibility, bounded output, and the exposed Doctor implementation. Packed
consumer journeys provide separate installed-package correctness proof. Doctor
performance qualification remains separate and has not passed. Current CI runs
the repository/product tests, current contracts, the active-plan consistency
check, and the release embargo without automatically replaying historical
evidence acquisition.

## Task evidence pilot

The ten development questions in
`packages/knowledge/src/__fixtures__/taskEvidenceQuestions.json` cover the
existing editable-record workflow. Their expected clauses come from canonical
Forms, Dialog, Button and Button bar guidance and the example recipe. The
`taskKnowledgePilot.spec.ts` suite checks delivered section text and provenance,
not only record hits. At the default 16 KiB budget, required evidence must be
present; at 8 KiB, missing evidence must be disclosed through a relevant,
resolvable omission. Conditions, exclusions, readiness and example limitations
must remain with any retained recommendation.

The suite also checks byte limits, deterministic digests, incompatible versions,
and mutations that remove a decisive clause or workflow limitation. These are
development regressions, separate from the frozen 40-query corpus. They do not
establish maintainer approval, a held-out retrieval score or agent performance.

## Preserved baseline reports

The checked-in `evals/salt-ai/baselines/baseline-pre-platform.json` is the
13-case report preserved by Plan 004/01 at
`da1d249225c7044dad1c3aa08c960eb08f84dddb`. Its source snapshot and affected paths
are recorded in `plans/evidence/004/index.json`. Validation checks its unchanged
report bytes and recomputes the recorded identities from that snapshot's
manifest, fixtures, and protocol files. Correcting current fixtures does not
rewrite this report or exempt it from identity checks. CI checks out the history
needed to read those frozen inputs.

The original 14-case Plan 001/00b report is a separate content-addressed artifact
referenced by `plans/evidence/001/00b.json`. Its denominator and identities remain
historical. These two reports must not be substituted for one another. Both
characterize the retired Catalog-v2 prototype, without a model-quality claim;
unavailable modes have no scores.

## Historical protocol and audit commands

The four frozen mode IDs, two host aliases, three repetitions, retry policy,
adjudication, budgets, and metric/waiver definitions remain historical protocol
data. Their old mode-3/mode-4 uplift targets, retrieval and scan thresholds, and
outcome denominators do not dispatch a current product study. MCP was omitted;
the generic `eval:salt-ai:run` and `eval:salt-ai:gate` aliases are retired. There
is no replacement model-outcome runner in this unit. Future consumer or model
trials require their separately activated scope.

Use these explicit commands when auditing historical contracts or changing
their readers:

```shell
yarn validate:salt-ai:contracts:historical
yarn test:salt-ai-governance
yarn eval:salt-ai:report -- --cohort baseline-pre-platform
```

The report command renders the preserved report. It does not rerun the original
experiment or regenerate baseline evidence. Historical contract checks retain
their rejection cases and frozen inputs independently of current metadata.

Do not commit raw prompts, model output, traces, credentials, proprietary
repositories, or absolute paths. The retained protocol's private cache and
retention rules do not authorize collecting new trial data.
