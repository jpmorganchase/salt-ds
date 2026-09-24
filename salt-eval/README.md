# salt-eval

Measure how much a piece of Salt AI tooling (an MCP server, a rules file, a docs bundle)
helps an agent get Salt right. One agent, one set of tasks, one set of graders. Only the
toolchain differs between arms. The output is a per-task pass fraction per arm and, with
two or more arms, the paired difference in percentage points.

Two tracks share one case format. The `instruct` track grades implementation
instructions with an LLM judge against a hidden rubric and trusted reference facts. The
`code` track grades a generated TSX module with deterministic graders (typecheck against
the Salt sources in this repository, Biome, export census, JSX composition rules) plus
optional judge criteria.

This is working infrastructure with an example suite, not a benchmark. The two shipped
cases are smoke fixtures marked `status: draft`. The offline tests prove the plumbing
with mock models. They prove nothing about any model's Salt expertise; only a calibrated
judge and human review do that. See `docs/methodology.md` before quoting a number.

## Requirements

- Node 24 and Yarn 4 (the deterministic graders run from `tooling/eval-graders`).
- Python 3.11 or later and [uv](https://docs.astral.sh/uv/).
- For live runs, credentials for an Inspect AI model provider. Offline tests need none.

## Install

Run these from the repository root, then from this folder:

```bash
yarn
cd salt-eval
uv sync
uv run salt-eval validate --solve
```

`validate --solve` schema-checks every suite and grades each code case's reference
solution with the deterministic graders. It prints `ok salt-core-v1 (2 cases)`.

Run the offline tests with `uv run pytest` here and `yarn workspace @salt-ds/eval-graders test`
at the root, or `yarn eval:test` at the root for both.

## Score one MCP server

1. Copy a profile template and point it at your server. Profiles hold environment
   variable names, never secrets.

   ```bash
   cp profiles/mcp-stdio.example.json profiles/my-mcp.json   # or mcp-http.example.json
   ```

   For stdio, set `command` and `args`. For HTTP, export `SALT_MCP_URL` (and
   `SALT_MCP_TOKEN` for bearer auth). Set `revision` to the server build you are testing
   and `knowledge_revision` to the frozen docs or annotations it serves. Only list the
   tools the experiment is about.

2. Run the suite against it.

   ```bash
   export PLANNER_MODEL=openai/gpt-4.1   # any Inspect model id your provider supports
   export JUDGE_MODEL=anthropic/claude-sonnet-4-5
   uv run salt-eval run --suite salt-core-v1 --arm mcp=profiles/my-mcp.json \
     --model "$PLANNER_MODEL" --judge "$JUDGE_MODEL" --trials 3 --out runs/mcp-solo
   uv run salt-eval report --run runs/mcp-solo
   ```

Before scheduling anything, `run` connects to every MCP server in the profile and lists its
tools. A wrong path, a dead endpoint or a missing tool name stops the run with one message
instead of a run full of execution errors; the tool names it found are recorded in the
manifest and shown in the report. `--skip-mcp-preflight` turns this off.

`runs/mcp-solo/report.md` shows the confirmed pass fraction, avg@k, pass^k, per-criterion
verdicts, unresolved counts and guard metrics (tokens, tool calls, seconds per trial).
A single arm gets no uplift figure. It is an absolute signal for that toolchain, and
`salt-eval gate --run runs/mcp-solo` still exits non-zero while any trial is unresolved.

## Compare two toolchains

The first `--arm` is the baseline. Every later arm is compared against it, task by task.

```bash
uv run salt-eval run --suite salt-core-v1 \
  --arm A=profiles/closed-book.json --arm B=profiles/my-mcp.json \
  --model "$PLANNER_MODEL" --judge "$JUDGE_MODEL" --trials 3 --out runs/mcp-vs-closed-book \
  --allow-knowledge-change
uv run salt-eval report --run runs/mcp-vs-closed-book
uv run salt-eval gate --run runs/mcp-vs-closed-book --min-uplift 10
```

`--allow-knowledge-change` is required when the arms serve different knowledge (a
closed-book baseline against any tooling). Leave it off to compare two builds of the same
server over the same frozen knowledge, where the run refuses to start if the
`knowledge_revision` values differ.

`report` writes `report.json` and `report.md`, and on first use exports a blinded
`review-queue.json`. `gate` exits non-zero while anything is unresolved, when a task
regressed, or when the uplift is below `--min-uplift`. The report withholds the uplift
while any verdict is `review`, any trial errored, any scheduled trial is missing, or the
arms are unpaired.

Add `--dry-run` to any `run` command to validate everything and print the manifest without
calling a model. Add `--resume` to continue a run that died half way.

## Author cases

```bash
uv run salt-eval new-case --suite salt-core-v1 --id dialog-close-001 --track code
uv run salt-eval validate --solve
```

`new-case` writes a schema-valid draft with `TODO` markers, plus a calibration file
(instruct) or a reference solution stub (code). `docs/writing-cases.md` explains every
field. `docs/graders.md` lists the deterministic check kinds and their parameters.

Keep private cases out of the public repository. Point `SALT_EVAL_SUITES` at one or more
directories of suites (separated by `:`) and every command finds them by id:

```bash
export SALT_EVAL_SUITES=/secure/salt-eval-suites
uv run salt-eval validate
uv run salt-eval run --suite internal-support-v3 ...
```

## Calibrate the judge before trusting instruct scores

```bash
uv run salt-eval calibrate --suite salt-core-v1 --judge "$JUDGE_MODEL" --out runs/calibration.json
```

This runs the real judge on the maintainer-labelled examples under `calibration/` and
exits non-zero when the false accept, false reject or review rate exceeds the thresholds in
`suite.json`. Agreement on a handful of examples is a smoke check, not a low error rate.

## Review a run

`review-queue.json` hides arm labels and automatic verdicts. A reviewer fills in
`reviewer`, a verdict and a reason per criterion, and for failures an `attribution`
(`knowledge-missing`, `tool-not-discovered`, `tool-response-incomplete`,
`agent-ignored-evidence`, `rubric-error`). Then:

```bash
uv run salt-eval review --run runs/mcp-vs-closed-book --reviews runs/mcp-vs-closed-book/review-queue.json
uv run salt-eval report --run runs/mcp-vs-closed-book --reviews runs/mcp-vs-closed-book/review-queue.json
```

`review` prints the judge's false accept and false reject rates against the human labels,
Cohen's kappa for each pair of reviewers who labelled the same items, and the attribution
counts. When two reviewers disagree the criterion stays `review` until adjudicated.

## Layout

| Path                             | Holds                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `salt_eval/`                     | The Python package and the `salt-eval` command.                                        |
| `schemas/`                       | JSON Schema for suites, cases, profiles, calibration, reviews and the grader protocol. |
| `suites/salt-core-v1/`           | The example suite: `suite.json`, `cases/`, `calibration/`, `solutions/`.               |
| `profiles/`                      | `closed-book`, `docs-bundle`, and the two MCP templates.                               |
| `fixtures/workspace-vite-react/` | The consumer-like tsconfig used to typecheck generated code.                           |
| `tests/`                         | Offline pytest suite. Mock models, a real stdio MCP fixture, the real graders.         |
| `docs/`                          | `writing-cases.md`, `graders.md`, `methodology.md`, `runbook.md`.                      |
| `../tooling/eval-graders/`       | The TypeScript graders and their must_fire and must_not_fire fixtures.                 |

`.venv/`, `.work/` (grader cache) and `runs/` are ignored by git.

## What is and is not verified

Verified offline, in CI and locally: schema validation, suite rules, judge output
validation, artifact extraction, every deterministic check kind on positive and negative
fixtures, the stdio protocol between Python and Node, both tracks end to end with mock
models and a real stdio MCP server, report rendering, gating, resume, review overlay and
kappa, calibration thresholds.

Not verified here: any real model provider, any real Salt MCP server, HTTP authentication
against a deployment, and the correctness of the example rubric. A Salt maintainer must
approve criteria and references against the pinned package version before a live score
means anything.
