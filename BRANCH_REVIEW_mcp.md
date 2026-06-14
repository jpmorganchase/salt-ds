# Salt-DS AI Foundation — Branch Review (`mcp`)

> Review date: 13 June 2026 · Revised: 14 June 2026 (LOC estimates recalibrated, security fixes verified)
> Branch: `mcp` (vs `main`)
> Scope: 673 files, +172k / −1k lines, 50+ commits
> Reviewer perspective: code-level audit (READMEs and roadmap docs deliberately ignored)

> **14 June revision note** — The original 13 June draft claimed 6,000–8,000 LOC could be deleted or consolidated. Hands-on investigation showed that figure conflated three different operations (delete vs. split vs. cross-package extract) and rested on two specific wrong premises: (a) 34 hand-written JSON Schemas were said to duplicate Zod sources — only 1 of 34 actually has a Zod twin; (b) skills markdown was said to repeat "Hard Gate / Action Loop / No Salt Invention" 4–6× across files — phrase counts show those live almost entirely in `core.md` (the always-loaded file), with single mentions in the router and host-default prompt (progressive disclosure, not duplication). Only true deletion shrinks the repo; splitting `toolDefinitions.ts` or extracting `saltInstallation.ts` redistributes LOC without removing it. Verified figures are now used throughout. Security ship-critical items #1 (SSRF), #2 (NDJSON cap), #3 (conventions-pack code-execution disclosure), and #4 (path-traversal guard on `verifyAttestation`) are now fixed in-tree. Ship-critical #5 partially closed: 2 of 5 quarantined tests fixed in-tree (`contextCoverageProduction` test snapshot updated to acknowledge the new `SaltProviderNext` registry entity; MCP `upgrade_salt_ui` now defaults `include_deprecations: false` to match the CLI, eliminating the spurious confidence-level drift the parity spec was catching). 3 remaining failures (1 theme data drift owned by the theme team, 2 MDX-extraction bugs owned by the registry team) are documented out-of-scope for the AI-packages branch.

---

## TL;DR

**You have shipped a genuinely substantial product, not vaporware.** ~930 of ~947 tests pass, the publish boundary is enforced by a guard spec, the MCP protocol is used correctly, and the architecture is internally coherent. The five new packages add ~70k lines of TypeScript that implement: lexical (BM25-style) retrieval, AST-based validation, an evidence-traceable workflow contract, a layered policy engine, Playwright-backed runtime evidence, and a deterministic eval harness.

