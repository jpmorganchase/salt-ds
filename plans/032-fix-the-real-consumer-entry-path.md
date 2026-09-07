# Plan 032: Make the real consumer entry path work

## Status and execution boundary

- Status: IN PROGRESS — Unit 032/01. Product implementation follows the checked and reviewed M0 adoption.
- Priority: P0 foundation for the proposed product roadmap.
- Effort: 5–8 engineering days, split into the units below.
- Risk: MED, concentrated in project selection and discovery.
- Planned at: `e55fa54e215503b4a0e521e2f5ee054b9f0068ce`, 2026-09-06.
- Revised: 2026-09-07 after review of the existing code: small adoption checks, removal of obsolete helper/default paths, and metadata-only core selection.
- Depends on: the reviewed product adoption recorded by this plan and its current control.
- Branch convention: `codex/032-<unit>`, conventional commit messages.

The user has authorized implementing the consumer-focused product roadmap. This adoption supersedes unfinished Plan 006 / Unit 006/00 at `e55fa54e215503b4a0e521e2f5ee054b9f0068ce`. Its plan, control, validator and recorded evidence remain immutable historical state; no runtime PASS, retirement result or completion is inferred. Plan 005 remains terminal at `CUT_DOCTOR`. Doctor is technically unqualified and selected for retirement from the first product under a later bounded unit; this plan preserves its current implementation until that migration. Adoption must pass the simplified consistency checks and review before product work; editing this document/control does not establish implementation completion.

Only the unit named by `plans/evidence/032/control.json` and the Active dispatch in `plans/README.md` may execute. Record its scope and actual starting checkpoint before implementation. Use ordinary reviewed commits within that unit; completion records the actual implementation commit and relevant checks before selecting the next unit. There is no prescribed number, adjacency or alternation of implementation and control commits. Never guess a future commit hash.

This plan authorizes local implementation, builds, tests, code review and package-manager setup only inside the named temporary packed-consumer fixtures required by the active unit. Fixture setup may obtain its explicitly declared dependencies; invoked Salt tooling must remain offline and read-only. It does not authorize installing in actual consumer repositories, consumer contact, product model trials, publishing, version materialization, dist-tags, deployment or changes to immutable predecessor evidence. The old Plan 006 manual CI path must reject a checkout containing this successor control before dependency/artifact preparation.

GitHub Copilot with npm is the first consumer route, as selected by the user. The AI platform is unreleased and has no backwards-compatibility obligation. Rewrite its implementation and change interfaces, schemas, flags, package boundaries and output shapes when that yields the simpler first product; update current callers/tests/docs together. Do not add migration shims, deprecated aliases, dual runtime formats or prototype-parity requirements. Suggested reuse is an engineering choice, not a restriction on replacement. Salt UI versions still require truthful installed evidence, and local read-only behavior and package integrity remain requirements. Preserved historical evidence does not require old product behavior in the current runtime.

The first product after these fixes is one verified form with existing-app adaptation, Button loading guidance, shared website/Markdown/file/local-tool output, affordable authoring and a Copilot/npm journey. The existing code is selectively rebuilt: preserve verified source/reader/project foundations, replace content/loading boundaries, remove unused implementations, and retire the current public Doctor under the later bounded runtime unit before supported preview distribution. Use independent acceptance and 3–5 combined discovery/use observations to refine the preview. Broader workflows, compiler support, retrieval studies and adapters remain conditional. Completing this foundation plan alone does not complete the product or authorize release.

Run `git diff --stat e55fa54e215503b4a0e521e2f5ee054b9f0068ce..HEAD -- packages/knowledge/src packages/cli/src scripts/consumer-smoke scripts/consumerRepoSmoke.mjs evals/salt-ai docs/ai` before execution. Reconcile changed symbols with the excerpts below. Ordinary drift requires revising the affected unit, not assuming the plan still describes live code.

## M0 — Adopt one direction with lightweight controls

