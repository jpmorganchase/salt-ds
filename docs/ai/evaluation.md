# Salt AI evaluation protocol

The checked-in evaluation suite is deterministic governance plus a sanitized
receipt format. It never commits prompts, model output, traces, credentials,
proprietary repositories, or absolute paths. Those live only in ignored,
access-controlled `.salt-eval-cache` for the ratified retention period.

## Modes and corpus

Four cumulative mode IDs are frozen in `evals/salt-ai/protocol/modes.json`:
base tools; selected Markdown; Markdown plus CLI and the selected bootstrap;
and conditional same-bundle MCP. Modes 1-3 are mandatory at GA. Final MCP omit
closes mode 4 as `not_selected`.

The 14 outcome cases cover choose, configure, create, repair, migrate, project
wrappers, invalid imports, deprecated props/tokens, partial mismatch, Lab
prerelease, non-Salt control, and valid no-op behavior. Activation cases are
disjoint. The activation experiment chooses AGENTS-only, Skill-only, or combined
by discovery/setup success with no correctness regression, then fewer
artifacts/tokens.

## Controls

Every full cell uses a fresh checkout/session/cache, identical repository and
package vector, two declared host/model aliases, three repetitions, fixed
settings/budgets, a committed seed, and counterbalanced order. One retry is
allowed only for transient provider transport/rate-limit/5xx failure before any
output or tool action. Missing, timed-out, tool-failed, empty, invalid, partial,
or grader-failed scheduled trials remain failures in the denominator.

Deterministic compile/type/interaction/scan checks run before blind human
judgment. Two mode-blind reviewers adjudicate Salt-specific claims. Raw attempts
are content-hashed and their retention state is recorded in the sanitized
receipt.

## Gates

- mode 3 improves task success >=10 percentage points over mode 2 with no exact
  version-correctness regression;
- mode 4 adds >=5 points on the MCP-eligible subset or two successful paired
  cells per host/model, without correctness/claim-rate regression;
- retrieval recall@5 >=95% micro and category-macro on >=40 gold queries;
- scan precision >=95% and recall >=90% per rule and macro, with >=20 positive
  and >=20 negative fixtures per gateable rule;
- unsupported claims <2% per gated supplied-context mode with >=200 assessable
  claims and two-reviewer adjudication;
- public/copy-ready example, deterministic build, provenance, privacy,
  isolation, and exact-version gates in the metric registry.

`evals/salt-ai/protocol/metric-definitions.json` controls waiver eligibility.
Integrity, deterministic identity, provenance, privacy/security/path isolation,
version correctness, failed coverage, complete required modes/cells, mode-3
uplift, and unsupported-claim rate are never waivable.

## Commands

```shell
yarn eval:salt-ai:validate
yarn eval:salt-ai:baseline
yarn eval:salt-ai:report -- --cohort baseline-pre-platform
```

The Unit 00b baseline characterizes current deterministic infrastructure and
Catalog-v2. It does not claim model quality. Modes 2-4 are explicitly
`not_available` and have no score.
