# Changelog

## 0.1.0

First packaged version. Replaces the loose scripts (`salt_eval.py`, `run_pair.py`,
`report.py`, `calibrate.py`, `test_harness.py`) with the `salt-eval` command.

- Python package with `uv` lockfile and pytest suite. Commands: `validate`, `new-case`,
  `run`, `report`, `review`, `gate`, `calibrate`.
- JSON Schema for suites, cases, profiles, calibration files, review files and the grader
  protocol. One check definition shared by cases and grader requests.
- Suite layout `suites/<id>/{suite.json,cases,calibration,solutions}` with case status,
  provenance, contamination class, Salt version pins and a canary string. Held-out cases
  excluded by default. Private suites mount through `SALT_EVAL_SUITES`.
- Toolchain profiles with N MCP servers (stdio or HTTP, environment variable names only),
  system prompt files and a capped context bundle. Shipped: `closed-book`, `docs-bundle`,
  `mcp-stdio.example`, `mcp-http.example`.
- `run` takes any number of `--arm NAME=profile.json`, randomises arm order per trial,
  writes a manifest first, supports `--dry-run` and `--resume`, and checks environment,
  prompt files, judge presence and knowledge alignment before the first model call. It
  also connects to every MCP server, lists its tools, records them in the manifest (shown
  in `report.md`) and stops on an unreachable server or a missing tool name;
  `--skip-mcp-preflight` disables the handshake.
- `gate` reads a structured `blocked` flag rather than the status text, so a single-arm
  run with unresolved trials fails the gate like a paired one.
- Code track: `tooling/eval-graders` (TypeScript, runs from source under Node 24) with
  `ts:typecheck`, `lint:biome`, `salt:imports-resolve`, `salt:no-deprecated`,
  `jsx:required-element`, `jsx:required-ancestor`, `jsx:forbidden-element`,
  `jsx:prop-value`, `jsx:prop-absent`, `text:forbidden-pattern`, each with `must_fire` and
  `must_not_fire` fixtures. `render:smoke` reserved. Export census cached per git commit.
- Report: per-arm confirmed pass fraction, avg@k, pass^k, per-criterion verdicts, guard
  metrics (tokens, tool calls, seconds, cost when known), paired uplift against the first
  arm with clustered standard error, minimum detectable effect and cluster bootstrap,
  `report.md` rendering, `gate` exit codes.
- Review: blinded queue, multi-reviewer overlay with Cohen's kappa, failure attribution
  labels, false accept and false reject rates.
- Calibrate: thresholds from `suite.json`, non-zero exit when breached.
- Example suite `salt-core-v1` with the migrated `salt-readonly-001` instruct case and a
  new `salt-readonly-code-001` code case with a checked-in reference solution. Both are
  `draft` smoke fixtures, not a benchmark.
- CI workflow `.github/workflows/salt-eval.yml`, offline only.