Replace the uncommitted lifecycle validator with a small current-state consistency check before adopting this plan. Keep its existing package command, plan/control identity, and historical evidence checks. Remove exact commit-sequence rules, permanent immutability of the unfinished plan, lifecycle phases and the proposed amendment protocol. This supersedes the earlier amendment design; do not implement those extra phases.

The adoption scope remains `AGENTS.md`, `package.json`, `plans/README.md`, this plan, `plans/evidence/032/control.json`, `scripts/validateSaltAiPlan032.mjs` and its tests, current contributor/ADR guidance, and the existing workflow's obsolete Plan 006 guard. Preserve the historical Plan 006 validator and evidence unchanged. The real `--journey` CI invocation belongs with Unit 032/01, when that option exists.

The simplified check validates the current plan digest, README/control agreement, exactly one active unit until completion, ordered unit statuses, real ancestor commit references and unchanged historical evidence. It must reject malformed records, invented commit references and altered predecessor files. It must allow ordinary multiple implementation commits and reviewed revisions to unfinished plan details. It does not attempt to prove review approval, product correctness or authorization from a boolean, commit shape or receipt.

Use the existing control fields; update the plan digest whenever the plan changes. Review the active unit's scope, changed files and verification through the normal diff/review process. Record completion and the next actual checkpoint truthfully. Revise unfinished scope and checks through an ordinary reviewed plan edit before the affected work proceeds; include the reason in the change description. Preserve completed requirements and evidence. Work requiring a different product or release boundary still needs an explicit scope decision. No custom amendment phases, checkpoint-only commit choreography or new receipt framework is needed.

Required adoption proof: focused tests for those current-state invariants; the preserved Plan 006 validator tests; `yarn validate:salt-ai:plan-032`; contracts, tracker, changed-file quality and ordinary code review. Product implementation starts after this small adoption change is reviewed and recorded.

## Intended result

A consumer installs the exact CLI in the application or workspace where it will be used, selects an application, retrieves a useful document, follows its citation, and receives correct bounded output. Tests exercise that same arrangement. Unsupported versions and unsupported repository constructs remain explicit.

## Current state and conventions

`packages/knowledge/src/project/saltInstallation.ts:645` collects dependencies and devDependencies matching the entire `@salt-ds/` namespace. `packages/knowledge/src/project/decideSaltProject.ts:130` then does:

```ts
if ([...evidenceNames].some((name) => !compatibilityByName.has(name))) {
  return decision(
    "unsupported",
    "SALT_PROJECT_PACKAGE_FAMILY_UNKNOWN",
    installedPackageVector,
  );
}
```

The manifest describes 13 UI families, excluding CLI and Knowledge. Adding the documented CLI devDependency therefore makes an exact-current application unsupported. A tooling-only monorepo root also becomes unsupported and overrides selected children in `packages/cli/src/commands/doctor.ts:176`.

`scripts/consumerRepoSmoke.mjs:21` installs tools under `installed-tools` and inspects another app. Its fixture in `scripts/consumer-smoke/fixture.mjs:500` contains only Core and Theme, so it misses the installation defect.

The document resolver has this precedence at `packages/knowledge/src/markdown/resolveKnowledgeDocument.ts:85`:

```ts
function contentReference(record: any) {
  const candidate = record?.detail_content_ref ?? record?.body_content_ref;
```

Pages have both references; their metadata hides their body. Search returns canonical citation keys which the resolver does not parse. Context assembly in `packages/knowledge/src/search/searchSalt.ts:563` computes the digest before dropping its last match and copies an unrestricted query into the supposedly bounded envelope.

Use existing typed errors and deterministic results. Match table-driven Vitest cases in `packages/knowledge/src/project/__tests__/decideSaltProject.spec.ts`; use `packages/knowledge/src/search/searchSalt.spec.ts` for retrieval fixtures and `packages/cli/src/__tests__/cli.spec.ts` for CLI dispatch/IO. Do not assert only truthy content or snapshot entire large payloads.

## Verification commands

These commands exist at the baseline except the proposed `--journey` smoke mode added by Unit 032/01. Unit-specific tests added below must be included by these directory filters. Build and packed-install commands are for the active unit and its explicitly scoped fixture setup.

