# How to write a case

A case is one user request plus the hidden rubric that decides whether a response got the
Salt-specific decisions right. The planner sees only `request` (and `context.repo_state`).
The judge sees the criteria and the references. The graders see the artifact.

## Scaffold it

```bash
uv run salt-eval new-case --suite <suite-id> --id <case-id> --track instruct|code
```

The command writes `cases/<case-id>.json` with `TODO` markers and either
`calibration/<case-id>.json` (instruct) or `solutions/<case-id>/src/Solution.tsx` (code).
It refuses to overwrite existing files. Fill in every `TODO`, then run
`uv run salt-eval validate --solve` until it prints `ok`.

## Write the request

Write the request as a user would, with the minimal repository context. Say what already
exists (Salt installed, provider configured, the current composition) so the response
must make the Salt decision rather than restate setup. Two to five caller-owned Salt
decisions per case is the useful range. Leave out generic React mistakes; the graders are
for Salt knowledge.

Add `paraphrases` when you want to know whether wording changes the outcome. Each
paraphrase becomes its own sample under the same `cluster_id`, so statistics count them as
one independent unit.

## Verify every fact before it becomes a reference

`references[].fact` is what the judge trusts. Verify each fact against the source in this
repository (`packages/core/src/...`) or a documentation page, and say how in `kind`. Do not
write a fact from memory. Pin `salt.packages` to the version you checked and record
`reviewed_date`.

## Choose criteria

Every criterion has a `severity`. `mandatory` criteria decide pass or fail. `advisory`
criteria are logged only, which is the right choice for style preferences and for a new
rule whose false positive rate you do not know yet.

A `judge` criterion needs `requirement`, `accept` (equivalent wordings that pass),
`wrong` (explicit conflicting recommendations), `missing` (vague responses that do not
resolve the decision) and at least one `source_ids` entry. Write `accept` generously. The
judge must not reward component names that merely appear, and must not impose
requirements beyond the rubric, so put the whole decision into `requirement`.

A deterministic criterion names a check kind in `grader` and its `params`. The kinds and
their parameters are in `graders.md`. Instruct cases may use only `judge` and
`text:forbidden-pattern`; the other kinds need code files.

## Instruct cases need a calibration file

`calibration/<case-id>.json` holds labelled responses: one that satisfies every criterion,
one with different valid wording, one wrong, one vague, one contradictory is a good start.
`expected` maps every judge criterion id to the verdict a maintainer would give. `validate`
checks the coverage. `salt-eval calibrate` runs the real judge on these and compares.

## Code cases need a reference solution

`solutions/<case-id>/` holds files that a competent Salt engineer would write for the
request. `validate --solve` grades them with the case's deterministic criteria and fails
when any mandatory criterion is not `correct`. A case whose own solution fails is not
solvable and must not run. The solution is also the best documentation of what the
criteria intend.

## Lifecycle

| `status`   | Runs by default                | Requirements                                                     |
| ---------- | ------------------------------ | ---------------------------------------------------------------- |
| `draft`    | yes, labelled unapproved       | none                                                             |
| `approved` | yes                            | `provenance.approved_by` set; code cases have a passing solution |
| `held_out` | only with `--include-held-out` | its `cluster_id` contains no development cases                   |
| `retired`  | never                          | none                                                             |

Bump `suite.json` `revision` whenever a case or calibration file changes. Old logs record
the revision and suite hash they were scored against, and `report` refuses to mix logs
from different suite hashes.

## Fields

| Field                    | Meaning                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `id`                     | Kebab-case, equal to the file name.                                                                  |
| `track`                  | `instruct` or `code`.                                                                                |
| `family`                 | Reporting topic such as `form-field-state`. Not a statistical unit.                                  |
| `cluster_id`             | Groups paraphrases of one request. The unit for clustered statistics.                                |
| `status`                 | See the lifecycle table.                                                                             |
| `provenance`             | `kind` (`field`, `authored`, `adversarial`), `source`, optional `approved_by` and `approved_date`.   |
| `contamination`          | `public-stable`, `post-cutoff` or `counterfactual`.                                                  |
| `salt`                   | `packages` version pins and optional `docs_revision`.                                                |
| `request`, `paraphrases` | What the planner is asked.                                                                           |
| `context.repo_state`     | Prose appended to the request about the consuming application.                                       |
| `context.fixture`        | Folder under `fixtures/` whose tsconfig typechecks the artifact. Defaults to `workspace-vite-react`. |
| `references`             | Trusted facts with `id`, `kind`, `fact`, optional `url` and `reviewed_date`.                         |
| `criteria`               | Judge and deterministic criteria, each with `severity`.                                              |
| `calibration`            | Path of the calibration file, relative to the suite.                                                 |
| `canary`                 | Must equal the suite canary.                                                                         |

The schema in `schemas/case.schema.json` is the authoritative list; `validate` reports the
JSON pointer of anything that does not conform.
