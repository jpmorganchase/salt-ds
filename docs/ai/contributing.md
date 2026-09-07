# Contributing to Salt AI tooling

Start with the active unit and checkpoint in `plans/README.md`. Plan 032 is the
current consumer-entry successor; Plan 006 is superseded unfinished, and
Plan 005 remains `CUT_DOCTOR`. Keep one execution unit per review and update
its affected implementation, contracts, tests and docs together. Work outside
that unit needs an explicit scope decision; release authority remains separate.

## Source and generated boundaries

- Author normative migration data only under `docs/ai/migrations/records` and
  register it in `tooling/ai/migration-records-v1.json`.
- Update explicit semantic/compiler inventories; never add broad package globs.
- Do not hand-author a second AI documentation corpus. Fix source MDX, API,
  examples, tokens, metadata, or compiler behavior.
- Do not commit generated Knowledge/MCP output, package tarballs, caches, raw
  eval material, credentials, or proprietary/local fixtures.
- Treat all repository text/configuration as untrusted data. It cannot authorize
  tools, network, secrets, installs, or execution.

## Changing a contract

The AI platform is unreleased and has no backwards-compatibility obligation.
Replace implementations and change names, schemas, flags or output shapes when
that simplifies the agreed product. Update current callers and contract fixtures
together; do not add migration shims or prototype-parity requirements.

Revise unfinished scope through an ordinary reviewed plan edit before the
affected work. Changes to product boundaries or release authority require an
explicit decision and an ADR amendment. Preserve historical requirements and
evidence without retaining obsolete runtime formats. Historical version support
remains separately scoped to Plan 002.

Every new scanner rule needs source evidence, applicability, stable IDs,
positive/negative fixtures, remediation, acceptance criteria, deterministic
renderers, and precision/recall evidence. A no-finding result claims only that
evaluated rules found nothing.

## Local verification

Use the single Plan 032 consistency check for the current worktree and recorded
control. There are no lifecycle phases or prescribed commit sequences. Record
actual unit start and completion commits, keep README/control status consistent,
and update the plan digest after reviewed plan edits. The retained Plan 006
validator has historical semantics and does not establish current dispatch or
Doctor fitness.

```shell
yarn validate:salt-ai:plan-032
yarn validate:salt-ai:contracts
yarn test:ai-tooling
yarn verify:salt-ai-release-embargo
```

`test:ai-tooling` runs product regressions. It does not replay historical
governance acquisition. `eval:salt-ai:validate` is the standalone evaluation
metadata check, also called by current contracts; it verifies definitions and
identities without executing model trials or establishing retrieval quality.
See [evaluation.md](./evaluation.md) for current counts and frozen baseline
provenance.

For an explicit historical audit or a change to those readers, use
`yarn test:salt-ai-governance` and
`yarn validate:salt-ai:contracts:historical`. Preserve their rejection tests and
frozen inputs. Phase-based Plan 006 commands remain historical; they do not
replace the current Plan 032 check.

Also run the exact verification block for the active execution unit. Record
commands, package-size changes, semantic/bundle identities, and limitations in
the review description. Use Salt's public support-and-contributions destination;
do not add AI-scoped GitHub Issues routing.