**It is, however, materially over-built for the market it competes in.** Realistic deletion budget is **~1,000–1,500 lines (~1–2%) without structural changes**. The original 13 June draft also claimed an additional 3–5k LOC was available via (a) collapsing the 34 hand-written JSON Schemas against Zod and (b) deduplicating skills markdown via includes — 14 June audits showed **both claims were wrong**: only 1 of 34 JSON Schemas has a Zod twin (the others are backed by TS interfaces, so there's no current duplication to collapse), and the skills markdown phrases the review called out as "4–6× repeated" actually live almost entirely in `core.md` (the always-loaded file) with single mentions in the router and host-default prompt — deliberate progressive disclosure, not duplication. The remainder of the original 6–8k estimate was *redistribution* (splitting god-files, extracting packages) which improves maintainability without changing total LOC. The "AI foundation for teams" positioning is two products in one trench coat: a *Design System Governance Engine* (genuinely novel — the policy + attestation work is the moat) wearing a *Code Generator* costume (where v0 / Magic Patterns / shadcn already dominate and salt-ds is structurally behind). The biggest single risk to "gold standard" credibility is not bugs — it's **scope sprawl** that no five-person team can maintain.

---

## 1. What's actually in the branch (facts)

| Package | LOC | Purpose | Test pass rate |
|---|---|---|---|
| `@salt-ds/mcp` | ~24k TS (incl. 14k tests) | MCP server, 14 tools, 17 resources | 454/467 pass, 4 fail, 9 skip |
| `@salt-ds/cli` | ~17k TS (incl. 10k tests) | Workflow CLI mirror + hooks + attestation | 100% of CLI half of joint suite (157/159, 2 skip) |
| `@salt-ds/semantic-core` | ~22k TS + 24 MB JSON | Retrieval, validation, registry build, policy engine | 292/293 pass, 1 fail |
| `@salt-ds/runtime-inspector-core` | ~5k TS | Playwright + fetched-HTML inspection, doctor, install diagnostics | included in CLI/runtime joint run |
| `@salt-ds/skills` | ~2.2k MD + 568 TS tests | Agent skill (markdown rules) | 27/28 pass, 1 skip |

**Test failures observed**:

- `packages/semantic-core/src/__tests__/themeDeprecatedTokenReplacementMetadata.spec.ts:151` — 54 entries in `packages/theme/css/deprecated/token-replacements.json` have stale `basis.line_start`/`line_end` ranges that no longer cover the cited token (theme-team data drift, out-of-scope for the AI branch).
- `packages/mcp/src/__tests__/registry.integration.spec.ts:1407` ("Developing with Salt" guide) and `:1552` ("Amplitude font" structured MDX) — both MDX extraction edge cases in the registry/MDX-extraction pipeline.
- These match the commit `389640594 chore(mcp): quarantine 7 pre-existing test failures unrelated to the cleanup` — i.e. they're known and explicitly carved out. 14 Jun closed 2 of the 5 in-tree (see Section 7 item #5); 3 remain.

**Verdict**: Test health is solid (~99.5% pass). The remaining failures are real (not flaky) and represent registry/MDX extraction edge cases, not architectural defects.

---

## 2. Architecture assessment

### 2.1 The good (load-bearing, well-engineered)

| Area | Where | Why it's good |
|---|---|---|
| **MCP protocol usage** | `packages/mcp/src/server/createServer.ts`, `registerTools.ts` | Thin (25 / 50 LOC). Correct annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`). All 14 tools declare output schemas. |
| **Publish boundary enforcement** | `packagePublishBoundary.spec.ts` | Tests assert `files: ["bin"]`, that eval fixtures + tests are excluded, that Playwright is NOT a transitive dep. This is the kind of foundation gate "gold standard" actually means. |
| **Path traversal hardening (MCP)** | `packages/mcp/src/server/toolDefinitions.ts:1144` `resolveWritablePathInsideRoot` | Explicit `isInsideDirectory` guard before every artifact write. All 5 write paths route through it. Clean OWASP A01/A03 posture for MCP-side. |
| **Lexical retrieval scoring** | `packages/semantic-core/src/tools/createRetrieval.ts:1628` | BM25-variant with owner / supporting / caution roles, weighted source evidence (canonical_name=34, alias=22, when_to_use=16…). Deterministic, debuggable, no LLM dependency. |
| **AST validation pipeline** | `packages/semantic-core/src/tools/validation/validateSaltUsageHelpers.ts` | Multi-rule (accessibility, deprecation, contrast, primitive recreation, token policy) with `SaltEvidenceRef` traceability per finding and **version-aware severity** (`semver.gte(version, removed_in) ? error : warning`). |
| **Attestation primitive** | `packages/cli/src/lib/attestation.ts` | SHA-256 file hashing, NDJSON wire format, explicit `unsupported-alg` drift kind. Honest about not hashing the registry (documented trade-off). |
| **Project context staleness** | `packages/mcp/src/server/toolDefinitions.ts:976-1027` | Caches `get_salt_project_context`, marks stale on `install_dependencies` so the next workflow call re-fetches. Solves a real agent-loop bug, not a theoretical one. |
| **Deterministic eval harness** | `packages/mcp/src/__tests__/agenticEvals.spec.ts`, `packages/mcp/src/evals/workflowEvalScenarios.ts` | Real eval matrix, no LLM in the loop — repeatable in CI. Plus a live `workflowEvalHarness.ts` that spawns the MCP over `StdioClientTransport`. Both are present. |
| **Hook IO robustness** | `packages/cli/src/lib/hookIO.ts` | 1 MiB stdin cap, JSON shape validation, camelCase/snake_case tolerance. No remote-input DoS surface. |
| **Bytes budget regression test** | `packages/cli/src/__tests__/infoBytesBudget.spec.ts` | Test asserts `salt-ds info` reads <2 MB (down from 24 MB). Pins perf at the test level — this is exemplary engineering discipline. |

### 2.2 The over-built (real code smell, not aesthetic complaint)

| Area | Where | The issue | Suggested fix |
|---|---|---|---|
| **`toolDefinitions.ts` god-file** | `packages/mcp/src/server/toolDefinitions.ts` (2,227 LOC) | 40+ Zod schemas + 14 tool implementations + project-context caching + file I/O all in one module. Painful to evolve a single tool. **Note:** splitting is structural — it redistributes LOC without deleting it. The file does have ~30 over-exports (schemas reused only internally) which were demoted from `export` to module-private 14 Jun; 0 LOC change but reduced public API surface. | Split: `schemas/`, `tools/<one-per-file>.ts`, `projectContextRuntime.ts`, `persistence.ts`. Target ~200 LOC orchestrator. |
| **`context*` file splintering** | 13 files in `packages/semantic-core/src/`: `contextArtifacts.ts`, `contextPatterns.ts`, `contextFoundations.ts`, `contextChecks.ts`, `contextCoverageAudit.ts`, `contextCoverageGapCatalog.ts`, `contextManifest.ts`, `contextMarkdown.ts`, `contextPackBundle.ts`, `contextPackPaths.ts`, `contextPackReleaseGate.ts`, `contextPackSelection.ts`, `contextUnsupportedSurfaces.ts` | The 3 builders (`contextArtifacts` / `contextFoundations` / `contextPatterns` = 2,295 LOC) share boilerplate but **36% of LOC is genuinely per-domain** (Component has `props`/`imports`, Foundation has `tokens`/`policy`, Pattern has `composition`/`accessibility signals`). Verified by structural diff 14 Jun. | **Option A (low risk):** extract shared boilerplate to `contextBuilderShared.ts` → ~100 LOC saved, public API preserved. **Option B (high risk):** full discriminated-union merge → ~1,200 LOC saved but adds runtime branching and complex test matrix. Original "~2,000 LOC deletion" estimate was wrong. |
| **`projectConventionsWorkflow.ts`** | `packages/cli/src/lib/projectConventionsWorkflow.ts` (was 849 LOC, now 782 LOC) | Imports `composeProjectConventionLayers` / `buildWorkflowProjectPolicyArtifact` from semantic-core, then rewraps. Most wrappers are actually used. 14 Jun audit found exactly one dead adapter (`toWorkflowProjectPolicySummary`, 67 LOC) which has been deleted; remainder is genuine CLI shaping. Further trimming requires inlining direct semantic-core calls at each callsite. | Net achievable further deletion: ~50–150 LOC. Original "delete most of it" claim was wrong — callsites depend on the wrappers. |
| **`saltInstallation.ts`** | `packages/runtime-inspector-core/src/saltInstallation.ts` (1,330 LOC) | Reimplements: workspace detection, package-manager detection, monorepo BFS, npm/yarn/pnpm/bun shellouts, dedupe suggestions. This is `npm-check`-the-package, in-tree. **Note:** extraction to a sibling package does *not* shrink the repo — the LOC just lives in another `packages/*`. Real LOC savings only come from replacing with `@npmcli/arborist`. | Extract to `@salt-ds/install-doctor` package (zero LOC win, only maintenance separation), or replace 70% by depending on `npm-packlist`/`@npmcli/arborist` (real ~900 LOC delete). |
| **`publicContract.ts` + `workflowContracts.ts`** | 2,475 + 2,334 LOC respectively | Mostly types and discriminated unions with extensive prose comments documenting semver bumps. | Move historical commentary to a `CHANGELOG.md`. Generate routine type variants table-driven. Realistic shrink: 4,800 → 3,800–4,200 LOC (the prose is ~500–1,000 LOC; the types themselves are needed). |
| **CLI args parser ad hoc** | `packages/cli/src/lib/args.ts` (221 LOC) | Fine for now, but the flag matrix is getting big (`--full` / `--starter-only` / `--include-starter-code` / `--mode` interactions are implicit). | Don't migrate to citty/yargs unless you add another 3+ commands. But add a `--help` schema test that enumerates every flag's behavior. |
| **Test file mega-files** | `cli.spec.ts` 7,141 LOC; `tools.spec.ts` 4,903 LOC; `createServer.spec.ts` 3,862 LOC | Single files of this size are change-amplifiers; one schema tweak cascades. | Split per-command / per-tool. Add per-tool snapshot directories rather than one mega-file. |
| **Eval fixtures published path** | Three full consumer-repo trees in `packages/mcp/eval-fixtures/` | Excluded from publish (good), but maintenance cost is real every time the registry contract evolves. | Move to a separate dev-only `@salt-ds/mcp-eval-fixtures` workspace package or git submodule. |

### 2.3 Schema duplication (Zod ↔ JSON Schema)

`packages/semantic-core/schemas/` has 34 hand-written JSON Schema files. The original 13 June draft framed this as a Zod↔JSON duplication problem with a 3–5k LOC delete available; **14 June audit corrected this**: only `salt-attestation.schema.json` has a true Zod twin in `attestation.ts`. The other 33 are backed by TS `interface` definitions plus AJV validation harnesses, not Zod. So `z.toJSONSchema()` cannot be the source of truth today — it has nothing to generate from for 33/34 schemas.

Real options, in order of effort:

- **Add a parity test** (~50 LOC test) using `ts-json-schema-generator` against the existing interfaces and assert the generated output matches each hand-written JSON. Catches drift without changing anything else. Best ROI.
- **Generate JSON from TS interfaces** via `ts-json-schema-generator` build step. ~5.5k LOC delete from `schemas/`, plus ~100 LOC of build script. Real win, but adds a build-toolchain step and requires baseline-snapshotting to ensure published `$id` URLs don't drift.
- **Migrate the 33 interfaces to Zod first**, then `z.toJSONSchema()`. Largest scope, ~3–6k LOC of new Zod code before the deletes happen. Net win is similar to the previous option; not worth the migration cost on its own.
- **Leave alone**. The drift risk is real but bounded — AJV test utilities already exercise the JSON schemas against canonical examples.

---

## 3. Security audit (OWASP top-10 spot-checks)

| Risk | Status | Evidence |
|---|---|---|
| **A01 Broken Access Control** (path traversal) | ✅ FIXED 14 Jun across MCP + CLI | MCP: `resolveWritablePathInsideRoot` (`packages/mcp/src/server/toolDefinitions.ts:1144`) blocks escape on writes; the same guard now wraps `validateReviewReportFromPath` (read path), `entryPath()` in `packages/cli/src/commands/exportContext.ts`, and `verifyAttestation` (`packages/cli/src/lib/attestation.ts:130`) which surfaces escape attempts as `reason: "path-escape"` drift. 3 regression tests in `attestationSecurity.spec.ts`. |
| **A03 Injection (command)** | OK Safe | All `child_process` use is via `execFile(command, args, …)` in `packages/runtime-inspector-core/src/saltInstallation.ts:958` — array args, no shell, `windowsHide: true`, `maxBuffer: 8 MiB`, `timeout`. No `exec`/`spawn(... , {shell: true})` anywhere. |
| **A03 Code execution** | ✅ DOCUMENTED 14 Jun (by-design, now disclosed) | `packages/semantic-core/src/policy/layerDiagnostics.ts` `resolveProjectConventionsPackageLayer` carries a `SECURITY MODEL` JSDoc block making explicit that `package`-type layers run arbitrary JS in the developer's process at policy-resolution time. The `project-conventions-stack.schema.json` schema title + `packageSource` `$def` carry matching disclosures so contract consumers see the trust boundary. Resolution is constrained to `require.resolve(..., { paths: [rootDir] })` against the host project's own dependency graph; no MCP-supplied paths are ever loaded. Hosts that cannot accept the trust posture ship JSON-only packs via `type: "file"` instead. |
| **A06 Vulnerable components** | OK Pinned, recent | `@modelcontextprotocol/sdk ^1.29.0`, `zod ^4.1.11`, `dom-accessibility-api ^0.7.0`, `jsdom ^26.1.0`, `semver ^7.7.3`. Playwright is optional peer (not bundled). |
| **A08 Software/Data integrity** | OK Best-in-class for the space | `SaltAttestationV1`: SHA-256 file hashes, NDJSON over stdin/stdout. No competitor (shadcn, MUI, Chakra, v0, Penpot) has this. Real differentiator. |
| **A10 SSRF** | ✅ FIXED 14 Jun | Shared `safeFetchWithTimeout` in `packages/runtime-inspector-core/src/inspectShared.ts` always blocks non-http(s) schemes and cloud-metadata IPs (`169.254.169.254`, `metadata.google.internal`, `metadata.goog`); opt-in `blockLoopback` flag for embeddings facing untrusted input. Adopted by both `inspect.ts` and `doctor.ts` (the latter's previous `redirect: "follow"` is now `"manual"`). 6 regression tests in `inspectSharedSafeFetch.spec.ts`. Loopback access remains the dev-tool default — inspecting `http://localhost:3000` is the common case. |
| **DoS via NDJSON** | ✅ FIXED 14 Jun | `runVerifyAttestationsCommand` now enforces a 1 MiB hard cap on both `--verify-attestations <path>` and stdin reads before parsing (mirrors `hookIO.ts`'s pattern). 3 regression tests in `verifyAttestationsCap.spec.ts`. `exportContext.ts`'s `readJsonFile` already got its own 10 MB cap. |

**Net**: No critical or medium findings remain in the AI-tooling perimeter. The conventions-pack dynamic-import surface is now explicitly disclosed in both code (`layerDiagnostics.ts` JSDoc) and contract (`project-conventions-stack.schema.json` descriptions); the trust boundary is the host project's installed dependency graph, no MCP-agent input ever reaches the resolver. SSRF, path-traversal (incl. attestation), and NDJSON DoS edges were closed 14 Jun (see security audit table above and recommendation list below). `page.goto(url)` in `inspectBrowserSession.ts` is **not** guarded — if browser-mode runtime inspection ever accepts URLs from an MCP agent rather than the local dev, route it through `assertFetchableUrl()` first.

---

## 4. Skills package & workflow-examples

**Skills (`packages/skills/`)** is markdown-as-code, not a runtime artifact. ~2,200 LOC across 7 files: 1 thin router (`SKILL.md`, 57 LOC), 1 always-loaded behavior contract (`references/core.md`, 891 LOC), 5 workflow-specific references (`conventions`/`create`/`migrate`/`review`/`upgrade`, 1,254 LOC total), and 1 host-default prompt (`agents/openai.yaml`, 12 LOC).

**The original 13 June draft claimed "~200–300 lines of literal duplication (Hard Gate / Action Loop / No Salt Invention repeated 4–6× across `core.md`, `create.md`, `migrate.md`, `review.md`, and `agents/openai.yaml`)". 14 June audit showed this is wrong** — phrase counts:

| Phrase | core.md | SKILL.md | openai.yaml | create.md | review.md | migrate.md | upgrade.md | conventions.md |
|---|---|---|---|---|---|---|---|---|
| Hard Gate | 7 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| Action Loop | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| No Salt Invention | 4 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |

The phrases live almost entirely in `core.md` (the always-loaded file) plus a single mention in `SKILL.md` (router) and `agents/openai.yaml` (host-default prompt). That is **deliberate progressive disclosure**, not duplication. There's nothing for a markdown-includes pass to consolidate at the file boundary.

**What is structurally repeated**: each workflow reference follows the same skeleton (`## {Workflow} Rules` → `## Priority Order` → `## Critical Rules` → `## Stable Rule IDs` → `## {workflow} workflow` → `## output template` → `## {workflow} gotchas`), but the content inside each section is per-workflow (e.g., `create-task-first` vs `migrate-preserve-task-flow` rule IDs that are by-design distinct stable identifiers consumed by validation).

**Test surface is tight**: `packages/skills/__tests__/skillContracts.spec.ts` (451 LOC) makes ~40 exact-substring assertions against specific file paths and enforces both header-order and character-budget constraints. Any file-restructuring change must update these assertions in lockstep. `packages/semantic-core/src/promptHostInstructionSurfaces.ts` also hard-codes the paths `packages/skills/salt-ds/SKILL.md` and `packages/skills/salt-ds/agents/openai.yaml` as published prompt-host instruction surfaces.

`packages/skills/__tests__/skillContracts.spec.ts` is a *structural linter* — it tests "these phrases exist in these files" and "the markdown header order is exactly X". It does **not** test that the agent actually obeys the Hard Gate. That's the biggest behaviour gap: prose is testable, runtime enforcement is not.

**`workflow-examples/`** is repo-local docs (correctly excluded from all published packages):

- `workflow-examples/consumer-repo/` — a config template (`package.json` has 5 deps and no `src/`). It's a fixture, not a runnable app.
- `workflow-examples/migration-visual-grounding/` — actual runnable Playwright .mjs scripts + HTML fixtures. Useful.
- `workflow-examples/project-conventions/custom-host-merge.example.ts` — 222 LOC of standalone TS that **does not import any `@salt-ds/*`**; pure reference for hosts that want to mirror the merge algorithm. Marked as "most consumers should not copy this" in a header comment. This is honest but easy to misread.

---

## 5. Competitive context (so you can decide where to spend your engineering)

| Capability | salt-ds | shadcn | v0 | MUI | Chakra | Mantine | Penpot MCP |
|---|---|---|---|---|---|---|---|
| MCP server | YES — 14 tools | minimal | NO | unknown skills/ | unknown skills/ | only `.claude` | YES — ~15-20 tools |
| CLI | YES — 11 commands | YES — `add` only | NO | NO | NO | NO | NO |
| Create / generation | YES — adoption-style | copy-paste | YES — prompt-to-code | NO | NO | NO | NO |
| Review | YES — AST + runtime | NO | NO | NO | NO | NO | NO |
| Migrate | YES — + visual evidence | NO | NO | NO | NO | NO | NO |
| Upgrade (version-aware) | YES | NO | NO | NO | NO | NO | NO |
| Policy engine (`.salt/*.json`) | YES | NO | NO | NO | NO | NO | NO |
| Attestation/audit | YES — SHA-256 NDJSON | NO | NO | NO | NO | NO | NO |
| Runtime evidence (Playwright) | YES | NO | NO | NO | NO | NO | n/a |
| Embeddings/vector retrieval | NO (intentional) | NO | YES | NO | NO | NO | NO |
| External adoption (GH stars) | n/a | 116k | n/a | 98k | 40k | 31k | 49k |

**The pattern is unambiguous**: salt-ds is the only project in this space shipping **review / migrate / upgrade / policy / attestation** as a connected workflow. That is the real product. **Create-from-prompt is the one column where competitors are ahead** (v0 vision-based, shadcn just-copy-it). You will lose this column if you try to compete on it.

---

## 6. Honest verdict on positioning

You asked whether this can be a "foundation AI platform" for teams that lets them prototype, ship production apps, and add team-specific layers. Held against what actually ships:

- **Prototype apps?** Weak. `create_salt_ui` is grounding-first by design (no hallucination), which makes it slower than v0/Magic Patterns for the "make me a thing" use-case. Fine for Salt-shop teams; not a Vercel-v0 killer.
- **Production apps?** Strong. Review + upgrade + attestation are exactly the things production teams need and competitors don't offer.
- **Team/business layers?** Strongest. The `.salt/stack.json` layered conventions stack, shared conventions packs (`workflow-examples/project-conventions/lob-package.example.ts`), per-layer compatibility resolution in `packages/semantic-core/src/policy/detection.ts`, and attestation as audit substrate together are a credible **Design System Governance Platform**. Nobody else has this.

**The risk of shipping as "AI foundation"** is that prospects evaluate you against v0 on demo day, see the slower compact-then-retrieve loop, and never get to the part where the policy engine and review workflow earn their keep.

---

## 7. Concrete recommendations (ranked by ROI)

### Ship-critical (do before any external "stable" marker)

1. ~~**Add SSRF allowlist** to `packages/runtime-inspector-core/src/inspect.ts` and `doctor.ts`.~~ **✅ DONE 14 Jun.** Shared `assertFetchableUrl` + `safeFetchWithTimeout` in `inspectShared.ts`; always-block on non-http(s) + cloud metadata, opt-in `blockLoopback`. 6 regression tests.
2. ~~**Add NDJSON size/line caps** to attestation verifier.~~ **✅ DONE 14 Jun.** `runVerifyAttestationsCommand` enforces a 1 MiB hard cap on both file-flag and stdin reads before invoking `parseSaltAttestationNdjson`. 3 regression tests in `verifyAttestationsCap.spec.ts`.
3. ~~**Document conventions-pack code-execution risk** explicitly in `packages/semantic-core/src/policy/layerDiagnostics.ts` JSDoc + the published schema docs.~~ **✅ DONE 14 Jun.** `resolveProjectConventionsPackageLayer` now carries a `SECURITY MODEL` JSDoc making the trust boundary explicit (host project's installed dependency graph, never MCP-agent-supplied paths). Matching disclosure added to the schema title and `packageSource` `$def` in `project-conventions-stack.schema.json`.
4. ~~**Path-traversal guard for `verifyAttestation`**~~ **✅ DONE 14 Jun.** Hostile `files_touched` entries that escape cwd via `..` or absolute paths are surfaced as a new `reason: "path-escape"` drift instead of being silently re-hashed. 3 regression tests in `attestationSecurity.spec.ts`.
5. **Fix or formally retire the 5 quarantined tests** before publishing 0.1. **⚠️ PARTIAL 14 Jun.** 2 of 5 closed in-tree: (a) `contextCoverageProduction.spec.ts` updated to acknowledge the new `SaltProviderNext` registry entity (1 component coverage gap added to the expected catalog — the registry build had added the entity since the test's last snapshot); (b) `publicContractParity.spec.ts > upgrade full semantics` fixed by setting `include_deprecations: false` as the default in MCP's `upgrade_salt_ui` execute handler, matching the CLI's `salt-ds upgrade` default (was silently defaulting to `true` via `compareVersions`, downgrading confidence to `medium` on calls that hadn't asked for deprecation analysis). Fixture `upgrade.full.json` regenerated to capture the now-correct `confidence_level: "high"`. **3 remaining failures are out-of-scope** for the AI-packages branch: 1 theme-data drift (`themeDeprecatedTokenReplacementMetadata.spec.ts` — 54 stale `basis` line ranges in [packages/theme/css/deprecated/token-replacements.json](packages/theme/css/deprecated/token-replacements.json), owned by the theme team) + 2 MDX-extraction bugs in [registry.integration.spec.ts](packages/mcp/src/__tests__/registry.integration.spec.ts) ("Developing with Salt" guide lookup returns null; "Amplitude font" no longer present in structured MDX page content — both owned by the registry/MDX-extraction team).

### High-ROI simplification (verified deletion budget ~1–1.5k LOC; structural decisions on schemas and god-file splits would unlock additional savings but the 13 Jun "~3–5k LOC" extension was wrong on its premise)

6. **Collapse the 13 `context*.ts` files** in semantic-core. Original "~2,000 LOC deletion" estimate was wrong — 36% of the 3 builders is genuinely per-domain (props vs tokens vs composition). Realistic options: extract shared boilerplate to `contextBuilderShared.ts` (~100 LOC saved, low risk) **or** full discriminated-union merge (~1,200 LOC saved, but adds runtime branching and complex test matrix). Pick one, don't promise the larger number until the merge has actually been prototyped against the test suite.
7. **Split `packages/mcp/src/server/toolDefinitions.ts`** (2,227 LOC) into per-tool modules + schemas dir + runtime helpers. Enables per-tool tests instead of one monster spec. **Note:** this is *redistribution*, not deletion — don't count it toward LOC reduction. Real reduction here would come from auto-generating the 50+ Zod schemas from a single table, plausibly 200–400 LOC.
8. **Audit and delete `packages/cli/src/lib/projectConventionsWorkflow.ts`** (now 782 LOC after 14 Jun cleanup). The 67-LOC dead `toWorkflowProjectPolicySummary` has been removed; remaining wrappers are genuinely used. Further trim requires inlining `composeProjectConventionLayers` / `buildWorkflowProjectPolicyArtifact` at each callsite. Realistic further savings: ~50–150 LOC, not the originally implied ~600 LOC.
9. **Decide on schemas/**: original 13 Jun framing as a "Zod ↔ JSON" duplication was wrong (only 1 of 34 schemas has a Zod twin; the rest are backed by TS interfaces). Realistic options: **(a)** add a parity test using `ts-json-schema-generator` against the interfaces (~50 LOC test, catches drift, no deletes); **(b)** generate JSON from TS interfaces via a build step (~5.5k LOC delete + ~100 LOC script + baseline-snapshot work to preserve published `$id` URLs); **(c)** leave alone. The largest potential LOC win is (b), but it requires a build-toolchain investment and `$id`-stability work; the 13 Jun "~3–5k" number assumed Zod sources existed when they don't.
10. **Extract `packages/runtime-inspector-core/src/saltInstallation.ts`** (1,330 LOC). Extraction to a sibling package is ~0 net LOC change; the real win is replacing 70% by depending on `npm-packlist` / `@npmcli/arborist` (~900 LOC delete).

**Verified completed in 14 Jun cleanup pass (~155 net LOC deleted across 8 files, plus 30+ over-exports demoted to module-private):** dead duplicates (`workflowOutputs.ts` Tool types, `projectConventionsWorkflow.ts` dead summary, `args.ts` `parsePositiveInteger`, `common.ts` record helpers, `hookIO.ts` dead exit-code type, duplicate `WorkflowExitCode`, dead `RuntimeInspectOptions` re-export, dead `DEFAULT_CONTEXT_PACK_*` re-export, dead `SaltValidationRuleMatchKind`). All 5 baseline test failures preserved — zero regressions.

### Strategic

11. **Reposition publicly as "Design System Governance Engine"** that happens to be MCP/CLI-shaped. Stop competing with v0 on the create lane; you'll lose. Lean on review/migrate/upgrade/policy/attestation — the moat is real.
12. **Pick one transport eventually**. MCP is the bet ecosystems are making (Claude, Cursor, VS Code, ChatGPT, Continue all support it). Either retire the CLI to a thin `salt-ds doctor`/`salt-ds info`-only support tool, or commit to permanent parity and own the maintenance cost. The current 50/50 split doubles your test surface.
13. **Add a behaviour-level skill enforcement test**. Today `packages/skills/__tests__/skillContracts.spec.ts` verifies the *prose* contains "Hard Gate". Add a real test that calls `create_salt_ui` with an ambiguous prompt and asserts `action.kind !== "implement"`. That's what "gold standard" means for an AI product.
14. **Don't position `@salt-ds/skills` as an "Anthropic Skill" or "OpenAI Custom GPT"** — neither standard recognises this format. Either align to one published spec when one solidifies, or own the framing as "salt-ds workflow rules, format-agnostic".
15. ~~**Publish the 6 reference markdown files once, not 6 times**.~~ **RETRACTED 14 Jun.** Audit showed the "200–300 LOC of literal duplication" claim was wrong — see Section 4. The phrases live in `core.md` (always-loaded) + single mentions in the router and host-default prompt; that's progressive disclosure, not duplication. There is no markdown-includes pass to run. The genuinely-redundant content sits inside `core.md` itself (7× "Hard Gate" / 3× "Action Loop" inside one 891-LOC file); auditing that file for internal density is realistic but bounded (~50–150 LOC).

### Don't do

- Don't add LLM-based retrieval to compete with v0. The deterministic BM25 + AST approach is what makes the workflow contracts work; embeddings would defeat the Hard Gate.
- Don't add a generator/SaaS layer. Stay client-side. Your security story (no telemetry, attestation-as-audit) is part of the moat for JPM and similar regulated buyers.
- Don't grow the public MCP tool surface beyond ~14. You're already on the high end vs reference MCP servers (3–7 tools). Hide complexity inside workflows.

---

## 8. Bottom line

This is **not a bad foundation** and shipping it would not cause reputational damage on the dimensions that usually do (broken tests, leaky publish boundary, naive injection sinks, hallucinating outputs). It would cause reputational damage if marketed as "AI foundation for teams" against v0/shadcn — because the create-from-prompt experience is structurally slower than competitors. All four code-level ship-critical security items (#1 SSRF, #2 NDJSON cap, #3 conventions-pack disclosure, #4 attestation path traversal, plus the sibling `validateReviewReportFromPath` and `entryPath` fixes) are done; 2 of 5 quarantined tests are closed in-tree (#5 contextCoverageProduction snapshot + parity upgrade-confidence drift). Remaining work is the 3 quarantined tests owned by other teams (1 theme-data drift + 2 MDX-extraction bugs in the registry) and the schemas-decision question. Re-frame, hand the 3 remaining red tests to their owning teams (theme, registry/MDX), decide on schemas (parity test today, generation later), and you have something worth putting your name on.

Specific files I'd touch first if I were on the team Monday:

- the 2 remaining MDX-extraction failures in [registry.integration.spec.ts](packages/mcp/src/__tests__/registry.integration.spec.ts) — in-scope for the AI-packages branch since they're MCP test files, but the root cause lives in `packages/semantic-core/src/build/` MDX extraction. Needs a focused MDX-pipeline trace session.
- [packages/theme/css/deprecated/token-replacements.json](packages/theme/css/deprecated/token-replacements.json) — hand off to the theme team; 54 stale `basis` ranges need regeneration after the CSS source refactors
- `packages/semantic-core/schemas/` — add a `ts-json-schema-generator` parity test against the existing TS interfaces (~50 LOC, catches drift without restructuring anything; the 13 Jun "~3–5k LOC win via Zod" framing was wrong because 33/34 schemas have no Zod twin)
- `packages/mcp/src/server/toolDefinitions.ts` — start the split (structural, not LOC reduction)
- the 13 `context*.ts` files in `packages/semantic-core/src/` — prototype the shared-boilerplate extract first; only attempt the full generic merge if test coverage holds
- `packages/skills/salt-ds/references/core.md` (891 LOC) — audit internal density (7× "Hard Gate" / 3× "Action Loop" in one file). Realistic trim ~50–150 LOC; the cross-file dedup claim retracted in #15 above.

---

## Appendix A: Method

- **Branch diff scope**: `git diff --stat main...HEAD` → 673 files, +172,061 / −1,006 lines.
- **Tests executed**: `yarn vitest run --reporter=dot` against each AI-tooling package separately.
  - `packages/skills` → 27 passed / 1 skipped (1.87 s)
  - `packages/runtime-inspector-core + packages/cli` → 157 passed / 2 skipped (30.17 s)
  - `packages/semantic-core` → 292 passed / 1 failed (1.37 s + setup)
  - `packages/mcp` → 454 passed / 4 failed / 9 skipped (140.87 s)
- **Static surveys**: `grep_search` for `eval(`, `Function(`, `spawn(...{shell:true})`, `fetch(`, `page.goto`, `path.resolve` near user input, `..` traversal, `localhost`/loopback/RFC1918, schema duplication, `describe.skip` / `it.skip`.
- **File reads**: top 20 largest TS files in each new package, plus targeted reads of architecture-critical modules (`createServer`, `registerTools`, `toolDefinitions`, `inspect`, `attestation`, `hookIO`, `policy/detection`, `policy/layerDiagnostics`, `createRetrieval`, `validateSaltUsage*`).
- **Competitive research**: live web fetches against shadcn, v0, MUI, Chakra, Mantine, Park UI, Penpot MCP, modelcontextprotocol/servers reference set.

## Appendix B: What was deliberately NOT reviewed

- README prose, roadmap docs (e.g. `implementation-handoff*`), commit-message tone, and architectural decision records — at user request, focus was on code/artefacts only.
- Non-AI packages (`@salt-ds/core`, `@salt-ds/theme`, `@salt-ds/lab`, `@salt-ds/icons`, etc.) — outside the branch's intended scope.
- The cypress component tests under `cypress/` — pre-existing infrastructure, unchanged.
- Site / docs MDX changes — incidental to this branch.

## Appendix C: Line-count summary of audited packages

```
packages/cli/src/__tests__/cli.spec.ts                     7,141
packages/mcp/src/__tests__/tools.spec.ts                   4,903
packages/mcp/src/__tests__/createServer.spec.ts            3,862
packages/mcp/src/evals/workflowEvalHarness.ts              2,529
packages/semantic-core/src/build/buildRegistryTokenPolicy  2,483
packages/semantic-core/src/tools/publicContract.ts         2,475
packages/semantic-core/src/tools/workflowContracts.ts      2,334
packages/semantic-core/src/tools/createRetrieval.ts        2,274
packages/cli/src/__tests__/exportContext.spec.ts           2,250
packages/mcp/src/server/toolDefinitions.ts                 2,227
packages/semantic-core/src/tools/validation/...Helpers     2,223
packages/mcp/src/__tests__/registry.integration.spec.ts    1,683
packages/semantic-core/src/build/buildRegistryPatterns.ts  1,600
packages/mcp/src/__tests__/agenticEvals.spec.ts            1,582
packages/mcp/src/__tests__/publicContractParity.spec.ts    1,505
packages/semantic-core/src/tools/validation/...Style.ts    1,453
packages/mcp/src/server/projectContext.ts                  1,335
packages/runtime-inspector-core/src/saltInstallation.ts    1,330
packages/semantic-core/src/tools/validateSaltUsage.ts      1,231
```

Total across all new AI-tooling source + test code: **~150,206 lines**.
