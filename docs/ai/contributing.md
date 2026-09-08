# Contributing to Salt AI tooling

Start with the active unit and checkpoint in `plans/README.md`. Plan 033 is the
current workflow successor after the completed Plan 032 consumer-entry fixes.
Plan 006 is superseded unfinished, and
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

Use the single Plan 033 consistency check for the current worktree and recorded
control. There are no lifecycle phases or prescribed commit sequences. Record
actual unit start and completion commits, keep README/control status consistent,
and update the plan digest after reviewed plan edits. The retained Plan 032 and
Plan 006 validators have historical semantics and do not establish current dispatch or
Doctor fitness.

```shell
yarn validate:salt-ai:plan-033
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
replace the current Plan 033 check.

Also run the exact verification block for the active execution unit. Record
commands, package-size changes, semantic/bundle identities, and limitations in
the review description. Use Salt's public support-and-contributions destination;
do not add AI-scoped GitHub Issues routing.

## Current workflow authoring

The record-form workflow is maintained from its application recipe and the
selected Forms and Button source guidance. Do not edit generated manifests,
Knowledge output, web files, or a second prose copy. After changing behaviour
or guidance, first regenerate the public-example inventory:

```shell
yarn examples:manifest
```

Then run the ordinary heavy verification path. It deliberately separates
generation from checks, and needs built packages before checks that read them:

```shell
yarn check:public-examples
yarn build:ai-tooling
yarn vitest run packages/knowledge/src packages/cli/src --maxWorkers=1
yarn typecheck:ai-tooling
yarn validate:salt-ai:contracts
yarn check:ai-tooling:pack -- --report dist/salt-ai-pack/plan-033.json
yarn check:salt-sample-apps -- --app operations-dashboard
yarn build:salt-ai-web -- --workflow-cohort-receipt dist/salt-sample-apps/operations-dashboard-cohort-receipt.json --prepare-site-preview
yarn verify:salt-ai-web -- --verify-site-preview
yarn check:salt-docs-authoring -- --current-product --require-web-route-map dist/salt-ai-web/route-map.json
yarn check:public-docs
```

`check:salt-docs-authoring -- --current-product` checks current source
generation, the selected recipe and guidance, then reruns the existing web
preview verifier against the explicit generated route map. It rejects stale
bundle, bootstrap, route-map, or selected-guidance identities. It is not the
historical stage-based authoring audit, and it requires the route map produced
by the web build. `check:public-examples` and `check:public-docs` remain
separate checks.

For a local, offline author preview, opt in before producing the Mosaic
snapshot and site build. The opt-in replaces Google font loading with the
declared Fontsource assets and omits the release-data HTTP source; it leaves
the normal site path unchanged.

The generated `site/public/ai` directory is only for local previews. Ordinary
site builds reject it; remove that generated directory before returning to a
normal build. The workflow and Button resource panels appear only in the
explicit offline-author preview.

```shell
yarn workspace @salt-ds/site gen:snapshot:offline-author
yarn workspace @salt-ds/site build:offline-author
yarn workspace @salt-ds/site serve:offline-author
# Inspect the served Forms and Button pages in a browser.
# Separately, test the generated static-artifact component surface:
yarn vitest run --config vitest.browser.config.mts --browser.headless test/browser/salt-workflow-preview.browser.test.tsx
```

The automated path proves generated-source consistency and the current
workflow's installed-package reconstruction. A maintainer who did not build
the compiler must also make one realistic record-form behaviour and guidance
change using this guide, regenerate, preview, and review the four rendered
surfaces. Record active elapsed time, manually edited source files, repeated
facts, and friction in the ordinary review. Deliberately remove a declared
file or use unsupported content once, and record the diagnostic and the source
correction it identifies. That exercise is human review evidence; it does not
replace the automated checks above.