| Purpose                   | Command                                                                                                                            | Success                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Selector and discovery    | `yarn vitest run packages/knowledge/src/project packages/cli/src/discovery packages/cli/src/commands --maxWorkers=2`               | All pass, including new real-arrangement regressions     |
| Retrieval                 | `yarn vitest run packages/knowledge/src/search packages/knowledge/src/markdown packages/cli/src/commands --maxWorkers=2`           | All pass; bodies/citations/budgets independently checked |
| Evaluation definitions    | `yarn eval:salt-ai:validate`                                                                                                       | Exit 0; intentional mismatch cases explicitly classified |
| Types                     | `yarn typecheck:ai-tooling`                                                                                                        | Exit 0                                                   |
| Full tooling checks       | `yarn test:ai-tooling`                                                                                                             | Exit 0                                                   |
| Build                     | `yarn workspace @salt-ds/styles build && yarn workspace @salt-ds/icons exec node ../../scripts/build.mjs && yarn build:ai-tooling` | Exit 0                                                   |
| Pack                      | `yarn check:ai-tooling:pack -- --report dist/salt-ai-pack/plan-032.json`                                                           | Exact CLI/Knowledge candidate report                     |
| Same-project packed proof | `yarn smoke:consumer --journey --skip-build --pack-report dist/salt-ai-pack/plan-032.json`                                         | Exit 0, after the fixture correction below               |
| Contracts                 | `yarn validate:salt-ai:contracts`                                                                                                  | Exit 0                                                   |
| Changed quality           | `yarn check:changed-quality -- --base <recorded-unit-start-sha>`                                                                   | Exit 0                                                   |
| Patch hygiene             | `git diff --check`                                                                                                                 | No output                                                |

After M0 simplifies the checker, use `yarn validate:salt-ai:plan-032` for the current worktree and recorded control; there are no lifecycle phases. Before review also run the active unit’s relevant product tests, contracts and changed-file quality. The preserved baseline passed the historical Plan 006 post-commit check; its validator remains historical after supersession.

## Unit 032/01 — Separate tooling identity from UI compatibility

Scope: `packages/knowledge/src/project/` and its tests; `packages/knowledge/src/public.ts` only if needed to share the classifier; `packages/cli/src/discovery/` and its tests; `packages/cli/src/commands/__tests__/doctor.spec.ts`; `scripts/consumer-smoke/`; `scripts/consumerRepoSmoke.mjs`; `.github/workflows/test.yml` only to make the journey the existing core consumer-smoke job's gate; root `package.json` and `yarn.lock` only for removal of the unused MCP client dependency after its caller cleanup. Doctor's existing aggregate precedence is correct and is not changed by this unit.

