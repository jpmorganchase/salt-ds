# Plan 033: Deliver Salt guidance and verified workflows from one source

## Status and intent

- Status: IN PROGRESS — Unit 033/02a at `4f009ec3601b801856a69c0ac56928fc65c7bc65`
- Priority: P0 product capability.
- Effort: 6–10 engineering days for Units 033/01–02a, including design/accessibility review; re-estimate after the compiler slice and independent maintainer exercise. Conditional expansion is separate.
- Risk: MED; new canonical content and deliberate unreleased output/API changes.
- Planned at: `e55fa54e215503b4a0e521e2f5ee054b9f0068ce`, 2026-09-06.
- Depends on: foundation fixes and same-project package verification from the canonical [Plan 032 execution handoff](./032-fix-the-real-consumer-entry-path.md); adopted successor dispatch. Content discovery/design can proceed independently of Doctor qualification.

Before execution, run `git diff --stat e55fa54e215503b4a0e521e2f5ee054b9f0068ce..HEAD -- packages/knowledge/src packages/cli/src site examples/apps scripts test/browser` and compare affected source against the evidence below. Revise stale unit details before implementation. Only the subsequently adopted unit is executable; use its active control checks and ordinary `codex/` branch convention. Whenever a unit changes generated content or its contract, rebuild that candidate before tests that consume generated Knowledge, then verify the packed output.

Salt AI should help a developer and their existing agent produce an accepted interface. The first implementation established a complete record form and faithful Button loading guidance. On 2026-09-08 the user rejected that scope as insufficient for a meaningful platform test and directed continued, purposeful progress toward the complete platform. The next local delivery therefore covers one coherent operations-dashboard journey: navigation, a filterable worklist, record inspection and editing, and empty/loading/failure/recovery states. Its guidance and complete files must work through the existing website, Markdown and CLI path. This expands runnable application coverage; owner/design/manual accessibility review, the independent maintainer exercise and real consumer observations remain outstanding and are not inferred from local checks.

The implementation remains in Salt's canonical source, examples, documentation, Knowledge generator/runtime, and existing test infrastructure. Use a small generated static catalog for files and references; a registry service, model service, plugin framework, installer, or general application generator is not part of this work.

Apply the adopted code disposition: reuse the source/API/token compiler, logical record codecs, verified store and deterministic scorer. Replace the selected material's existing projection path, and remove superseded code as its last caller migrates. Do not build a parallel compiler or preserve unsupported interfaces merely because they already have tests.

The platform is unreleased: there is no requirement to preserve previous AI record shapes, output formats or APIs. Reuse recommendations and the bounded form/Button content scope do not prohibit a simpler rewrite. Change current schemas, callers, generated outputs and tests together, without shims or dual runtime readers. Keep canonical content accurate and acceptance meaningful; old implementation behavior is not the oracle for a deliberately changed contract.

## Execution boundary and adoption

The completed foundation is Plan 032 at `d2c7000865da920655d6461eb46e95f7eb84db43`. Its control records actual completion; its plan, checks and earlier evidence remain historical. Unit 033/01 completed its local implementation at `dc7315a08f4356c3796d98196017e4e0f81fb877`; Unit 033/02 completed at `4f009ec3601b801856a69c0ac56928fc65c7bc65`. The single current dispatch is Unit 033/02a in `plans/evidence/033/control.json` and the Active dispatch block in `plans/README.md`. Record actual unit checkpoints and completion commits, update the plan digest with reviewed scope revisions, and permit ordinary implementation commits. There are no lifecycle phases, custom amendment protocol or predicted commit hashes.

Unit 033/02 passed the current types/contracts, 51 Knowledge/CLI test files with 638 tests, package limits and actual reconstruction from the 12 packed recipe files. The reconstructed application passed existing behavior, validation, pending/failure/retry/cancellation, keyboard/focus, axe, 320 CSS-pixel layout and the deliberate validation-removal negative. The final structured source review was clean. These are local correctness results: owner/design/manual accessibility review and the independent maintainer exercise remain pending, and readiness remains runnable.

This adoption updates this plan/control, Plan 032's completion record, the active README, contributor/ADR guidance, the current-plan command and its focused checks, and the normal CI caller. The small `yarn validate:salt-ai:plan-033` check verifies current plan/control/README agreement and real commit references; it does not replay historical plan execution. Run its focused tests, current contracts, tracker, release embargo and changed-file quality, then ordinary review before product implementation. Preserve the old Plan 006 CI supersession guard.

Only the named unit executes. Unit 033/01 authorizes local source changes, builds, browser tests and scoped npm setup inside the existing `checkSaltSampleApps` temporary sample-app fixtures and their deliberate negative copies. Those fixtures may obtain declared dependencies and install the exact locally packed CLI/Knowledge cohort; no installation in actual consumer repositories is authorized. Browser/application/tool runtime stays offline, with application state simulations local and tooling read-only. Publication, version materialization, dist-tags, deployment, consumer contact and product host/model trials remain separate. The user-authorized implementation proceeds without those external actions; missing participant access does not block local correctness work.

Before each review run current-plan validation, contracts, `yarn check:changed-quality -- --base <recorded-unit-start-sha>`, `git diff --check` and the unit's specific checks. Rebuild generated Knowledge before tests consuming it whenever its inputs change. Runtime correctness receipts cannot qualify Doctor, and automated accessibility checks cannot stand in for declared manual review. Readiness must disclose outstanding owner/design review and tested scope honestly.

## Product and authoring pivot

Treat documentation and examples as maintained, executable product material. A single source of design guidance, public implementation files and acceptance definitions feeds the existing website preview, portable example files, readable Markdown and local agent tools. Units 033/01–02a establish that path for the form and Button loading slice. They do not require a rewrite of every component/page record, a website overhaul, or a parallel content project, and they do not change tracked execution authority.

Keep MDX for editorial prose and derive API facts from public source. Preserve Salt's existing design decisions, diagrams and examples; add small authored annotations only where relationships cannot be expressed reliably today. Do not ask writers to maintain a second AI prose corpus or encode whole pages into JSON.

Serve three complementary example levels:

| Level                   | Job                                                    | Acceptance boundary                                                                   |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Small component example | Explain one prop, appearance or interaction            | Accurately illustrates the named feature; clearly identifies surrounding setup        |
| Composition recipe      | Combine primitives for a reusable interaction          | Complete files/dependencies, adaptable application seams and relevant behavior checks |
| Complete workflow       | Fulfil a realistic task including failure and recovery | Reconstructable package, independent workflow acceptance and owner review             |

Readiness remains separate from level: a large application is not automatically verified, and a small example need not become an application. Begin with the record-form workflow and the existing Button loading section as a content-extraction regression. Preserve existing contextual output for unconverted content, with explicit limitations and no implied promotion. After 3–5 observed first-workflow uses and the maintainer exercise, decide whether to refine the first journey or select the next workflow from demonstrated demand.

## Current state

Relevant sources:

- `packages/knowledge/src/build/buildKnowledgeV1.ts:438` — Markdown projection and example index.
- `packages/knowledge/src/build/normalizeKnowledgeRecords.ts:2032` — extracted example code and unvalidated evidence.
- `packages/knowledge/src/search/searchSalt.ts` — ranking and context output.
- `packages/knowledge/src/markdown/resolveKnowledgeDocument.ts` — document selection/rendering.
- `packages/knowledge/src/build/catalogSemanticInputPatterns.json` — explicit semantic source inventory, currently excluding `examples/apps`.
- `examples/apps/operations-dashboard/` — functioning public-package application seed.
- `site/src/examples/form-field/Validation.tsx`, `site/src/examples/dialog/`, `site/src/examples/table/`, `site/src/examples/vertical-navigation/` — component examples.
- `site/docs/patterns/{forms,content-status,analytical-dashboard,navigation}.mdx` and `site/docs/getting-started/{choosing-the-right-primitive,composition-pitfalls}.mdx` — canonical design choices.
- `scripts/checkSaltSampleApps.mjs:32` — three named sample apps and packed/browser verification.
- `scripts/checkSaltSampleApps.mjs:332`, `:344`, `:952`, `:1138` and `scripts/schemas/saltSampleAppCohortReceiptV1.schema.json:193` — legacy required README/scan/Cypress checks and scan receipt fields that must be reconciled before using this harness for the new product.
- `packages/knowledge/src/build/pageTextExtractor.ts:40` — extracts paragraph/list/table text while losing heading structure, code blocks, link targets and presentation-node meaning.
- `packages/knowledge/src/build/buildRegistryComponents.ts:735` and `site/docs/components/button/examples.mdx:63` — every nested heading resets the inferred example context; Loading's example can acquire the title “Best practices” and lose its parent explanation.
- `scripts/checkPublicExamples.mjs:25`, `:246` and `site/src/examples/patterns/manifest.json` — the existing public-pattern inventory generates a manifest and source loader map. Those generated files are outputs, not another place to author facts manually.
- `site/src/components/components/fetchExample.ts:10`, `:59` and `LivePreview.tsx:65` — patterns show declared source files, component examples show a single TSX source, and previews supply surrounding providers that a consumer must know to reproduce the result.

The baseline generator emits:

```ts
const markdown = `# ${safeMarkdown(record.title)}\n\n${safeMarkdown(record.summary)}\n`;
// Every example currently receives:
status: "contextual",
entry_file: null,
supporting_files: [],
dependencies: [],
css: [],
providers: [],
package_vector: [],
```

It lists 983 contextual examples. Do not convert those labels to verified in bulk. Promote only examples whose complete artifact and acceptance evidence exist.

The existing operations dashboard test combines filtering, a dialog, theme/density, and axe. It is a useful starting point, not sufficient proof of all required states or accessibility. In particular, `site/docs/foundations/density.mdx:64` warns against high density as a default and documents its accessibility implications.

## Target content contract

The unit of value is a maintained workflow with these required fields:

| Field group              | Required content                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Identity and support     | Stable ID, title, owner, readiness, exact tested package vector, source references                                        |
| Intent and selection     | User job, prerequisites, when to use, alternatives and tradeoffs                                                          |
| Implementation           | Complete entry/supporting files, public imports, dependencies, provider/theme/CSS setup                                   |
| Application seams        | Data input, submission callbacks, routing, validation, cancellation; existing app conventions remain authoritative        |
| States and transitions   | Applicable loading, empty, no-match, error, success, pending, disabled and recovery behavior                              |
| Operating constraints    | Intended data size, long-content/layout assumptions, asynchronous state ownership and unsupported scale/integration cases |
| Design and accessibility | Layout/token decisions, keyboard/focus/naming/status behavior, viewport/theme/density expectations                        |
| Verification             | Build/type checks, named behavioral assertions, visual/manual review requirements, explicit limitations                   |
| Handoff                  | Canonical docs links, bounded context sections, next resolvable reference when more detail is needed                      |

Use three readiness labels with enforced meaning: **contextual** (illustration only), **runnable** (complete files/setup and build pass), **workflow-verified** (runnable plus the stated independent interaction/accessibility/design acceptance). The last label applies to the tested reference workflow and support matrix; it is not a certification of arbitrary consumer adaptations.

Implement the smallest typed schema that represents these fields. Reuse existing manifest identity, source references, and validation conventions. A content record must never embed executable shell behavior that the runtime automatically executes.

Author intent, design rationale, application seams, exceptional setup and acceptance requirements, plus an explicit bounded inventory of the recipe's public files/assets. Keep dependency declarations in the runnable setup's existing manifest and validate imports, assets and reconstruction against that inventory. Derive straightforward API facts, source identities and tested-version/readiness evidence from existing source/build checks; a general dependency-inference engine is outside the first delivery. Keep references to authored prose instead of manually duplicating it inside metadata. Evolve the current inventory/generation path and review the generated diff; do not hand-edit `patterns/manifest.json` or `patternSourceLoaders.ts` as primary sources.

## Unit 033/01 — Complete one flagship workflow before expanding

Scope: the existing `examples/apps/operations-dashboard/` verification application, adding reusable form files and `recipe.json` under `src/workflows/record-form/` and integrating them into its current incident dialog. Preserve its provider, theme, navigation, filtering and domain wrapper. Include its README, canonical form docs and an explicitly bounded source inventory. Update `scripts/checkSaltSampleApps.mjs`, focused harness tests, current sample-app receipt schema/consumers, and the three current sample-app READMEs that advertise the removed scan command. Also remove unused `packages/cli/src/commands/scan.ts`, `packages/cli/src/renderers/{json,pretty,prompt,sarif}.ts` and their dedicated renderer tests after the harness migration. No new application scaffold or duplicate Cypress test suite is required.

Build a **validated record form** using current public Salt primitives and the consumer-facing provider/theme setup. Make its data/submission seams explicit. Require:

- Initial data can be edited and invalid values produce associated messages.
- Submitting invalid data keeps entered values and moves focus meaningfully.
- Pending submission prevents accidental duplicate submission without hiding progress.
- A failed submission preserves input and supports retry; success is announced.
- Cancellation obeys the specified data-preservation/confirmation policy.
- Keyboard, labels, focus, error announcements, narrow layout and zoom are checked.
- Demo data and submission behavior are clearly local simulations; no fictitious backend or notification claim.
- Long field labels, realistic error text and delayed/rejected submission fit the declared layout and state ownership. If the task permits overlapping requests, stale results must not overwrite newer intent. State which data-size and integration assumptions were tested.

Start from the existing form examples and canonical forms pattern. Keep application-specific state/data libraries outside the recipe unless required and justified. Write the acceptance assertions before calling the workflow verified. Include at least one negative variant with removed validation or disabled submission and prove that the independent checks reject it.

Define an explicit adaptation contract: inputs, submit/cancel callbacks, state ownership and the minimum provider/theme requirements. Supply local demo adapters separately from reusable UI. Use the operations dashboard as the prepared existing application: its provider, navigation, service data and incident wrapper supply real integration seams. Keep the reusable form controlled through draft/change, asynchronous submit and cancel callbacks, with its local delayed/fail-once simulation in a separate adapter. The host retains draft ownership; cancellation closes without discarding input, and reopening restores the draft. Integrate through those seams, preserve existing acceptance, and reject a variant that removes working behavior. The host agent follows the application's chosen libraries; the recipe must not prescribe replacing them with its demo stack.

Reconcile the existing sample-app harness before extending it. It still requires README text advertising removed `salt-ds scan`, invokes `scan --allow-incomplete`, and requires a scan result in each receipt. Replace those current-product assumptions with the adopted CLI contract. Build/type/browser acceptance must run and remain meaningful whether Doctor is retained or retired. If eligible Doctor analysis is included, report its findings, coverage and limitations separately; skipped or unavailable analysis is not a clean result. Update the current receipt schema, app-name enums and consumers together through the adopted schema transition, preserving immutable predecessor receipts.

Use the existing Playwright acceptance path for the new workflow and add its task-specific assertions there. The harness also currently requires a `cypress/app.cy.ts` file by text inspection; reconcile that requirement to the actual executed browser checks so the new workflow does not need duplicate test implementations. Preserve meaningful existing coverage. Installation/packing runs only in the activated fixture scope.

Finish the existing scan retirement in code. `packages/cli/src/__tests__/cli.spec.ts:299` already rejects the command; its implementation and four renderers have no runtime caller. After current harness/docs callers are corrected, remove that closure and tests solely for the retired formats. Keep the rejected-command regression and all shared `scan/result`, discovery/config and worker behavior while Doctor still uses it; 035/03 owns their later retirement. Confirm remaining source/tests do not import removed modules.

Verify: existing `yarn check:salt-sample-apps -- --app operations-dashboard` using its existing app registration; expect packed public dependency resolution, typecheck/build, named browser acceptance, and supported offline core commands to pass independently of Doctor. Add focused harness tests for the existing app selection, updated receipt shape, explicit unavailable analysis, and failure propagation. Public imports and sample changes also run `yarn check:public-examples` where applicable. The checks must fail on each deliberate negative variant. Bundling with package imports marked external is not evidence of actual API or setup compatibility.

## Unit 033/02 — Share the form and Button guidance across outputs

Unit 033/01 completed local source and automated acceptance at `dc7315a08f4356c3796d98196017e4e0f81fb877`. The packed operations dashboard passed type/build, existing application behavior, form validation and recovery, keyboard/focus, automated accessibility, 320 CSS-pixel layout, offline core commands and the independent validation-removed negative variant. The current receipt validated against V2, including app-to-check correlation and mandatory runtime evidence. Twelve focused harness tests, 683 tooling tests, tooling types/build, 24 public examples, current plan/contracts, release embargo, changed-file quality and source review passed. The form remains **runnable**: workflow owner, design and manual accessibility review, including actual browser zoom, remain pending before promotion to **workflow-verified**. These limits carry into the shared outputs.

Scope: only the changes needed to serve the form and Button loading slice in Knowledge build/record/schema/Markdown/search modules and tests, including `pageTextExtractor.ts`, `buildRegistryComponents.ts`, `buildRegistryDocs.ts`, `normalizeKnowledgeRecords.ts` and `buildKnowledgeV1.ts`; `examples/apps/operations-dashboard/src/workflows/record-form/recipe.json`; `scripts/checkPublicExamples.mjs`, affected example-schema/checker consumers including the current-product checks in `checkSaltDocsAuthoring.mjs`; explicit source/compiler and package publication inventories. Preserve existing record behavior outside this slice. No all-component/page rewrite or independent prose copy under a host-specific Skill is required.

Before adjacent schema changes, remove the unused catalog storage implementation in `packages/knowledge/src/records/knowledgeRecordSchema.ts`: `encodeCatalogRecordForStorage`, `decodeCatalogRecordFromStorage`, `encodeCatalogArtifactRecordsForStorage`, `parseCatalogArtifactEnvelope`, `createCatalogJsonSchema`, `CatalogStorageRecordResolver` and their exclusively used storage types/helpers/descriptor metadata. Recheck that they still have no callers; current writer and reader use logical object envelopes. Remove the uncalled `rehydrateTokenDeclaration` and `LegacyCatalogRecord` in the normalizer as well. Preserve logical Zod codecs, `parseCatalogRecord`, indexing, references and provenance. Make this a separate reviewable deletion and verify unchanged logical record/content results before intended content changes; compiler/bundle identity may change. Shared `scripts/build.mjs` and historical readers are not implicitly deleted by this cleanup.

1. Introduce the small typed document representation needed by the selected form guidance and Button loading section, using the existing remark/MDX parse infrastructure. Preserve their heading hierarchy, prose/list structure, code/language, links and explicit example references; include tables when the selected material uses them. Resolve an example's enclosing section without letting a nested “Best practices” heading erase its purpose. Use stable references for selected sections; no per-query extraction rules or conversion of unrelated pages.
2. Add projections only for authored presentation constructs required by this slice. Preserve a used callout's recommendation/rationale, a used diagram's meaningful description/asset reference, and the selected previews' actual example references. If a needed fragment is resolved, require a contained source path. Unknown constructs cannot silently erase mandatory pilot guidance: surface a diagnostic and withhold promotion until the author supplies a supported equivalent. Unconverted content keeps its existing contextual output with an explicit limitation; supporting its additional constructs is later demand-led work.
3. Keep MDX expressions and imported runtime code inert in the Knowledge path. Parse supported literal metadata; do not evaluate arbitrary source to obtain prose. Render untrusted text through the existing Markdown boundary. The trusted site build may render its existing authoring components, but a content request must not execute repository MDX or follow network references.
4. Establish the form's recipe artifact contract here, before generated-package consumers use it: stable recipe ID, source/content identity, exact tested support, manifest and individual public files/assets. Use an explicit bounded public-file inventory and the runnable setup's dependency declarations. Reuse existing import/asset/build checks to validate completeness and derive straightforward facts; independently reconstruct the export instead of building a general dependency-inference engine. Evolve the current example schema, generator and checker consumers together: `saltAuthoredExampleManifestV1.schema.json` and its checkers are fixed to 24 pattern entries and current pattern paths. Registering this form requires an explicit current-product contract transition while preserving immutable historical evidence and the existing patterns' behavior. Validate missing files, undeclared imports/assets/CSS, incompatible families, source containment, ambiguous readiness and absent acceptance evidence. Register only the selected sample-app files through an explicitly contained inventory extension; do not relax the existing public-example root check globally.
5. Include required public implementation files and minimal runnable setup. Export useful acceptance instructions or separate test material deliberately; do not copy private fixtures, maintainer harness internals or repository-only aliases into application code. Keep readiness evidence distinct from the editable example.
6. Replace the selected material's lossy delivery path with one reusable typed assembler. Button loading exposes its actual guidance and relevant public prop facts; the form exposes authored guidance, implementation/setup/state/adaptation/acceptance sections. Use those inputs for the selected page sections and local outputs, removing their superseded summary/snippet projection branch rather than retaining two implementations. Do not route complete workflows through the nested/global snippet reconciliation in `normalizeKnowledgeRecords.ts:1932`. Extending every component/page kind is not a first-preview requirement; preserve existing contextual output and its limitations elsewhere.
7. Generate readable Markdown and structured outputs from that representation. Preserve code whitespace, meaningful section order, canonical URLs and citations. Every returned reference must round-trip through docs. Presentation can differ by surface; the required meaning, support and referenced files must agree.
8. Make `context` select the smallest useful answer for the task: a prop fact, design choice, focused adaptation or complete workflow. Prioritize any necessary prerequisites, critical behavior and acceptance. A narrow question must not trigger a whole tutorial or repeat setup already established. Return explicit omissions and the next section/file reference when material cannot fit. Keep the default response within 16 KiB; never label a cut code fragment complete.

For source closure, add only the selected app's named source/metadata paths to `catalogSemanticInputPatterns.json`; do not ingest all repository examples indiscriminately. Changes to docs, examples or API facts should change semantic identity. Host adapter-only changes should not.

Verify in dependency order: run the pure fixture specs below and `yarn typecheck:ai-tooling`, then `yarn build:ai-tooling`, then `yarn vitest run packages/knowledge/src packages/cli/src/commands --maxWorkers=2` and `yarn validate:salt-ai:contracts`, and finally `yarn check:ai-tooling:pack -- --report dist/salt-ai-pack/plan-033.json`. The existing search/retrieval specs load `packages/knowledge/generated`, so rebuild the current candidate before relying on those integration results; a pass against stale predecessor output is insufficient. Tests must assert concrete form guidance and real files, cross-surface meaning, readiness downgrades, deterministic identity, source containment and bounded output. A human reviewer must be able to reconstruct the reference app from published material alone; automate that reconstruction in the existing packed fixture harness.

Specific new regressions: nested heading context for Button Loading without an explicit `displayName`, retained `loadingAnnouncement` guidance, code whitespace, link targets, explicit preview-to-file references, unsupported pilot MDX diagnostics and expressions remaining inert. Test tables/callouts only where used by the slice, and fragment containment if fragment resolution is introduced. Add the selected page-structure cases to a proposed `packages/knowledge/src/__tests__/pageTextExtractor.spec.ts`; there is no existing focused extractor spec. Reuse `writeFixtureRepo` in `buildRegistryComponents.spec.ts` and `createTempRepo` in `buildRegistryDocs.spec.ts`. Test a narrow Button question, form creation and existing-form adaptation against the same assembler, plus an unsupported request. Check that each gets useful, applicable evidence and that unconverted contextual records keep their declared limitations. These focused retrieval regressions belong to the first preview; the later 20-query holdout does not. Test semantic requirements directly; a snapshot of a giant serialized document is insufficient.

Focused existing command: `yarn vitest run packages/knowledge/src/__tests__/buildRegistryComponents.spec.ts packages/knowledge/src/__tests__/buildRegistryDocs.spec.ts packages/knowledge/src/__tests__/buildRegistryMarkdown.spec.ts packages/knowledge/src/__tests__/buildRegistryPatterns.spec.ts --maxWorkers=2`. After adding the new extractor spec, include its full path in this command. The current pattern fixture treats a `<Diagram>` tag as example code; if the shared change affects that path, correct its expectation so a diagram is not advertised as runnable React. This does not require a general diagram projection in the first slice. Existing tests reject legacy guide/export/enrichment frontmatter; define any new annotation narrowly and retain those rejections.

## Unit 033/02a — Serve the same example and prove it is affordable to maintain

Entry: the first form and canonical content assembly from Units 033/01–02. This unit completes the bounded form/Button consumer and author journey on the existing website before workflow expansion. Unrelated website or authoring improvements remain outside its completion criteria.

The first authorized consumer observations may begin through the working packaged/host route while this unit is in progress. Do not postpone that learning until every website or authoring improvement is finished. Complete this unit before expanding the corpus or claiming that its shared serving and maintenance journey are supported.

Scope: changes needed for the selected form page and Button loading section in `site/src/components/components/{LivePreview,fetchExample,patternSourceLoaders}.ts*`, their MDX, `scripts/{checkPublicExamples,checkPublicDocumentation,checkSaltDocsAuthoring,buildSaltAiWebArtifact,verifySaltAiWebArtifact}.mjs` and affected schemas, Knowledge publication inventories, sample-app export fixtures, and a proposed `test/browser/salt-workflow-preview.browser.test.tsx`. Extend the existing generated source-loader path for explicitly registered files; do not require runtime imports of arbitrary consumer paths. New generated artifacts remain under approved ignored build paths until an adopted release process selects publication destinations.

The reviewed implementation scope also includes a `WorkflowPreview` component and its styles/exports, selected hooks in `DetailPattern`/`DetailComponent`, `checkSaltSampleApps` helpers/tests and its current V2 receipt, the operations-dashboard Vite base URL, and `vitest.browser.config.mts` for serving the same local static files. Preserve the existing primitive MDX preview syntax. Source-derived workflow registrations stay in the existing public-example generator; the existing web builder emits a small development bootstrap after the current Knowledge bundle and packed application have passed verification. That bootstrap selects one immutable bundle's canonical guidance, recipe/files and compiled preview. It must not silently substitute current working-tree source into a differently labelled bundle. Preserve the tested compiled application bytes in an iframe using only the recipe's public setup; bind its exact file inventory in the current sample-app receipt. Extend the existing web receipt/route map rather than introducing a second recipe schema or registry service. Serve raw source as text/downloads, separately from the compiled preview entry.

The sole mutable development selector is `/ai/development/bootstrap.json`. It is non-publishable local output selecting exactly one Knowledge bundle digest and compiled-tree SHA-256, with immutable route/file descriptors. Preview URLs contain both digests. The web verifier admits only this named mutable selector alongside the existing beta pointer, verifies its bytes and selected identities, and rejects other mutable development/current routes.

Local author preview may add an opt-in `SALT_OFFLINE_AUTHOR_PREVIEW` path in the existing Mosaic and Next configuration, font modules, site package/TypeScript configuration and app entry. Use the already available Fontsource assets instead of fetching Google fonts, and local documentation instead of fetching release data; preserve the normal site's default behavior. Declare already-resolved font dependencies directly where required, with the corresponding workspace lock metadata. The existing site build, snapshot commands and browser tests may consume generated `site/public/ai` files, which must be ignored. Extend the current `checkSaltDocsAuthoring` entry and focused tests plus `docs/ai/contributing.md` for this selected author journey. This scope authorizes local builds and the same temporary sample-app npm fixtures as Unit 033/01; application/tool execution stays offline and read-only. No publication or deployment is authorized.

1. Consume the recipe artifact contract established in Unit 033/02. Reuse its identity, tested support, manifest and files for the website source view/downloads and local-tool/Markdown references; keep Button loading's guidance and example-file references consistent through those outputs too. Use the existing static serving path and verify the selected outputs' identity, extending the web artifact path only where the adopted preview scope needs it. There is no second recipe schema, hosted registry API or automatic installer.
2. Make the selected form page task-oriented while preserving access to its primitive reference and the existing Button preview. Show purpose, interactive states, design choices, prerequisites, a file list, setup and adaptation seams. Provide access to complete files and Markdown; a copyable context summary links to further detail instead of concatenating every source into one prompt. Change only the selected pages and shared rendering needed by them. Update the renderer and public-doc checker together if the preview-reference syntax changes; the checker currently requires the exact pattern `LivePreview` form. A person can inspect reference material without installing the CLI; project-bound tools separately verify the application's installed versions.
3. Render the workflow through its declared public setup. The outer site chrome can retain its providers, but verify an isolated preview/application with only the exported setup. Make loading/error/retry/success states inspectable through local deterministic fixtures. Avoid screenshot-only demonstrations of behavior.
4. Test that source view, exported files, Markdown and CLI resolve the same recipe and content identity. The downloadable files must reconstruct the independently tested app. Where the site uses a release bundle, it must not silently mix current-HEAD code into an older labelled preview. Maintain a clearly labelled current development preview separately.
5. Give authors a short documented path using existing generation, preview and affected checks. Derive repetitive facts and issue diagnostics naming the source file/section and correction needed. Extend existing commands only where necessary; specify and test new filtering options before advertising them. A custom authoring application is out of scope.
6. Have a maintainer who did not build the compiler make one realistic change to the pilot's behavior and explanatory guidance, regenerate, preview and validate it using only the author guide. Record elapsed active work, manually edited sources, repeated facts and friction in the ordinary review. The change must propagate to all four surfaces without manual edits to generated files or a second prose copy. The maintainer must be able to identify a deliberate missing-file or unsupported-content failure from the diagnostic. Fix duplication before expanding the corpus.

Verification combines the affected Knowledge/CLI tests, types/contracts, `yarn check:public-examples`, `yarn check:public-docs`, the revised sample-app reconstruction gate and the existing site build/preview path. The public-example check externalizes package dependencies; the public-doc check requires built packages and uses `npm pack --dry-run`. Neither replaces real installed-package acceptance. `yarn workspace @salt-ds/site build` is the existing site-build command; its normal generated prerequisites and local dependencies must be available in the activated unit. Reuse `yarn build:salt-ai-web` and `yarn verify:salt-ai-web` for local generated route/file integrity where their adopted current-product scope applies; these commands do not deploy.

A build alone does not prove a working preview. Place the proposed preview test under the existing `test/browser` include, then run `yarn vitest run --config vitest.browser.config.mts --browser.headless test/browser/salt-workflow-preview.browser.test.tsx` to verify named states, guidance and file references. The browser setup includes maintainer globals, so the separate packed sample-app reconstruction remains the proof of provider/setup completeness. Do not add a site-local test that the current config never discovers. The maintainer exercise separately verifies the actual site path and author instructions. Publication or deployment remains a separate release action.

The existing `check:salt-docs-authoring` script contains historical stage assumptions, reads built Knowledge and defaults to stage 06d, which requires `--require-web-route-map dist/salt-ai-web/route-map.json`. It is not a lightweight authoring linter. Reconcile its current-product entry through the adopted control update if used; do not mutate historical records or require a fresh receipt framework merely to validate a normal author edit. Document generation (`yarn examples:manifest`) separately from check-only commands and never call it a passing check by itself.

Local implementation verification on 2026-09-08 passed the complete Knowledge/CLI suite (58 files, 737 tests), the preview browser tests, 27 focused harness/authoring/site-configuration tests, types/contracts, public examples/docs, packed reconstruction and its deliberate negative, the offline website build, and current authoring freshness. The served Forms and Button pages were inspected, including the workflow's validation, pending, failure, retry and success states. The 1,063 generated routes and exact site copy passed verification; resealed preview MIME and bootstrap file-metadata mutations, plus copied-file corruption, were rejected before successful restoration checks. Ordinary site configuration rejects local preview files, and the development panels require the explicit offline-author mode.

The local candidate is bundle `sha256:2785ce4608eac1fd7fb597e4fa9b578310236242ca88239159560621b3835afd`; its sample-app receipt is `sha256:9384d6309fcc4232e972a1341ecd468d9f62ada4df867609d8077014ab1aaba3`. Knowledge contains 619 packed files, 3,692,465 compressed bytes and 25,264,052 unpacked bytes; CLI remains 13 files, 52,343 compressed bytes and 230,914 unpacked bytes. These are local correctness results, not a completed maintainer exercise or workflow promotion. Unit 033/02a remains in progress, with owner/design/manual accessibility review and the independent human maintainer exercise still pending; readiness remains runnable and nothing is published.

### User-directed application coverage within Unit 033/02a

The next local implementation iteration starts at `700da2d8ab15602633bd6779032376a0e7c8909d`. It remains in the current execution unit and replaces the narrow pilot recipe with `operations-dashboard.service-worklist`, a complete service-operations application recipe at `src/workflows/service-worklist/recipe.json`. Keep `RecordForm` as a reusable part of that application. The primary website route becomes `/salt/patterns/analytical-dashboard`; canonical navigation, content-status and forms guidance supply the related design and behavior sections, and Button loading remains a component-guidance regression. Change the unreleased descriptor, its readers, current tests and documentation together; do not retain a compatibility reader for the earlier recipe.

This scope authorizes the bounded dashboard application sources and recipe; the selected canonical pattern guidance; existing recipe/schema/assembler, explicit input inventories and public-example registration; existing web/bootstrap/site preview and author checks; and the packed sample-app and retrieval tests needed to prove the same application guidance and complete files on every surface. Preserve the existing context-budget contract, including truthful resolvable omissions when this larger guide cannot fit. It also covers the existing primitive chooser, composition pitfalls and `skills/salt-design-system/SKILL.md` with its existing managed-block integrity binding: teach a shared component-selection process that checks Salt coverage before using custom UI, and make the example follow it. Do not substitute a component-specific rule or a general source scanner for that process. Generalize the current selected-guidance path where those source references require it. Reuse one recipe and the current delivery pipeline; no additional registry, compiler, backend, router framework, installation service, dependency family or test framework is needed.

Acceptance must demonstrate meaningful navigation/current location; bounded filtering with distinct no-data and no-match states; record inspection and editing with retained draft and existing validation/pending/failure/retry/cancellation behavior; deterministic local worklist loading/failure/retry; and keyboard/focus, 320 CSS-pixel layout and theme behavior. The existing packed reconstruction must run these assertions against only the exported files, retain the form negative and add one deliberate worklist failure that the shared assertions reject. Task-language retrieval must expose applicable navigation/worklist/editing guidance and resolvable complete files, without query-specific ranking shortcuts. Run the affected product checks, required current-plan/contracts/quality checks and one closeout source review; repeat checks only for changed inputs or diagnosed failures.

This explicit user-directed local expansion supersedes the earlier requirement to wait for the maintainer exercise and 3–5 consumer observations before implementing these application capabilities. It does not waive those human acceptance requirements, promote any workflow beyond runnable, authorize consumer installation/contact/model trials, or grant release/publication/deployment authority. Further workflow families and the broader holdout study remain conditional backlog. Preserve the earlier candidate evidence as historical local results. Any commits in this iteration are unsigned at the user's request.

Local verification of the service-worklist iteration on 2026-09-08 passed all 739 Knowledge/CLI tests in 58 files, 41 focused harness/authoring/site-configuration tests, and both website preview browser tests. The application reconstructed from 17 exported files passed type/build, navigation, filtering, inspection/editing, retained draft, validation, pending/failure/retry/cancellation, keyboard/focus, axe, theme and 320 CSS-pixel layout checks against eight exact local Salt tarballs. Both the validation-removal and worklist-failure-removal variants were rejected. The packed application produced no runtime errors or external requests. Package/public-documentation checks passed; current authoring verification confirmed 1,068 staged routes and their exact local website copy. Shared guidance uses component selection before custom styling, and a context too small for the guide retains a truthful, resolvable omission. Closeout review corrections preserve each guidance section's source path and route, prevent refresh during initial loading, include the worklist stylesheet in the seven reusable files, and leave simulation controls optional and supplied by the demo host.

This local candidate is bundle `sha256:481a857e8a9125d24ef900aa93efedf8e9439ed17010e447a13f8bfb9fd0717b`; the sample-app receipt is `sha256:cabbd97b883a08e5fe6c783015cb0b5e4b5cb1d9814ed9e9d4b9c5cf3427471f`. Knowledge contains 624 packed files, 3,799,560 compressed bytes and 25,699,352 unpacked bytes; CLI remains 13 files, 52,343 compressed bytes and 230,914 unpacked bytes. These results establish local runnable coverage only. Owner/design/manual accessibility review, the independent maintainer exercise and actual consumer observations remain pending, and Unit 033/02a remains in progress. Nothing was published or deployed.

### User-directed Salt UI agent prototype and local comparison

On 2026-09-08 the user authorized a holistic Salt UI creator, a separate reviewer,
and a small comparison against an ordinary agent using the current guidance,
including delegation to less expensive models. This is bounded work within
Unit 033/02a. Add thin Copilot and Codex profiles with one shared workflow that
uses the existing installed Knowledge and public Salt APIs. The profiles do
not create another API corpus or depend on the unqualified Doctor product.
Keep the existing published support artifacts and candidate unchanged.

The exception to the model-trial boundary authorizes four local attempts: two
prepared Vite fixtures, each run once with ordinary current guidance and once
with the creator workflow. One task creates a saved-reports screen; the other
adds team invitations while preserving the starter's existing actions. Freeze
task briefs and acceptance before inspecting outputs. Use the same source,
installed cohort, model, reasoning effort, tools and time budget in each pair.
Fixture setup may obtain declared dependencies and install exact local Salt
tarballs in temporary evaluation directories. Only the host model connection
is online during attempts; application execution and Salt retrieval stay local.
Do not install in actual consumer projects or contact consumers.

Allow a small host-profile smoke check and one independent reviewer pass after
the four attempts. Record initial acceptance separately from any subsequent
repair. Compare public Salt reuse, working behavior, browser appearance,
corrections, elapsed time and available usage counts. Keep raw prompts,
transcripts and model-produced trial applications outside Git. Commit only
authored profiles, task fixtures/checks and an aggregate report with limitations.
Two task pairs cannot establish general model superiority, human design
acceptance or consumer value. An unavailable host is untested, not passed.

This prototype does not dispatch another unit, change workflow readiness or
authorize publication, versioning, deployment or consumer installation. Manual
promotion reviews and the independent maintainer exercise remain outstanding.

The local comparison completed four Terra attempts using the same candidate
bundle. Both conditions passed the two named automated checklists, but neither
reused Salt Card for the report summary. Independent review and later diagnostic
probes found additional layout and state-retention gaps; the prototype did not
demonstrate a creator-quality advantage. The [comparison report](../evals/salt-ai/ui-agent/RESULTS.md)
records the scope, timing, host limitations and unchanged initial outputs.
The shared `salt-ui` Skill and thin profiles remain experimental and outside the
published agent-support artifacts. Unit 033/02a remains in progress.

### User-directed usable local agent preview

After reviewing the prototype comparison, the user explicitly authorized
continuing to a usable native Salt AI preview: a substantial application creation
and an existing-application modification must complete creation, independent
review, repair and browser verification through the supported host entrypoint.
This continues Unit 033/02a from `bd9f302da9887278b7e149cf3408332f6a64fc5a`.
Preserve the original four attempts, their acceptance script and reported results.

Finish the existing shared Skill, thin host profiles and local setup guide. Use
native Copilot agent discovery and delegation where available; establish actual
host behavior before claiming support. This scope permits installing an official
host client in a task-owned local directory, using existing host authentication,
and running bounded local creation/review/repair sessions against prepared public
fixtures. It permits the declared fixture dependencies and exact local Salt
candidate packages. Model connections belong to the host; Salt retrieval and
application execution remain local. Do not change account subscriptions or use
actual consumer repositories. Report any host or account blocker specifically
and continue independent implementation work.

Reuse the existing task fixtures, application seams and browser checks. Add
clearly separate follow-up acceptance for repeated additive actions, retained
drafts across navigation, appropriate covered Salt reuse, and inspectable desktop
and narrow states. Extend creation into a coherent usable reports workspace;
preserve the existing project application while adding invitations. Exercise the
native creator/reviewer repair cycle, then independently check the resulting
applications. Do not promote a repaired result as an original comparison success.
Keep generated applications and raw host evidence outside Git, with repeatable
local setup, usable previews and a concise aggregate outcome in authored docs.

No new personas, orchestration service, installer product, broad content corpus,
or evaluation framework is needed. Fix observed delivery friction at its existing
owner. Run affected checks, current-plan/contracts/quality and source review, and
commit unsigned. Local preview completion does not waive human promotion reviews,
qualify Doctor, or authorize publication, deployment, consumer contact or release.

The local native preview completed on 8 September 2026. Copilot CLI 1.0.83 ran
the named creator/reviewer profiles on the reports and project-team fixtures.
Observed Salt reuse, validation and review-evidence defects were repaired; fresh
native reviews retrieved local records and viewed screenshots after source
edits stopped. Both saved preview copies passed independent types, production
builds and the unchanged initial plus separate follow-up browser checks. The
authored outcome and limits are in
`evals/salt-ai/ui-agent/FOLLOW_UP_RESULTS.md`. This is a supervised local delivery
result, not an unattended-quality or cost result; Unit 033/02a remains in progress
with its human promotion gates unchanged.

## Conditional Unit 033/03 — Expand workflows from observed need

Scope: adopt only a genuinely additional workflow or modification case justified by observed need, extending canonical examples/docs and the same schema/assembler/harness. Navigation, the operational worklist and record editing now belong to the single service-worklist journey in Unit 033/02a; do not reimplement them as separate workflow families merely to complete this backlog. Reuse that workflow's preview and fixture setup. Create a separate integration fixture only when it proves a distinct supported environment, as the existing Next App Router fixture does. Reuse selected public material from the operations dashboard without importing repository-only source into consumer output.

Entry: Units 033/01–02a have produced the same useful pilot material for humans and agents, including the maintainer update exercise. Review 3–5 authorized first-workflow uses under Plan 034/02a, including a successful existing-application integration, then have the product owner record whether the observed needs and maintenance cost justify the next selected workflow. No full website overhaul or broad study is needed for this decision. Fix material content/activation friction before adding breadth; if access is unavailable, continue independent correctness work and leave expansion pending. Existing-app integration already belongs to Unit 033/01; the later modification case below extends that coverage only when justified.

| Workflow                     | Required behavior                                                                                                                                    | Explicit boundary                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Additional worklist behavior | Adopt only behavior beyond the bounded filtering, inspection and editing covered by Unit 033/02a, with a concrete observed task and acceptance case  | Grid editing, virtualization and new data libraries require their own justified scope                     |
| Additional navigation case   | Adopt only a distinct navigation or routing environment that the current application shell does not cover                                            | Preserve the application's routing choice; do not introduce a router framework merely for another example |
| Existing-screen modification | Add a state or action to a prepared working screen while preserving routing, data wiring, meaningful domain wrappers, and existing acceptance checks | This is an acceptance task variant, not another application or a mandate to rewrite consumer code         |

Every workflow must have applicable state coverage, complete files/setup, independent checks, and design/accessibility review. Default to an appropriate accessible density. High density must not be used to claim automatic accessibility; disclose its implications and preserve information and functionality across choices. Do not infer accessibility certification from axe.

Register realistic operating limits. For the worklist, exercise empty, one-record and representative-many states, long labels/content, and delayed/reordered results where the data seam is asynchronous. For navigation and forms, exercise relevant narrow layouts, long content and cancellation. Use a compact set of meaningful cases; a small demo is not evidence of unlimited scale, localization or advanced grid support. Disclose those boundaries without building new data-fetching, internationalization or virtualization frameworks.

Verify each workflow and its separately reconstructed export through the extended `yarn check:salt-sample-apps -- --app operations-dashboard` command, plus Knowledge/CLI tests, types, contracts and pack checks. The harness must report the named workflow coverage, so one successful page cannot mask an unexecuted recipe. The modification fixture must retain existing checks and pass a negative case that deletes previously working behavior. Keep reference examples separate from the later held-out consumer tasks.

## Conditional Unit 033/04 — Broaden retrieval when the supported tasks expand

Entry: observed retrieval failures or an adopted workflow expansion justify broader ranking work. The focused form/Button retrieval checks in Unit 033/02 are sufficient for the initial preview. This backlog does not require three workflows to be built merely to populate an evaluation set.

Scope: `packages/knowledge/src/search/`, typed search signals in the builder, `evals/salt-ai/retrieval/`, relevant validation/tests. No vector database or model reranker.

1. Preserve existing exact-ID/name and recall@5 regressions.
2. Add task-language development cases for the actually supported workflows and observed choice/configure/modify requests. Include absent capabilities and ambiguous requests. Identify required evidence targets as well as acceptable primary results.
3. Improve general query coverage and typed signals from props, states and workflow intent for the newly observed misses. Preserve the first-preview Button/form fixes; do not add per-query hardcoded ranking rules.
4. If all three candidate workflow families are later supported and a broader retrieval decision is needed, the proposed study is a separate 20-query holdout, with at least four queries per workflow and the remainder covering modification, ambiguity, unsupported versions and no useful answer. Register it before inspecting scored outputs; a reviewer who did not tune ranking owns the labels. If the supported scope is smaller, specify a proportionate evaluation for that scope instead of adding workflows to meet this template.
5. For that later 20-query study, proposed targets are at least 16/20 useful first results and at least 90% necessary evidence coverage; report counts by category and reciprocal rank for diagnosis. These are conditional expansion targets, not initial-preview completion gates. An unsupported query is correct only when the response honestly identifies the limitation rather than producing a plausible unrelated result.

Verify: extend `packages/knowledge/src/search/retrievalGold.spec.ts` or a sibling focused spec, run `yarn vitest run packages/knowledge/src/search --maxWorkers=2`, and run `yarn eval:salt-ai:validate`. Development tests are ordinary regression gates. A holdout failure prompts diagnosis and a future fresh holdout after material tuning; do not relabel misses to pass. Runtime and output budgets remain blocking.

## Initial-preview completion, maintenance and limits

- The service-worklist application, including its reusable record form, is reconstructed from its packaged material and passes independent build, behavior, accessibility and design acceptance.
- Its integration into a prepared existing application preserves prior behavior, routing/data seams, meaningful wrappers and tests.
- The application workflow and Button loading slice have consistent canonical guidance and file references across the existing website preview, portable files, Markdown and local tools; source identity and support boundaries agree.
- The application's exported setup works independently of website providers, and navigation, worklist and form states remain inspectable through the existing website preview.
- An uninvolved maintainer can make and verify a canonical update without maintaining duplicate prose or generated facts by hand.
- No contextual snippet is promoted through metadata alone; unconverted content retains its existing contextual output with explicit limitations.
- Focused Button/navigation/worklist/editing retrieval checks return useful evidence, unsupported requests are disclosed honestly, and version, integrity and output bounds hold.
- Source/package/contract checks and the actual installed consumer path pass.
- The supported workflow has a real owner and a review trigger for changes to its dependencies, APIs, tokens, states or accessibility behavior.

Units 033/03–04 are conditional backlog, not initial-preview done criteria. After 3–5 observed first-workflow uses and the maintainer exercise, select the next change from demonstrated consumer or authoring need. Any later promoted workflow must meet the same reconstruction, independent acceptance, ownership and cross-surface consistency bar; identify development versus held-out evidence if a broader retrieval study is adopted.

Stop a workflow's promotion when canonical Salt behavior contradicts its requirements or cannot satisfy mandatory acceptance. Record a Salt component/docs issue with a minimal reproduction; fix that authoritative layer through a separately scoped change instead of inventing workaround instructions. Do not expand to more workflows merely to improve aggregate coverage. Do not publish or contact consumers through this plan alone.

References for design review: [WCAG quick reference](https://www.w3.org/WAI/WCAG22/quickref/) and [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/). Use the relevant criteria and patterns to author checks; automated tools cover only part of the review.
