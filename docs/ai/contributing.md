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

Before routine review, run focused tests for the changed behavior and the
checks below. Use the full product suite at the integration checkpoint.
There are no lifecycle phases or prescribed commit sequences. Record actual
unit start and completion commits, keep README/control status consistent,
and update the plan digest after reviewed plan edits. The retained Plan 032 and
Plan 006 validators have historical semantics and do not establish current dispatch or
Doctor fitness.

```shell
yarn validate:salt-ai:plan-033
yarn validate:salt-ai:contracts
yarn verify:salt-ai-release-embargo
```

`eval:salt-ai:validate` is the standalone evaluation
metadata check, also called by current contracts; it verifies definitions and
identities without executing model trials or establishing retrieval quality.
See [evaluation.md](./evaluation.md) for current counts and frozen baseline
provenance.

For an explicit historical audit or a change to those readers, use
`yarn test:salt-ai-governance` and
`yarn validate:salt-ai:contracts:historical`. Preserve their rejection tests and
frozen inputs. Phase-based Plan 006 commands remain historical; they do not
replace the current Plan 033 check.

Complete the active unit's verification block before its integration review.
Routine edits use the focused checks below; record results and limitations in
the ordinary review rather than repeating a full checkpoint for every edit.
Use Salt's public support-and-contributions destination; do not add AI-scoped
GitHub Issues routing.

## Current workflow authoring

Start with a real developer question or example improvement:

1. Edit the canonical MDX for design guidance, or the workflow source for
   example behavior. The service-operations workflow's
   `examples/apps/operations-dashboard/src/workflows/service-worklist/recipe.json`
   identifies its public files and guidance. Keep reusable code separate from
   local demo adapters; Button loading retains its component example.
2. Read changed prose in its generated section. Use the existing local preview
   when presentation, rendering or interaction changes, and check what a reader
   will encounter.
3. Check the changed surface. A layout adjustment needs formatting and a focused
   browser check. A behavior change also needs its relevant interaction checks.
   For canonical content, rebuild Knowledge and check that the relevant task
   question receives the decisive guidance, as described below.

Do not edit generated manifests, Knowledge output, web files, or a second prose
copy. Regenerate the public-example inventory only when its files or recipe
change:

```shell
yarn examples:manifest
```

Learn authoring friction from the next genuine maintainer change. Note confusing
instructions or repeated facts in its ordinary review; no contrived failure or
timed exercise is required. An agent rehearsal does not establish independent
human authoring experience, and neither changes workflow readiness or promotion
and release requirements.

## Authoring task evidence

Keep intent, alternatives, composition, state expectations and accessibility in
canonical MDX. Use recognizable headings such as When to use, When not to use,
Composition, Submission and recovery, and Accessibility where they help the
reader. No page is required to carry every heading. Link to existing guidance
instead of repeating it. Code continues to supply API and version facts.

The selected-guidance descriptors preserve whole source sections and their
semantic roles. A sparse selector override is appropriate when a heading such
as Default does not identify its composition role. Pair separate conditions
and exclusions in a qualification group; do not group a whole workflow merely
to force it into context. Unknown headings remain generic guidance.

For the editable-record pilot, add the expected evidence for a real question to
`packages/knowledge/src/__fixtures__/taskEvidenceQuestions.json` before changing
selection. Check meaningful clauses and conditions rather than exact prose or
output snapshots. Rebuild from the edited source before checking the evidence:

```shell
yarn workspace @salt-ds/knowledge build:knowledge
yarn vitest run packages/knowledge/src/search/taskKnowledgePilot.spec.ts --maxWorkers=1
```

This checks the generated Knowledge used by task context. To inspect the CLI
output too, first run `yarn build:ai-tooling` so its packaged Knowledge is fresh.
A matching citation without the decisive clause is a miss; a qualified omission
is a separate compact-output outcome. Example-specific behavior stays in the
recipe and does not become universal Salt policy.

## Integration checkpoint

Run the complete path at the active unit's integration checkpoint to verify
export, packaging and web integration together. It separates generation from
checks and requires fresh built packages before their consumers. The full
Knowledge/CLI suite runs product regressions without replaying historical
governance acquisition. The commands assume existing local dependencies. In particular,
`check:salt-sample-apps` installs the packed consumer cohort: run that step only
when the active unit explicitly authorizes it. A source preview does not prove
an installed-package reconstruction. This guide grants no installation, network,
model-call, publication or deployment authority.

```shell
yarn build:ai-tooling
yarn vitest run packages/knowledge/src packages/cli/src --maxWorkers=1
yarn typecheck:ai-tooling
yarn validate:salt-ai:contracts
yarn check:ai-tooling:pack -- --report dist/salt-ai-pack/plan-033.json
yarn check:salt-sample-apps -- --app operations-dashboard
yarn build:salt-ai-web -- --workflow-cohort-receipt dist/salt-sample-apps/operations-dashboard-cohort-receipt.json --prepare-site-preview
yarn check:salt-docs-authoring -- --current-product --require-web-route-map dist/salt-ai-web/route-map.json
yarn check:public-docs
```

`check:salt-docs-authoring -- --current-product` checks current source
generation, the selected recipe and guidance, then reruns the existing web
preview verifier against the explicit generated route map. It rejects stale
bundle, bootstrap, route-map, or selected-guidance identities. It is not the
historical stage-based authoring audit, and it requires the route map produced
by the web build. It includes public-example and web-preview verification;
there is no need to repeat those checks at the same checkpoint. For diagnosis,
run `yarn check:public-examples` or
`yarn verify:salt-ai-web -- --verify-site-preview` separately.
`check:public-docs` remains a separate check.

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
# Inspect /salt/patterns/analytical-dashboard and /salt/components/button/examples.
# Separately, test the generated static-artifact component surface:
yarn vitest run --config vitest.browser.config.mts --browser.headless test/browser/salt-workflow-preview.browser.test.tsx
```