1. Classify UI evidence separately from exactly `@salt-ds/cli` and `@salt-ds/knowledge`. Preserve every other valid Salt namespace dependency as UI/unknown-family evidence. Preserve running tool identities in existing output fields. Apply classification before declaration normalization, duplicate/version-health computation, resolution and workspace checks, and defensively to declared/resolved selector evidence.
2. Treat a tooling-only root as having no Salt UI packages. Use the classifier in discovery too. Preserve existing selected-child outcome and unsupported/incomplete-child precedence. A hoisted root CLI must not create a false missing-UI-declaration issue in a child.
3. Retain rejection of unknown Salt UI families, incomplete package evidence, incompatible Core, and unsupported layouts. Do not add CLI or Knowledge to the component compatibility matrix.
4. Install CLI and actual UI packages into the same npm fixture app. Add a workspace-root CLI and child app case. Derive expected UI versions from installed metadata and the selected cohort; fabricated installed manifests cannot stand in for this proof. Keep the separate-tools fixture only for distinct coverage.
5. Ensure the observed installed versions come from actual package metadata, not a test-injected current vector.
6. Replace the normal Node 22 and Node 24 consumer CI job's default smoke invocations with `--journey`, using their existing exact pack report. That job must gate core consumer correctness without also requiring Doctor performance qualification. Preserve the applicable existing installed-package, alias/argument/exit, terminal/output-safety, identity, offline/read-only and exposed-command correctness checks by reusing or factoring their helpers into the journey. Keep the historical Doctor harness, command, thresholds and recorded failures intact for separately adopted qualification; do not run that failed qualification as a second mandatory core-CI step or label it passed through `continue-on-error`. No new qualification job is needed now. Implement the option and retained checks before wiring it in this same unit. Verify that broken same-project/tooling-root behavior or a retained safety/identity check fails the journey with a nonzero exit, and inspect both Node invocations.
7. Remove the omitted-MCP helper island from the current CLI smoke path. `fixture.mjs:9` eagerly imports `@modelcontextprotocol/client`, although the entry point runs only CLI coverage. Recheck and remove uncalled `mcp-checks.mjs`, `installed-mcp-module-probe.mjs`, MCP-only fixture exports and shared fingerprint/bin helpers, then remove the root SDK declaration and unused lockfile entries. Preserve isolated package setup, actual CLI installs, exact pack reports, command/path safety and offline helpers. Only remove dependencies whose current callers are gone; no unrelated upgrades or new adapter. Lockfile maintenance for this removal is within scope.

Required regressions: Core alone; Core plus CLI; Core plus Knowledge; both tools; missing or `file:` tooling declarations without hiding missing Core; duplicate tooling declarations; tooling-only root plus selected hoisted child; tooling-only repository; unknown family; mismatched UI version; incomplete UI installation. Exercise installed `info`, `docs`, `context`, and Doctor while exposed. This correctness fixture does not establish a Doctor performance or product-value result.

The focused `--journey` mode exercises local installation and retrieval plus Doctor's repository selection while exposed, with independent offline/read-only assertions and the applicable existing core smoke guarantees. Preserve the default historical packed Doctor performance harness and its frozen thresholds as separate qualification machinery, outside core-journey CI eligibility. Give the journey its own receipt identity so a correctness pass cannot be consumed as Doctor performance evidence. Explicit selected-workspace retrieval flags remain Unit 032/04 work; this unit proves hoisted-child selection through the existing repository Doctor interface.

The actual npm setup found that published Core 1.70.0 requires Icons 1.18.2 and Styles 0.4.0, which are absent from the registry. Build and pack those two real source packages at the installed Knowledge cohort's exact versions for the temporary fixtures; record their local artifact hashes and use explicit npm overrides. Core and Theme remain actual registry installs. Declare the fixture's React/ReactDOM 18.3.1 dependencies and use shared override rules for those versions and their existing loose-envify 1.4.0 dependency so npm can validate the shared peer graph. Keep strict dependency-tree validation and offline lockfile replay. This is local prerelease installation evidence; a registry-only install remains unverified until the missing UI artifacts are available. Do not change expected Salt versions, synthesize installed package manifests, or infer publication readiness from this fixture.

Verify: selector/discovery tests, types, contracts, then exact build/pack and same-project packed proof. Inspect the workflow commands and run the same journey locally on available supported Node versions; record any OS/Node evidence still pending the actual CI run. Success requires output and exit codes matching the supported journey, no runtime network, and no consumer-tree mutation during tool invocation. Do not call local evidence a completed CI run.

## Unit 032/02 — Repair document and context contracts

Scope: `packages/knowledge/src/markdown/resolveKnowledgeDocument.ts`, `packages/knowledge/src/search/searchSalt.ts`, their tests, and CLI retrieval tests. Do not redesign ranking or author new recipes in this unit.

