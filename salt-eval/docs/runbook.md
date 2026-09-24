# How to run and operate salt-eval

## Run a live experiment

1. Validate the suite and the profiles without spending a model call.

   ```bash
   cd salt-eval
   uv run salt-eval validate <suite> --solve
   uv run salt-eval run --suite <suite> --arm A=<baseline.json> --arm B=<candidate.json> \
     --model "$PLANNER_MODEL" --judge "$JUDGE_MODEL" --trials 3 --dry-run
   ```

   The dry run prints the manifest. Check the schedule, the arm hashes and the
   `context_bundle` accounting (which files fit under `max_chars`).

2. Calibrate the judge on the suite's labelled examples.

   ```bash
   uv run salt-eval calibrate --suite <suite> --judge "$JUDGE_MODEL" --out runs/calibration-$(date +%F).json
   ```

   A non-zero exit means the judge breached a threshold in `suite.json`. Fix the rubric or
   change the judge before running the experiment.

3. Run.

   ```bash
   uv run salt-eval run --suite <suite> --arm A=<baseline.json> --arm B=<candidate.json> \
     --model "$PLANNER_MODEL" --judge "$JUDGE_MODEL" --trials 3 --out runs/<name> \
     --max-connections 4 --max-retries 5
   ```

   `--max-samples` defaults to 1 so a remote MCP server that keeps conversational state
   sees one conversation at a time. Raise it only for stateless servers. `--max-retries`
   and `--max-connections` pass through to Inspect for rate-limited providers.
   `--time-limit` overrides the per-track default (180 s instruct, 300 s code).

4. Report, review, gate.

   ```bash
   uv run salt-eval report --run runs/<name>
   inspect view --log-dir runs/<name>/logs
   uv run salt-eval gate --run runs/<name> --min-uplift 10
   ```

## Resume a run that died

```bash
uv run salt-eval run ... --out runs/<name> --resume
```

`--resume` reads the existing manifest, refuses to continue if the suite or the profiles
changed, and skips every (arm, trial, track) item whose log finished successfully. The
`--out` directory must not exist for a fresh run; the command refuses to write into one.

## Rescore without regenerating

Inspect can score saved logs, which is how you develop a rubric without paying for new
responses. `scorers.py` in this folder is the entry point Inspect needs:

```bash
uv run inspect score runs/<name>/logs/<file>.eval --scorer scorers.py@salt_rubric \
  --model-role "grader=$JUDGE_MODEL" --action overwrite --output-file runs/<name>-rescored/logs/<file>.eval
```

Write rescored logs into a new run directory and copy `manifest.json` next to them.
`report` rejects duplicate (arm, trial, sample) keys within one directory, so never mix
scoring versions. Old logs carry the suite hash and prompt hashes they were scored with;
a rubric change means a new suite `revision` and a rescore of both arms.

## Where things are

| Artifact                            | Path                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| Manifest (schedule, hashes, limits) | `runs/<name>/manifest.json`                               |
| Inspect logs                        | `runs/<name>/logs/*.eval`                                 |
| Report                              | `runs/<name>/report.json`, `report.md`                    |
| Blinded review queue                | `runs/<name>/review-queue.json`                           |
| Review audit                        | `runs/<name>/review-audit.json` (from `salt-eval review`) |
| Grader stderr                       | `.work/grader-stderr.log`                                 |
| Export census cache                 | `.work/registry-<git-sha>.json`                           |

## Environment variables

| Variable                                                          | Used by                                                                |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Provider credentials (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, ...) | Inspect, for `--model` and `--judge`.                                  |
| Names listed in a profile's `url_env`, `token_env`, `env_names`   | MCP connections. `run` refuses to start if one is unset.               |
| `SALT_EVAL_SUITES`                                                | Extra suite roots, `:`-separated, for private suites.                  |
| `SALT_EVAL_NODE`                                                  | Path to the Node binary for the graders, when `node` is not on `PATH`. |

## CI

`.github/workflows/salt-eval.yml` runs on changes under `salt-eval/` or
`tooling/eval-graders/`. It lints and tests the graders, installs the Python package with
`uv sync --frozen`, runs `salt-eval validate --solve` and `pytest`. Everything is offline
with mock models. Live runs stay manual because they need credentials and cost money, and
because a live number without calibration and review would be misleading in a status check.

## Troubleshooting

- `grader binary missing`: run `yarn` at the repository root.
- `grader produced no reply within 120s`: read `.work/grader-stderr.log`. The first
  request builds the TypeScript program over the Salt sources, which takes a few seconds;
  120 s means Node or the TypeScript dependency is broken.
- `MCP server 'x' (...) is unreachable` or `did not answer list_tools within 30s`: the
  preflight handshake failed. Check the `command`/`args` or the URL variable in the
  profile and start the server by hand. `--skip-mcp-preflight` schedules anyway; the
  report then shows `not checked` for that arm's tools.
- `MCP server 'x' does not expose [...]`: the profile's `tools` list names a tool the
  server does not have. Fix the list or use `"all"`.
- `knowledge_revision differs from the first arm`: the arms serve different knowledge.
  Pass `--allow-knowledge-change` and describe the result as a whole-solution comparison.
- `Incompatible experiments in one log directory`: logs from two different suites,
  prompts or models share a directory. Use one `--out` per experiment.
- Every instruct verdict is `review`: the judge output failed validation. Open a log in
  `inspect view` and read `raw_judgment` in the score metadata. Usually the judge quoted
  text that is not in the response, or returned prose around the JSON.