1. Choose primary content by record kind: pages use their body, component detail remains component detail. Model the supported reference shape explicitly instead of expanding generic `any` handling.
2. Accept strictly parsed canonical `record:<family>:<id>` keys before existing bare-ID/name resolution. Preserve ambiguity handling and compatibility checks. Every returned search reference must round-trip to the same record.
3. Select the context contents first; compute digest and truncation from the final immutable selection. A removed last match must be disclosed.
4. Bound the query and fixed envelope. Prefer rejecting a query that cannot fit the supported response contract with a concise usage error; never silently exceed the cap. Define the digest input independently of its own digest and byte-count fields. Compute `utf8_bytes` for the complete JSON value, excluding only a documented CLI framing newline; ensure the emitted payload and framing fit the default 16 KiB transport budget.
5. Update callers/renderers for deliberately changed unreleased contracts. Do not raise the budget to hide assembly bugs.

Required regressions: actual Button usage body text; canonical citation round-trip; ambiguous title unchanged; unsupported family unchanged; zero-result context; removal of the last match; minimum supported budget; long query; multibyte text; final serialization size; independently reconstructed digest; hostile Markdown remaining inert. Tests must reconstruct expected digests independently rather than reusing the implementation's finalizer.

Verify: retrieval tests, types, contracts, full tooling checks. Repeat packed proof after the final combined candidate, not after every small edit.

## Unit 032/03 — Bind fixture vectors and correct current contributor entry points

Scope: `evals/salt-ai/scripts/validate.mjs`, focused tests, current fixture/case definitions and manifests, `scripts/validateSaltAiContracts.mjs` and focused validation tests, `docs/ai/contributing.md`, `docs/ai/evaluation.md`, relevant `package.json` scripts, and `.github/workflows/test.yml` only for explicit current product/contract/plan/embargo verification after decoupling historical replay. The generic active-dispatch pointer in `AGENTS.md` is established by M0; any further change needs an ordinary reviewed scope revision before implementation. Preserve historical evidence and reader implementations unless an expressly reviewed caller migration requires a change.

1. Add a validation rule relating each case's declared package vector to its materialized fixture manifest. Derive ordinary cases from one source. Give deliberate mismatch cases an explicit expected mismatch; do not globally disable equality.
2. Add negative tests for the current retrieval Core/Lab and Core/Theme disagreement. Rebind affected new fixture identities without rewriting terminal historical evidence.
   The existing validator compares every checked-in baseline's manifest/fixture digests to the current corpus. Separate these checks deliberately: validate the preserved baseline against its own frozen inputs and identities, and validate the new current corpus against its corrected fixtures. Reuse the existing historical identity/commit evidence with contained paths; do not rewrite the historical report or globally enable `allowStaleBaselines`. Negative tests must catch a changed historical input and a current case/fixture mismatch independently. Both `eval:salt-ai:validate` and the caller in the contracts check must use this distinction.
3. Rename or label metadata-only checks as metadata validation. Clearly distinguish actual retrieval/Doctor regressions from future model/consumer outcome trials.
4. Reconcile active case counts and label legacy outcome denominators as historical. Retire generic commands that imply the omitted MCP experiment is the current product evaluation path.
5. Document the single current-state check and distinguish it from historical phase-based commands. Preserve historical plan/control files as evidence.
6. Separate current product verification from automatic historical replay. `test:ai-tooling` currently appends `test:salt-ai-governance`, which replays Plan 001 acquisition through `validateSaltAiGovernanceReceipts.mjs`. Remove that automatic append; retain an explicit historical command for audit or changes to those readers. Ensure normal CI still runs current product tests, contracts, the simplified active-plan check and release embargo. Within the existing contracts/evaluation validators, keep current schema/identity/applicability checks separate from fixed historical requirements such as migration status "planned in Unit 00b" and old pair counts. Preserve historical rejection tests and frozen inputs; do not suppress them globally.
7. Remove generic `eval:salt-ai:run` and `eval:salt-ai:gate` aliases that still invoke the omitted MCP experiment. Do not add an outcome runner as their replacement. Preserve historical report readers; if relabelling `eval:salt-ai:report`, update its exact-name check in `validateRootScripts` and docs together. Current metadata validation remains explicit and truthful.

Verify: `yarn eval:salt-ai:validate`, focused validator tests added in the same script area, contracts, changed quality and active control validation. Known mismatches must fail a negative test; corrected ordinary cases must pass. Current contributor docs must describe the actual dispatch and available checks.

## Unit 032/04 — Select the application through bounded package metadata

Scope: `packages/cli/src/cli.ts`, `packages/cli/src/commands/{info,docs,context,retrievalRuntime}.ts`, relevant Knowledge project-facts/package/workspace metadata readers, focused selection tests, and packed consumer fixtures. Reuse the existing bounded metadata/containment helpers. Full source discovery, analyzer rules and scanner configuration are not prerequisites for core guidance.

1. Define one explicit selection shape containing repository authority and the application workspace within it. Proposed CLI flags are `--root <repo>` and `--project <relative-workspace>` on project-bound commands; these are future flags, not available today. Avoid ambiguous automatic selection when multiple apps exist. Doctor retains its existing aggregate behavior only until its separate retirement; do not use it to obtain core project selection.
2. Pass authority and selected project consistently to inspection and retrieval. Support contained hoisted dependencies for the package-manager/layout pairs selected for beta. Do not execute `.pnp.cjs`, repository JS config, or package-manager commands to obtain facts.
3. Preserve explicit current-version behavior in this unit. A separate reference-mode decision belongs to the delivery plan; no historical fallback is introduced here.
4. Keep selection data-only: read only the necessary package/workspace metadata and installed package evidence within the chosen authority. Do not route `info/docs/context` through Doctor's full source traversal. Preserve bounded file reads and existing failure/timeout disclosure; added workspace enumeration must have explicit limits and an operation deadline rather than unbounded traversal.
5. The earlier scanner-specific Git-ignore and full-source-walk deadline hardening is removed from this core unit. The selected product retires that exposed analyzer path in 035/03 before supported preview distribution. Keep its current tests/limits while the implementation still exists, but do not invest in another scanner framework or optimize Doctor here. Any future source-scanning feature must explicitly resolve these known ignore/deadline gaps under its own scope before promotion.

Required regressions: selected hoisted app; root without UI packages; two apps requiring explicit selection; out-of-root selection; contained and escaping symlinks; bounded/malformed/changing metadata; any added workspace enumeration deadline; ordinary results remain deterministic. Verify that core retrieval does not read application source files or execute repository configuration. Preserve existing shared containment and file-identity tests.

Verify: selector/discovery and CLI tests, types, full tooling checks, exact build/pack and same-project smoke on the chosen supported managers. Retain Node 22/24 and Windows/Linux package checks already required by the release process. Do not claim an untested manager supported.

## Done criteria and boundaries

- [ ] All four units have the stated regression coverage and passing relevant commands.
- [ ] The intended local-devDependency installation and workspace arrangement succeed through the packed binary.
- [ ] Normal Node 22/24 consumer CI invokes the real installation journey with the same candidate pack report and separate correctness receipt.
- [ ] Core CI retains applicable smoke correctness/safety guarantees and does not require the separate, unqualified Doctor performance result.
- [ ] Canonical search references resolve, page content is useful, and final context bytes/digest agree.
- [ ] Unsupported UI evidence cannot be converted into clean analysis by filtering tooling.
- [ ] Core selection uses bounded package metadata without source traversal; authority boundaries hold and runtime remains read-only/offline.
- [ ] Omitted MCP helpers/dependency and obsolete generic evaluation defaults are removed; current checks remain explicit and historical evidence is preserved.
- [ ] Current evaluation definitions match their fixtures, with explicit intentional exceptions.
- [ ] No generated bundle, tarball, private repository, prompt/output, credential, or absolute local path enters Git.

Stop the affected unit if its success would require weakening integrity, fabricating compatibility, touching unactivated Plan 006 controls, or changing a different product surface. Correct ordinary defects within the unit; a failed experiment is not permission to adjust its expected outcome. Missing consumer access does not block the independent local regression work.

Maintenance: every new Salt tooling package must declare its classification; every new retrieval record kind needs content assembly and citation round-trip coverage; every supported manager needs the same physical installation fixture used in the public setup guide. Subsequent recipes and runtime refactors must retain these checks.
