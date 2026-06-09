# Salt AI Tooling — Gold-Standard Roadmap

Status: proposal, June 8, 2026
Owners: AI tooling maintainers
Scope: `packages/skills`, `packages/mcp`, `packages/cli`, `packages/semantic-core`, `packages/runtime-inspector-core`
Companion: [`session-findings-2026-06.md`](./session-findings-2026-06.md) — real consumer trace evidence

This document consolidates findings from the architectural review, the competitor comparison, and a real consumer Copilot session, then proposes a staged plan to move the Salt AI tooling from "best-in-class beta" to "category-defining gold standard." It is deliberately ambitious and includes refactors and new capabilities (hooks, plugins, streaming, replay, multi-DS) where they would raise the ceiling rather than just polish the floor.

> **Revision history**
>
> - **2026-06-08 (rev 2): scope discipline pass.** Cut ~40% of the original plan after challenge that Salt was overreaching. Concrete cuts and surviving scope are documented in §2.1.5 "Scope discipline" and Appendix B. Phase 3 hook-package count reduced 5→1. Phase 4 narrowed from five capabilities to one (replay). Phase 5 narrowed from product-and-relationships to specs-only. Multi-DS host (5.7) and LSP adapter (5.6) dropped.
> - **2026-06-08 (rev 1): initial plan.**

## Salt's job, stated narrowly

Before any phase, the test for whether a proposed task belongs in this plan:

1. Maintain canonical Salt evidence in the registry.
2. Express it through `salt_workflow_v1`.
3. Refuse to let the model claim implementation without grounding.
4. Refine canonical guidance with declared repo policy.
5. Ship MCP/CLI transports for 1–4.
6. Provide a thin substrate (hooks, attestations) so hosts can mechanically enforce 3.

If a task isn't one of these six, ask in order: can the host own it? can git own it? can the model own it? can the community own it? If yes to any, Salt doesn't ship it.

This rule is what trimmed the rev 1 plan into rev 2. See Appendix B for the explicit "we will not do" list and §2.1.5 for the rationale.

Two non-negotiables run through the whole plan:

1. **Consumer confidence.** Every change must make the first-run experience faster, the contract more honest, and the failure modes more legible.
2. **Maintainer cost.** Every change must reduce, not grow, the surface area a maintainer has to keep in their head. Sprawl is the failure mode.

---

## Part 1 — Consolidated Findings

Findings tagged **(trace)** are grounded in a real 9-turn Copilot session captured in `chat.json` and analyzed in [`session-findings-2026-06.md`](./session-findings-2026-06.md). The trace's headline result: of 9 turns, 2 ended in user corrections, both traceable to the same root cause (registry coverage gaps forcing the model out of the "do not inspect node_modules" rule). Closing four registry/contract items (F1, F2, F4, F5) would have eliminated both corrections, the self-contradicting review, and the stale-context loop.

### 1.1 What already works and must be preserved

- Single `salt_workflow_v1` contract shared by MCP and CLI via `publicContract.ts`.
- One workflow vocabulary (`init / create / review / migrate / upgrade`) across skill, MCP, CLI, capability manifest, and consumer template.
- Hard implementation gate: `status=success ∧ action.kind=implement ∧ safety.exact_request_safe ∧ evidence.status=complete`.
- Zod input *and* output schemas on every MCP tool, asserted by tests.
- Capability manifest exposed through both transports plus `salt://capabilities/manifest`.
- `.salt/team.json` + layered `.salt/stack.json` with merge order, provenance, and conventions-packs.
- Visual evidence kept outside MCP via `migrate_visual_evidence_v1` adapter contract.
- `packagePublishBoundary.spec.ts` asserts what ships and what stays internal.
- `maintaining-salt-ai-tooling.md` codifies the docs > category map > build > runtime > skill ordering.
- ~787 tests across 70 specs, including end-to-end CLI workflow scenarios and MCP server integration through the SDK.

These are the moats. The rest of the plan must protect, not erode, them.

### 1.2 Critical issues (block public release)

| # | Finding | Where |
|---|---|---|
| C1 | `playwright` is a transitive runtime dependency of `@salt-ds/cli` and `@salt-ds/mcp` via `publishBundledWorkspaceDependencies`. Triggers ~250 MB browser download on first `npx -y @salt-ds/cli@latest info .`, the documented smoke test. | `packages/runtime-inspector-core/package.json`, `scripts/build.mjs` L80–118, L234 |
| C2 | 24 MB of generated JSON is loaded eagerly per CLI invocation and per MCP boot. `salt-ds info` does not need search/retrieval indexes, tokens, or examples. | `packages/cli/generated/*`, `packages/mcp/generated/*`, `packages/cli/src/lib/registry.ts`, `packages/semantic-core/src/registry/loadRegistry.ts` |
| C3 | Public MCP README advertises 9 tools (6 workflow + 3 support). 13 tools are actually registered. The four extras are real, schema-defined, mutating tools that hosts will discover via `tools/list`. | `packages/mcp/README.md` L20–48 vs `packages/mcp/src/server/toolDefinitions.ts` L1270, 1297, 1330, 1386; `packages/mcp/src/__tests__/createServer.spec.ts` `EXPECTED_TOOL_NAMES` |

### 1.3 Major issues (block stable / 1.0)

| # | Finding | Where |
|---|---|---|
| M1 | Mega-files. `workflow.ts` 3337 lines, `publicContract.ts` 2374, `workflowContracts.ts` 2334, `toolDefinitions.ts` 2034, `reviewSaltUi.ts` 1186, `projectContext.ts` 1335, `semantic-core/index.ts` 943 with ~100 re-exports. | `packages/cli/src/commands/workflow.ts`, `packages/semantic-core/src/tools/*.ts`, `packages/mcp/src/server/toolDefinitions.ts`, `packages/semantic-core/src/index.ts` |
| M2 | `semantic-core` is declared private but exposes full internals via `exports`: `./tools/*`, `./build/*`, `./registry/*`, `./validation/*`, `./policy`, `./policy/*`, `./schemas/*`. CLI deep-imports many of them. | `packages/semantic-core/package.json` |
| M3 | `./policy` (resolves to `index.ts`) and `./policy/*` (resolves to `./src/policy/*.ts`) can collide for `./policy/index`. | `packages/semantic-core/package.json` L12–13 |
| M4 | No machine-enforced compatibility check between skill version, MCP version, CLI version, and registry version. README warns; nothing fails. | `packages/skills`, `packages/cli`, `packages/mcp`, `packages/semantic-core/src/tools/capabilityManifest.ts` |
| M5 | Skill payload is ~2,335 lines across 36 files with a 251-line always-loaded SKILL.md and `skillContracts.spec.ts` asserting specific prose snippets. Heavy context tax per agent session and brittle to wording changes. | `packages/skills/salt-ds/**`, `packages/skills/__tests__/skillContracts.spec.ts` |
| M6 | `PublicNextStep` is a discriminated union of 12 kinds. Hosts that miss one will silently degrade. | `packages/semantic-core/src/tools/publicContract.ts` L138–149 |
| M7 | `runCli(argv, io)` is exported as a supported root API for both `@salt-ds/mcp` and `@salt-ds/cli` but its argv contract, exit codes, and I/O contract are not documented in either README. | `packages/cli/src/cli.ts`, `packages/mcp/src/cli.ts`, READMEs |
| M8 | Auto-collect cache reuses "last explicit context" when only one is present. Subtle and easy to mis-trust during multi-repo agent sessions. | `packages/mcp/src/server/toolDefinitions.ts` L181 |
| M9 | **Registry coverage gaps force the model to violate the skill's "do not inspect node_modules" rule.** Real session evidence: `SaltProviderNext`, JPM Brand prop defaults, and canonical Metric/App-header story structure were all absent from `get_salt_entity`/`get_salt_examples`. The model had to `cat` user-side source 4 times in 9 turns. Both user-visible defects in the trace came from this. | See `session-findings-2026-06.md` root cause #1 |
| M10 | `status: partial` overloads two unrelated states: legitimate "user request partly addressed" *and* "registry/validator has internal gaps (`unsupported_claim_count > 0`)." Confused the user in turn 5 of the trace. | `packages/semantic-core/src/tools/publicContract.ts`; root cause #2 |
| M11 | Review heuristics not validated against canonical references. Trace turn 4: `review_salt_ui` flagged `Tooltip + Button` as nested interactive, but `app-header.stories.tsx` uses that pattern verbatim. Self-contradicting heuristic. | `packages/semantic-core/src/tools/validation/*`; root cause #3 |
| M12 | `install_dependencies` rerun is a manual three-step loop because completion doesn't invalidate the cached project context. | Trace turn 1; root cause #4 |
| M13 | No batch entity lookup. Real create workflows make 5–10 sequential `get_salt_entity` calls on related entities (one per round-trip). | Trace turn 1 (7 individual lookups); root cause #5 |
| M14 | `create_salt_ui` doesn't ask about theme even when the prompt is theme-ambiguous. First `ask_user` in the trace appeared only after a user correction (turn 7). | Trace turn 1 → turn 8 correction; root cause #6 |
| M15 | MCP tool descriptions may lack lexical signal strength for host-side tool selection. Trace turn 0 needed `tool_search` to find `create_salt_ui`. | `packages/mcp/src/server/toolDefinitions.ts`; root cause #7 |
| M16 | Assistant-rendered inline file references collapse to blanks in unrendered chat UIs ("Created: -  — default Salt team policy"). | Trace turns 0, 1; root cause #8 |

### 1.4 Minor issues (polish)

| # | Finding |
|---|---|
| P1 | Untracked `chat.json` at repo root. |
| P2 | Uncommitted `site/component-category-map.json` modifications in working tree. |
| P3 | CLI accepts both snake_case (`get_salt_entity`) and kebab-case (`get-salt-entity`); canonical form not stated. |
| P4 | `salt-ds doctor` is documented in CLI README but missing from `public-api-matrix.md`. |
| P5 | `salt-ds lint` removal returns exit code 1; should arguably exit 0 with a deprecation hint to make CI green during migration windows. |

### 1.5 Competitive gaps (what other tools do better)

| # | Gap | Beaten by |
|---|---|---|
| G1 | Cold-start install footprint. | shadcn (sub-second), MUI MCP |
| G2 | Pixel-to-code path. Refusing to parse images is correct but loses the "I have a screenshot, build it now" UX. | v0, Builder Visual Copilot, Figma Dev Mode MCP |
| G3 | Generation demo flair. `create` returns a recommendation + bounded starter, not a finished page. | v0 |
| G4 | Ecosystem gravity / registry network effects. | shadcn |
| G5 | Single-product first-run wow moment. The first compelling Salt result requires repo context + workflow + retrieval + rerun. | All hosted tools |

### 1.6 Competitive moats to extend

| # | Moat |
|---|---|
| W1 | The `salt_workflow_v1` envelope is the only schema-versioned, machine-branchable workflow contract in the design-system MCP space. |
| W2 | Project conventions schema is enterprise-grade and unmatched. |
| W3 | Mechanical edit gate is unique. |
| W4 | CLI/MCP parity through one contract builder. |
| W5 | Source-of-truth discipline written down and enforced. |

---

## Part 2 — Gold-Standard Plan

### 2.1 Guiding principles

1. **Thin and honest at the edge.** MCP and CLI are transports; semantic-core owns reasoning; skills orchestrate. Anything that violates that order is a defect.
2. **Lazy by default.** Don't load, fetch, parse, or download anything until a workflow actually needs it.
3. **Schema before prose.** If a host needs to branch on it, it is a schema. If a human needs to read it, it is a doc.
4. **Extension, not modification.** New capabilities arrive through documented hooks, not by editing core workflows.
5. **Reproducibility.** Every workflow result must be replayable from inputs + registry hash.
6. **Confidence is calibrated, not asserted.** Confidence levels are backed by measured eval outcomes, not heuristics.

### 2.1.5 Scope discipline (cuts from rev 1)

Rev 1 of this plan accumulated ~60 proposed items across phases and findings. A scope challenge surfaced that several were not Salt's job: they were either the host's, git's, the model's, or the community's responsibility. Rev 2 cuts the following with specific reasoning. The "Salt's job" test in the prologue is the gate.

| Cut item | Rev 1 location | Why cut |
|---|---|---|
| **Four of five first-party hook packages** (`@salt-ds/hook-vitest`, `-storybook`, `-figma-mappings`, `-internal-policy`) | Phase 3.3 | Plugin ecosystem management is not Salt's job. Ship the hook **contract** + **one** reference hook (`@salt-ds/hook-eslint`); the ESLint/Vitest/Storybook/Figma communities can implement their own once the contract is stable. |
| **Streaming workflows** as a Salt feature | Phase 4.1 | Demoted to **contract-only**. Publish the `SaltStreamEvent` shape so hosts that want to stream can. No new code in Salt. |
| **Calibrated confidence as a product** | Phase 4.3 | Demoted to **publish telemetry, not run a calibration service**. Salt collects opt-in data; consumers/hosts/future PRs do their own confidence math. Binding Salt's identity to "running a calibration service" turns it into a different product. |
| **OpenTelemetry-style workflow spans** | Phase 4.4 | Reduced to **`trace_id` in the result**. OpenTelemetry already has a span format; Salt doesn't need to invent one. |
| **Vision adapter shipped by Salt** | Phase 4.5 | Vision is the host's job (Copilot, Claude Code, GPT all have vision models). Salt's contribution is the `migrate_visual_evidence_v1` contract, which already exists. Reference adapters can be community-built. Closing v0's demo gap is competitive thinking, not product thinking — we don't have to win demos. |
| **LSP-style adapter for non-MCP editors** | Phase 5.6 | MCP has won. JetBrains, VS Code, Cursor, Claude Code, Codex, Windsurf, Copilot CLI all speak it. Building LSP-as-fallback is preparing for a world that isn't materializing. |
| **Multi-DS host (one Salt runtime serving MUI/Chakra registries)** | Phase 5.7 | Workflow-runtime business, not design-system business. Salt should not host other libraries' registries. If multi-DS happens, it happens in a separate community project that adopts the spec. |
| **Public `salt-ds-bench` scoreboard** | Phase 5.4 | Reduced to **publishing the benchmark protocol and scoring methodology**. Use it internally for our own regression suite. A public scoreboard turns into PR work and "Salt vs MUI" marketing — wrong product motion. |
| **Rollback / undo via `.salt/edit-sets/`** | Findings followup #1 | Git already solves this. If attestations (E4) record file hashes and trace IDs, `git revert` is the recovery tool. Reinventing a wheel git owns is bloat. |
| **Multi-tenant MCP hardening** | Findings followup #2 | Stated as a one-line spec rule ("MCP is single-tenant per process") rather than engineered. Hosted Salt-as-a-service is a different product. |
| **Token cost transparency, bad-guidance feedback loop, non-React framework support** | Findings followup #10–12 | Host territory, existing channel (GitHub Issues), and out-of-scope-by-design respectively. Document the boundaries; don't build the features. |

What survives the cut is the part of the plan that directly serves the six-item "Salt's job" test. Phases 0, 1, and 2 (including the E1–E7 enforcement hooks) survive intact. Phase 3 keeps the hook contract and overlays but ships only the reference hook. Phase 4 keeps only replay. Phase 5 keeps only the spec extractions and internal benchmark, plus surfacing the existing threat model.

Net: ~40% reduction in total scope, zero reduction in consumer-visible value.

### 2.2 Phased delivery

The plan is six phases. Phases 0–2 are pre-release polish. Phases 3–5 are the "gold standard" moves. They can ship independently and out of order, but the dependency arrows are real.

```
Phase 0 ── Phase 1 ── Phase 2 ──┬── Phase 3 ── Phase 4
                                └── Phase 5
```

---

### Phase 0 — Beta blockers (1–2 sprints)

**Objective:** make the first-run UX honest and lightweight enough to recommend publicly, AND close the registry coverage gaps that force the model out of bounds.

| Task | Refs | Outcome | Size |
|---|---|---|---|
| 0.1 Split `runtime-inspector-core` into a jsdom-only core and an optional `runtime-inspector-browser` peer. `playwright` becomes a `peerDependencyMeta.optional` of the browser package. `salt-ds runtime inspect --mode browser` lazy-requires it with a clear install hint when absent. | C1 | Cold install of `@salt-ds/cli` drops from ~270 MB to <10 MB. | L |
| 0.2 Make `loadRegistry` return a `Proxy`-backed lazy registry. Each artifact loads on first property touch. Add an in-memory LRU and a `--prefetch` flag for hosts that want eager load. Replace the only-eager call site with `await registry.metadata` etc. | C2 | `salt-ds info` reads <2 MB of JSON instead of 24 MB; warm MCP boot <300 ms on a M-class laptop. | L |
| 0.3 Reconcile public MCP tool surface. Move the four extras (`validate_salt_review_report`, `resume_salt_review`, `persist_salt_context_pack`, `persist_salt_generated_artifact`) behind an opt-in flag (`SALT_MCP_EXPOSE_SUPPORT_TOOLS=1` or constructor option), OR document them as public in `README.md` and `public-api-matrix.md` with explicit `readOnlyHint: false` callouts. | C3 | Documented surface = registered surface, asserted in `createServer.spec.ts`. | S |
| 0.4 Add a `salt-ds doctor --check-install` mode that warns if Playwright was pulled in but no browser-mode usage is detected. | C1 | Self-diagnoses the transitive-dep problem. | S |
| 0.5 Tidy working-tree noise (`chat.json`, `component-category-map.json`). | P1, P2 | Clean branch ahead of public release. | XS |
| **0.6 Registry coverage audit.** Walk every public Salt component, pattern, provider, **and foundation entity** (today: pages with `page_kind: foundation`); assert each appears in `components.json`/`patterns.json` with at least one canonical example (cross-referenced against `examples.json`) and — for patterns — a populated `composition_contract`. Fail CI on gaps. Surface the audit in `salt-ds doctor --check-coverage`. **Coverage spec only**: do not fix gaps in the same PR; the failure list is the input spec for 0.7. | M9, F1, F2, F10 | Closes the single most-cited root cause from the consumer trace. | L |
| **0.7 Close the 0.6 coverage gap list.** Three coordinated pieces, all done **upstream** of the registry per `maintaining-salt-ai-tooling.md` "Core Rule" (docs → category map → build extraction → runtime). **(a) `SaltProviderNext` as a first-class registry entity**: ensure canonical docs + JSDoc on the component carry the full prop schema (`accent`, `corner`, `headingFont`, `actionFont`) and brand defaults so `packages/semantic-core/src/build` extracts it; add the JPM Brand recipe as a canonical example. Do not hand-author the entry in `components.json`. **(b) `composition_contract` as a defined `PatternRecord` field**: pin the shape in `packages/semantic-core/src/types.ts`, document it in `maintaining-salt-ai-tooling.md` "Stable Layers", and teach build extraction to derive it from `composed_of` + pattern docs (do not hand-author into `patterns.json`). **(c) Foundations as first-class entities** that `create_salt_ui` can consult when prompts are theme- or foundation-related: decide the source-of-truth surface (likely a `site/foundation-category-map.json` or a docs-extraction pass over `site/docs/foundations/**`), then have the build emit them with canonical examples. The 0.6 spec should pass with zero changes when 0.7 lands. | M9, F1 | Stops the brand-theme regression that caused turn 8 user correction; turns the 0.6 spec from "intentionally failing" to "green and asserting steady-state." | L |
| **0.8 Canonical-example round-trip test.** For every pattern story file in `packages/core/stories/patterns/**`, run `review_salt_ui` and assert zero findings. Fail the build if a heuristic flags its own canonical reference. | M11, F4 | Eliminates self-contradicting review heuristics. | M |
| **0.8a Close the 0.8 canonical-example gap list.** Direct follow-up to 0.8 (same pattern as 0.6 → 0.7). The failing `packages/mcp/src/__tests__/canonicalExampleReviewRoundTrip.spec.ts` is the input spec; the 9 stories it flags today all come from one over-aggressive heuristic, `composition.nested-interactive-primitives` / `avoid-nesting-interactive-salt-primitives`, which raises a blocking finding on every canonical Menu → Button, Tooltip → Button, and Dialog → interactive composition. Fix shape (do not invent new rules): introduce an allow-list keyed on parent component (Menu, Tooltip, Dialog) so canonical compositions are recognized as intended; gate the allow-list on the **canonical-example round-trip itself** so the next over-aggressive composition rule is caught before it ships. The 0.8 spec must pass with zero blocking findings when 0.8a lands. Do not edit pattern stories to silence the spec — stories are the canonical reference; heuristics flex around them. See `implementation-handoff.md` §8.1 for the per-story file/line gap list. | M11, F4 | Turns the 0.8 spec from "intentionally failing" to "green and asserting steady-state"; closes the trace-leveraged self-contradiction. | M |
| **0.9 Auto-invalidate project context on `install_dependencies` completion.** The runtime should mark cached package state stale so the rerun is one step. Update the action-loop documentation to remove the manual `get_salt_project_context` rerun. | M12, F5 | Three-step install→rerun loop becomes one step. | M |
| **0.10 Tool-selection benchmark.** Add a deterministic eval in `agenticEvals.spec.ts`: given 20 representative consumer prompts, simulate host tool-selection and assert the correct Salt tool is the first one ranked. Audit `toolDefinitions.ts` descriptions for lexical signal strength. | M15, F8 | Stops `tool_search` round-trips before they happen. | M |
| **0.11 Plain-text file-path fallback.** Whenever an assistant-bound response would include an inline file reference, always include the plain-text path alongside it so unrendered chat UIs don't display blanks. | M16, F9 | Fixes the "Created: -  — default Salt team policy" rendering bug. | S |

**Exit criteria:** `time npx -y @salt-ds/cli@latest info . --json` ≤ 3 s cold on a clean Node 22 install; `du -sh node_modules/@salt-ds` ≤ 10 MB; tool list matches docs; **`SaltProviderNext` resolves via `get_salt_entity` with brand prop defaults; every public component, pattern, foundation, and `SaltProviderNext` passes the 0.6 registry-coverage spec with zero gaps; `PatternRecord.composition_contract` is a defined, build-extracted field; every pattern story passes `review_salt_ui` clean; `install_dependencies` flows are one-step end-to-end.**

---

### Phase 1 — Maintainability refactor (2–3 sprints)

**Objective:** make every public-surface file small enough to fit in one head.

| Task | Refs | Outcome | Size |
|---|---|---|---|
| 1.1 Split `packages/cli/src/commands/workflow.ts` into a directory: `commands/workflow/{create,review,migrate,upgrade,shared}/*.ts`. Each workflow ≤ 600 lines; cross-cutting helpers (`confidence.ts`, `notes.ts`, `policy.ts`, `formatting.ts`) extracted. | M1 | No file in `commands/` > 600 lines. | M |
| 1.2 Split `packages/mcp/src/server/toolDefinitions.ts` into `server/tools/<toolName>.ts`. Each tool file owns its Zod input + output schema, description, annotations, executor. `toolDefinitions.ts` becomes a barrel + `TOOL_DEFINITIONS` array. | M1 | One file per tool. | M |
| 1.3 Split `publicContract.ts` and `workflowContracts.ts` per workflow under `semantic-core/src/contract/{create,review,migrate,upgrade,shared}/`. Keep a stable barrel `tools/publicContract.ts` for back-compat. | M1 | No semantic-core public file > 800 lines. | L |
| 1.4 Narrow `semantic-core` `exports`. Replace `./tools/*`, `./build/*`, `./registry/*`, `./validation/*`, `./policy/*` wildcards with named subpaths that mcp/cli actually consume (~12 entries instead of 100+). Add a regression test that fails if a new wildcard reappears. | M2, M3 | Surface auditable in one file; no `./policy` collisions. | M |
| 1.5 Replace the auto-collect "reuse last explicit context" heuristic with explicit reuse rules tied to a `context_lease_id` returned by the previous call. Fail closed when the host did not pass one. | M8 | No implicit cross-request state in MCP tools. | M |
| 1.6 Co-locate tests with their tool: move `packages/mcp/src/__tests__/<tool>.spec.ts` next to `server/tools/<tool>.ts` (or keep `__tests__` but match 1-to-1). | M1 | Test discoverability matches code structure. | S |
| 1.7 Document `runCli` argv contract, exit codes, IO surface in both READMEs. Mark the function as part of the v1 root API. | M7 | One-paragraph contract per package. | XS |
| 1.8 Add `get_salt_entities({ names: string[], include?: Section[] })` batch lookup. Update the skill to prefer the batch form when ≥2 entities are needed. Add a regression test that asserts a single batch call replaces N individual calls in the canonical create flow. | M13, F6 | Cuts median create-turn round-trips ~30%. | M |

**Exit criteria:** every `.ts` file in `packages/{mcp,cli,semantic-core}/src` is < 800 lines; `semantic-core/package.json` exports list has ≤ 15 entries; CI test for non-wildcard exports.

---

### Phase 2 — Consumer confidence (1–2 sprints)

**Objective:** make the contract auditable, version skew impossible, and failure modes self-explanatory.

| Task | Refs | Outcome | Size |
|---|---|---|---|
| 2.1 Add `salt-ds doctor --check-compat` that compares the installed CLI version, MCP server version (queried over stdio), skill version (read from `.salt/skill-version` or queried), and the registry hash. Surface a single "compatible / drift / incompatible" verdict and an exact upgrade command on mismatch. | M4 | A consumer can tell in one command whether their stack is coherent. | M |
| 2.2 Add a runtime version-gate inside `createSaltMcpServer`: if a host requests a contract version newer than the server supports, return a structured `{error: "contract_unsupported", expected, actual, upgrade_hint}` instead of pretending to comply. | M4 | Honest failure replaces silent skew. | S |
| 2.3 Trim the skill. Move always-loaded prose to a single 80-line `references/shared/core.md`. SKILL.md becomes a thin router (~60 lines) that names workflows and points to references. Convert `skillContracts.spec.ts` from text-match assertions to structural checks (frontmatter, ToC entries, link integrity) plus one or two semantic-level checks. | M5 | Per-invocation skill context drops from ~250 to ~60 lines; rewording the skill stops breaking tests. | M |
| 2.4 Simplify the agent-facing action vocabulary. Collapse `tool_call`, `retrieve_entity`, `retrieve_examples`, `rerun_workflow`, `fix_context` into a smaller `wait_for` family with a `reason` discriminant. Keep `ask_user`, `install_dependencies`, `bootstrap_repo`, `implement`, `complete`, `review` as distinct because they have host-side semantics. Net: 12 kinds → 7. Provide a compatibility shim that emits the old 12 for one minor version. | M6 | Fewer ways to mis-handle an action; existing hosts keep working. | M |
| 2.5 Publish a public migration guide that maps `salt_workflow_v1` fields to host behavior, with copy-pastable handlers for VS Code Copilot, Claude Code, Cursor, Codex, Windsurf. | M6, G5 | Reduces host-side variance. | S |
| 2.6 Publish a SemVer + contract-version policy: how often `salt_workflow_v1` may change, when v2 would ship, deprecation windows for retired fields. Encode it as `capability_manifest.contract_lifecycle`. | M4 | Consumers can plan around it. | S |
| 2.7 Add reproducible registry build verification: the build computes a content hash; `loadRegistry` records it; `info --json` surfaces it; CI publishes a signed `registry-hash.txt` per release. | W5 | Detect registry corruption or tampering. | M |
| 2.8 Add opt-in usage telemetry behind `SALT_TELEMETRY=1`. Only counts: workflow name, status, transport, contract version, duration. No paths, no payloads. Documented threat model. | G5 | Calibrate confidence (Phase 4 input). | M |
| **2.9 Split `status: partial` into two concepts.** Keep `partial` for legitimate user-facing remaining work. Introduce a separate top-level `internal_limitations: { unsupported_claim_count, unsupported_rule_kinds[] }` block for registry/validator gaps. A clean run with internal limitations is now `status: success, internal_limitations: { … }`. Update `salt_workflow_v1` contract changelog, capability manifest version, and skill prose. | M10, F3 | Stops user-facing "partial" confusion when the only issue is internal validator coverage. | M |
| **2.10 Theme-aware `create_salt_ui`.** When the prompt is theme-ambiguous and the repo has no declared theme provider, emit `action.kind: ask_user` with a single targeted question: "stable `SaltProvider` (base theme) or `SaltProviderNext` (JPM Brand)?" Surface the registry-backed prop defaults in the question. | M14, F7 | Pulls theme decisions to turn 1, not turn 8. | M |
| **2.11 Plain-text path fallback** (moved from Phase 0.11 as a contract-version-aligned change). | M16, F9 | Already listed at Phase 0; restate as the contract change that guarantees it. | XS |
| **2.12 `PostToolUse` agent hook** — extend the existing CLI, don't add a new surface. Ship a `--hook` flag on `salt-ds review` that reads the VS Code agent hook JSON via stdin, runs review on the relevant edited files, exits 2 with structured findings on stderr so the agent self-corrects in-loop, or exits 0 with no body when clean. `bootstrap_salt_repo --add-agent-hooks` writes `.github/hooks/salt.json` calling `npx salt-ds review --hook`. Same JSON format works in Claude Code and Copilot CLI. Spec: <https://code.visualstudio.com/docs/agent-customization/hooks>. (Rev 2: replaces the rev-1 idea of a separate `salt-ds hook <event>` subcommand — overreach per §2.1.5. The `--hook` flag is one small addition to an existing command, not a new product surface.) | E1 | Strictly better than pre-commit: closes the agent-skipped-review gap (turns 2, 7, 8 in the trace) inside the agent's loop. | S |
| **2.13 CI required check.** New CLI mode `salt-ds review --since <ref>` for diff-since-ref. `bootstrap_salt_repo --add-ci-checks` writes `.github/workflows/salt-review.yml` (and a GitLab variant) that fails the PR build on blocking findings. Last line for non-VS-Code hosts and hook bypasses. | E2 | Cross-host server-side enforcement: bypassable only by repo admin. | S |
| **2.14 ~~Editor save hook~~ — dropped.** `PostToolUse` covers agent edits; VS Code's built-in save-task system covers human edits. | E3 (was) | Avoids redundant enforcement. | — |
| **2.15 Agent provenance attestations** integrated with the same `--hook` flag. When `salt-ds review --hook` is invoked from `PostToolUse`, it writes `.salt/attestations/<hash>.json` recording registry hash, evidence refs, files touched, hashes after edit, `post_action_ran`. A `Stop` hook calls `salt-ds review --hook --verify-attestations` to confirm attestations match committed file hashes before letting the session end. CI also calls `salt-ds review --verify-attestations` standalone. Write side of Phase 4.1 replay. | E4 | Closes "agent claimed to review but didn't." | L |
| **2.16 Policy-driven escalation** reuses the same `--hook` flag. When `salt-ds review --hook` detects a `PreToolUse` event (via `hookEventName` in the stdin payload), it reads `.salt/team.json` `require_human_review_for: [{kind, reason?, scope?}]` and emits `{hookSpecificOutput: {permissionDecision: "ask"}}` for matching edits *before* they happen. CI (2.13) blocks matching PRs unless they carry `salt-human-reviewed` label. | E5 | Enterprise high-risk pattern enforcement at the source. | M |
| **2.17 `SessionStart` context injection** as a `--hook` flag on `salt-ds info`. Reads hook JSON, returns `{hookSpecificOutput: {additionalContext: "…"}}` summarizing the repo's Salt setup (registry version, declared policy, available patterns, MCP availability). Replaces a chunk of always-loaded skill/`AGENTS.md` prose with per-session context. | E6, M5 | Reduces context tax per turn; makes `AGENTS.md` shrinkable. | S |
| **2.18 Shared hook-IO helper** in `packages/cli/src/lib/hookIO.ts`. Internal-only module that both `review --hook` and `info --hook` use for stdin parsing, output formatting, and exit-code mapping. Not exported, not a public surface — just deduplication. | E7 (refactored) | Single place to track hook spec changes. | S |

**Exit criteria:** version skew between any two layers is detected within 1 command; skill payload per turn ≤ 80 lines of always-loaded text; capability manifest carries `contract_lifecycle`.

---

### Phase 3 — Extension and hooks (3–4 sprints)

**Objective:** stop being the only thing that can run inside a Salt workflow.

The design moves from "Salt is the workflow" to "Salt is a workflow runtime that ships a high-quality default workflow."

#### 3.1 The Salt config file

Introduce `salt.config.ts` (with `.js`/`.mjs`/`.json` variants), discovered from `root_dir`:

```ts
import { defineSaltConfig } from "@salt-ds/cli";

export default defineSaltConfig({
  hooks: [
    "./hooks/internal-policy-resolver.ts",
    "./hooks/jest-evidence.ts",
  ],
  registry: {
    overlays: ["./internal-registry-overlay"],
  },
  telemetry: { mode: "anonymous" },
});
```

Loaded once per session, validated by Zod, exposed read-only to every workflow call.

#### 3.2 The hook contract

```ts
export interface SaltHook {
  name: string;
  on: SaltHookEvent[];
  handler: (ctx: SaltHookContext) => Promise<SaltHookResult> | SaltHookResult;
}

export type SaltHookEvent =
  | "workflow:before"          // mutate inputs, add evidence, short-circuit
  | "workflow:after"           // observe result, add notes, never mutate decision
  | "evidence:resolve"         // contribute a custom EvidenceItem
  | "policy:resolve"           // contribute a project-policy layer (e.g. internal config service)
  | "validator:register"       // register a Salt-validation rule
  | "starter:transform"        // transform generated starter code (e.g. prettier, codemods)
  | "review:contribute"        // add a fix candidate or issue class
  | "transport:onRequest"      // logging/telemetry observer (read-only)
  | "transport:onResponse";    // logging/telemetry observer (read-only)
```

Rules:

- Hooks are pure: same inputs produce same outputs; non-determinism makes the result non-reproducible and the workflow refuses to mark `evidence.status: complete`.
- A hook can *add* evidence and validation findings but cannot weaken `safety` or `evidence.status`. The gate is a one-way valve.
- Hook failures are isolated: a failing hook degrades to a recorded `hook_error` in `evidence.notes`; the workflow continues.
- All hook contributions show up in `workflow.provenance.contributors` so consumers can audit who said what.

#### 3.3 First-party reference hook (one, not five)

**Rev 2 scope cut.** Rev 1 proposed five first-party hook packages (`@salt-ds/hook-eslint`, `-vitest`, `-storybook`, `-figma-mappings`, `-internal-policy`). That made Salt a plugin-ecosystem manager — overreach per §2.1.5.

Rev 2 ships **one** reference hook:

| Hook | What it does | Why first-party |
|---|---|---|
| `@salt-ds/hook-eslint` | Folds ESLint findings into review evidence with mapped rule IDs. | Most repos already run ESLint. Serves as the canonical worked example for the contract. |

The Vitest / Storybook / Figma / internal-policy hooks **are not Salt's job to ship**. Once the hook contract is stable and the eslint hook demonstrates the pattern, those communities (or your own teams) can implement them as independent packages. Document the contract; don't operate the ecosystem.

#### 3.4 Registry overlays

Currently the registry is a single bundled snapshot. Add `registry overlays`:

- A directory of JSON files with the same artifact shape as `generated/`.
- Loaded *after* the core registry and merged with `last-writer-wins on name`.
- Useful for: a private design-system extension (`@acme/salt-extensions`), a lab/preview registry, or per-team overrides not suitable for `.salt/team.json`.
- Each overlay declares a `provenance.source` URL that flows into `evidence.items[].source_urls`.

(Rev 1 framed overlays as the path to a multi-DS host. Rev 2 drops that framing per §2.1.5 — overlays are for private/lab/team extensions of Salt, not for hosting other libraries' registries.)

#### 3.5 Output for Phase 3

| Task | Outcome | Size |
|---|---|---|
| 3.1 `salt.config.ts` discovery + Zod schema. | One typed config per repo. | M |
| 3.2 Hook contract and runtime in `semantic-core`. | Pluggable runtime, isolation, provenance. | L |
| 3.3 `@salt-ds/hook-eslint` (single reference hook). | Worked example; pattern others can follow. | M |
| 3.4 Registry overlay loader. | Private DS extensions without forking. | M |
| 3.5 New `salt.config.example.ts` and docs page. | Discoverable for consumers. | S |

**Exit criteria:** a consumer can add `@salt-ds/hook-eslint` to `salt.config.ts` and see ESLint findings appear in `review` output without modifying Salt source.

---

### Phase 4 — Determinism (rev 2: replay only)

**Objective:** make every Salt workflow result reproducible from inputs + registry hash.

Rev 1 of this phase proposed five capabilities (streaming, replay, calibrated confidence, OpenTelemetry spans, vision adapter). §2.1.5 cuts four of them. What remains is the one capability that directly serves the "reproducibility" guiding principle and serves multiple consumer needs at once.

#### 4.1 Determinism and replay (the only shipped Phase 4 work)

- Every workflow call produces a `trace_id` and writes a `.salt/traces/<id>.json` (opt-in or always-on per config).
- A trace bundles: inputs, registry hash, hook list + hashes, evidence items, final result.
- `salt-ds replay <trace_id>` re-runs deterministically; CI mode diffs the result and fails on drift.
- The trace substrate also serves E4 attestations (Phase 2.15) and consumer-side regression testing — same engine, three uses.

#### 4.2 Contract-only additions (no Salt-shipped code)

These are published as part of `salt_workflow_v1` so hosts that want them can wire them up, but Salt does not ship the runtime:

| Item | What ships | What does **not** ship |
|---|---|---|
| Streaming | `SaltStreamEvent` shape in the contract spec. NDJSON `--stream` flag added to CLI as a thin wrapper around `trace_id` chunking. | A Salt-managed streaming runtime. |
| Workflow observability | `trace_id` in every result. | A Salt-defined span format; OpenTelemetry already has one. |
| Calibrated confidence | Opt-in telemetry collection (already in Phase 2.8). Salt **publishes the aggregated data**; consumers/hosts/future PRs do the calibration math. | A Salt-operated calibration service or scoreboard. |
| Vision-to-evidence | `migrate_visual_evidence_v1` contract (already exists). A documented adapter pattern and one example in `workflow-examples/`. | A Salt-shipped `@salt-ds/visual-adapter-*` package. Vision is the host's job. |

#### 4.3 Output for Phase 4

| Task | Outcome | Size |
|---|---|---|
| 4.1 Trace + replay. | Reproducibility shipped as a feature. | L |
| 4.2 Contract additions for streaming, observability, calibration, visual evidence. | Hosts/community can build on these without Salt operating them. | S |

**Exit criteria:** any workflow result has a `trace_id`; `salt-ds replay <id>` produces an identical result; `salt_workflow_v1` advertises the `SaltStreamEvent` shape and references the `migrate_visual_evidence_v1` contract.

---

### Phase 5 — Specs and small consumer-confidence items (rev 2)

**Objective:** publish Salt's best work as standalone specs others can implement, surface the existing threat model, and ship the small consumer-confidence items the trace surfaced. Drop the items that would make Salt a workflow-runtime business.

Rev 1 named Phase 5 "Open standards and ecosystem" with seven tasks including a public benchmark scoreboard, an LSP-style adapter, and a multi-DS host. §2.1.5 cuts 5.6, 5.7, and the public-scoreboard half of 5.4.

| Task | Refs | Outcome | Size |
|---|---|---|---|
| 5.1 Extract `project_conventions_v1` schema into a standalone published JSON Schema spec at a stable URL (`https://salt-ds.dev/schemas/project-conventions/v1`). Versioned, citeable, library-neutral. **Includes an explicit schema-evolution policy** (additive-within-major, ignore-unknown-additive, documented migration command). | W2, +schema-evolution | MUI / Chakra / in-house DS teams can adopt the same schema and the same `.salt/team.json` shape without silent drift. | M |
| 5.2 Extract `migrate_visual_evidence_v1` to the same docs site as a portable spec. Reference adapter pattern + worked example in `workflow-examples/` (no Salt-shipped adapter package). | W2 | Adapter ecosystem can grow outside Salt. | S |
| 5.3 Extract `salt_workflow_v1` to the same site as the "Workflow-aware DS Contract." **Author-only**: publish the spec, don't run relationship work to coerce another DS into adopting it. If adoption happens, it happens. | W1 | Salt becomes the spec author. | M |
| 5.4 Publish the internal benchmark **protocol and scoring methodology** at `salt-ds.dev/bench`. Run it against Salt's own release pipeline for regression detection. **No public scoreboard**; that's PR work and turns into the wrong product motion. | W3 | Reproducible internal regression suite, citeable methodology. | M |
| 5.5 Surface the existing threat model (`ai-tooling-security-threat-model.md`) at the same docs status as the public-API matrix. Already substantially written (166 lines, covers prompt-injection, trust boundaries, MCP best-practice references); needs publishing-pass polish. | G5 | Enterprise procurement story without new engineering. | S |
| 5.6 Docs hub: add `packages/mcp/docs/README.md` as the maintainer index. ~12 docs now live there; a landing page with reading order is overdue. | from session-findings followup #5 | One-page index. | XS |
| 5.7 `salt-ds uninstall` — cleanly removes the files `bootstrap_salt_repo` added. Five-minute fix, large psychological win. | followup #6 | Consumers can back out without manual cleanup. | XS |
| 5.8 Cross-IDE custom-agent format normalization. **Only if `salt-ui.agent.md` survives F11 as Option B** (the discovery shim). Bootstrap detects host capabilities and writes the appropriate format (VS Code `.agent.md`, Claude Code subagent dir, Cursor `.cursor/rules`, etc.) from one canonical source. | followup #9 | Hosts get the right shim; Salt maintains one source. | M |
| 5.9 `registry_staleness_warning` in `info --json` and capability manifest when `registry_generated_at` exceeds N days. | followup #13 | Consumers learn they're running stale Salt knowledge without digging. | XS |

---

## Part 3 — Cross-cutting Architectural Changes

These are not phase-bound; they affect everything.

### 3.1 Shared transport substrate (not "workflow runtime")

Create `@salt-ds/workflow-runtime` (private, bundled like semantic-core) that owns:

- `runWorkflow(input, { transport, hooks, registry, config })`
- The action loop
- Hook orchestration
- Trace recording

Both `@salt-ds/mcp` (the SDK adapter) and `@salt-ds/cli` (the CLI adapter) become ~200-line shells over this substrate. This kills residual duplication in `workflow.ts`.

**Framing note (rev 2):** call this a "shared transport substrate" in docs and READMEs. Rev 1 called it a "workflow runtime" — that framing implies Salt is extending into being a runtime product consumers build on (cf. LSP adapter, multi-DS host). Both cut per §2.1.5. The package exists to deduplicate transport code, not to be a product surface.

### 3.2 Registry as a typed service

Replace the "load everything, query the object" pattern with a `SaltRegistryService` interface:

```ts
interface SaltRegistryService {
  metadata(): Promise<RegistryMetadata>;
  component(name: string): Promise<ComponentRecord | null>;
  components(filter: ComponentFilter): AsyncIterable<ComponentRecord>;
  searchDocs(query: string, area?: Area): AsyncIterable<SearchHit>;
  // …
}
```

Default implementation = file-backed lazy loader. Easy to write a `MockRegistryService` (tests). All consumers go through the interface.

(Rev 1 also listed a `RemoteRegistryService` to support the dropped multi-DS host. Removed in rev 2.)

### 3.3 Workflow result builders → state machine

`buildCreatePublicContract` et al. compute the result from a flat input. Replace with an explicit state machine per workflow:

```ts
const machine = createReviewMachine()
  .step("resolve-context")
  .step("source-validation")
  .step("runtime-evidence?")
  .step("policy-merge")
  .step("issue-classification")
  .step("fix-candidates")
  .step("publish");

const result = await machine.run({ input, hooks, registry });
```

Pros:

- Each step is its own tested unit (today they are intermingled in 2000-line builders).
- Hooks attach to named steps.
- Traces and streaming events fall out for free (one event per step boundary).
- Replaces ~50% of the `publicContract.ts` and `workflowContracts.ts` size.

### 3.4 React-style "hooks" inside the runtime

For the agent-facing skill side, introduce a small composable API that mirrors the React hooks idea inside the workflow code:

```ts
function reviewWorkflow(input: ReviewInput) {
  const ctx = useContext();                      // repo context, lease, transport
  const registry = useRegistry();
  const policy = usePolicy(ctx);                 // layered .salt resolution
  const evidence = useEvidence("source-files", () => analyzeSource(input.files));
  const runtime = useOptionalEvidence("runtime", input.url, fetchRuntime);
  return useResult(buildReviewContract, { evidence, runtime, policy });
}
```

Each `use*` is a thin function that:

- caches its work inside one workflow invocation
- records its provenance into the result
- emits a span (Phase 4.4)
- can be intercepted by a hook

This is what makes the runtime feel "modern" and is what the `hooks or other things that will make this the next level` request implied. It is a real engineering investment but unlocks the rest of the plan.

---

## Part 4 — Sequencing summary (rev 2)

| Quarter (rough) | Phases | Theme |
|---|---|---|
| Q3 2026 | Phase 0, start Phase 1 | "Public-ready beta" |
| Q4 2026 | Finish Phase 1, Phase 2 (incl. E1–E7 hooks) | "Stable 1.0 with enforcement" |
| Q1 2027 | Phase 3 (contract + overlays + one reference hook), Phase 5.1–5.2, 5.5–5.7, 5.9 | "Extensible runtime + specs + small confidence items" |
| Q2 2027 | Phase 4.1 replay, Phase 5.3, 5.4, 5.8 | "Reproducibility + spec authorship" |
| Q3 2027+ | Maintenance, registry coverage, telemetry calibration once data is real | "Calibrated and steady" |

(Rev 1 listed Q4 2027+ as "workflow runtime as standard" via the dropped 5.6/5.7 items. Removed.)

---

## Part 5 — Risk register

| Risk | Mitigation |
|---|---|
| Refactor churn breaks consumers mid-flight. | Keep `publicContract.ts` barrel for one minor version after Phase 1 split. Snapshot tests of the public envelope. |
| Hooks let third parties weaken safety. | One-way valve: hooks can lower `evidence.status`/`safety` to a more conservative value but cannot raise them. Asserted by tests. |
| Streaming adds protocol complexity. | Default is non-streaming; streaming is contract-only (`SaltStreamEvent` shape published, hosts wire up if they want). |
| Telemetry alarms enterprise consumers. | Opt-in, payload-free, threat-model published, can be replaced by self-hosted collector. |
| Calibrated confidence requires data we don't have. | Telemetry first; calibration math is something consumers/hosts/future PRs can do once data exists. Confidence stays heuristic and is labeled as such in the manifest until that's true. |
| **Scope drift.** Each "small addition" looks defensible in isolation; the cumulative effect turned rev 1 into ~60 items. | **§2.1.5 is the gate.** Any new proposal that doesn't pass the six-item "Salt's job" test goes in Appendix B, not the plan. Quarterly scope review against the rule. |
| **Specs that no one implements.** Phase 5.1–5.3 publishes specs without engineering adoption. | Frame as "author-only" — Salt's value is being the reference implementation. Adoption is a benefit, not a target. |

---

## Part 6 — How we measure success

These are the metrics the gold-standard plan should move:

| Metric | Today (estimated) | Phase 2 target | Phase 4 target |
|---|---|---|---|
| Cold install size of `@salt-ds/cli` | ~270 MB (with Playwright) | ≤ 10 MB | ≤ 8 MB |
| `salt-ds info` p50 latency | ~2–3 s | ≤ 800 ms | ≤ 500 ms |
| MCP boot p50 | ~1–2 s | ≤ 500 ms | ≤ 300 ms |
| Largest source file in `packages/{cli,mcp,semantic-core}/src` | 3,337 lines | ≤ 800 lines | ≤ 500 lines |
| Public MCP tool count: documented vs registered delta | 9 vs 13 | 0 | 0 |
| Always-loaded skill prose per agent turn | ~250 lines | ≤ 80 lines | ≤ 60 lines |
| Public action kinds (host branching surface) | 12 | 7 | 7 |
| Hosts with verified compat (skill+MCP+CLI+registry aligned) | manual | automatic via `doctor --check-compat` | automatic + telemetry-confirmed |
| Confidence calibration | heuristic, unlabeled | labeled as heuristic | calibrated against telemetry |
| First-class extension points | 0 | 0 | ≥ 9 documented hook events |
| Streaming-capable workflows | 0 | 0 | contract published; host-implementable |
| Reproducible workflow replay | no | no | yes, via `salt-ds replay` |
| ~~Compatible third-party DS using `salt_workflow_v1`~~ | — | — | **dropped rev 2** — Salt is the spec author; adoption is a benefit, not a target. |
| **Registry coverage: public Salt entities with canonical example** | partial (turn-1 trace gaps) | 100% asserted in CI | 100% |
| **User-corrected turns in a representative consumer session** | 2 of 9 (trace) | 0 of 9 | 0 of 9 |
| **Self-contradicting review heuristics** | 1 of 9 (trace) | 0 (CI-guarded) | 0 |
| **Median Salt MCP round-trips per create turn** | 19 (trace) | ≤ 8 with batch lookup | ≤ 5 with batch + streaming |

---

## Appendix A — File-level pointers for Phase 1

For the refactor to be safe, the split needs to happen in this order:

1. `packages/semantic-core/src/contract/` — new directory, move types only first.
2. `packages/semantic-core/src/tools/publicContract.ts` becomes a barrel re-export.
3. `packages/cli/src/commands/workflow/` — extract one workflow at a time, run `workflowScenarios.spec.ts` between each.
4. `packages/mcp/src/server/tools/` — extract one tool at a time, run `tools.spec.ts` and `createServer.spec.ts` between each.
5. Narrow `semantic-core` exports last, after all consumer paths are confirmed.

Each step lands as its own PR; no PR may grow a touched file's line count.

## Appendix B — What we explicitly will not do

The original five (rev 1):

- **No prompt-to-page generation.** v0 owns that space; competing dilutes the product.
- **No hosted Salt service.** Salt stays a local tool consumers run inside their repos.
- **No pixel parsing in core.** Visual evidence always arrives normalized via the documented contract or an adapter.
- **No agent-only summary docs.** If something matters, it goes in canonical docs and is extracted, per `maintaining-salt-ai-tooling.md`.
- **No silent contract changes.** Every change to `salt_workflow_v1` ships with a manifest version bump and a migration note.

Added in rev 2 (scope-discipline cuts; see §2.1.5):

- **No plugin ecosystem operation.** Ship the hook contract and one reference hook (`@salt-ds/hook-eslint`). The Vitest, Storybook, Figma, internal-policy hooks are not Salt's job to ship. The community implements them once the contract is stable.
- **No Salt-shipped vision adapter.** Vision is the host's job (Copilot, Claude Code, GPT all have vision models). Salt's contribution is the `migrate_visual_evidence_v1` contract.
- **No Salt-operated calibration service.** Collect opt-in telemetry; publish the aggregated data; let consumers / hosts / future PRs do the calibration math. Don't bind Salt's identity to running a scoreboard.
- **No Salt-defined observability span format.** OpenTelemetry already has one. Salt ships `trace_id` in results.
- **No Salt-managed streaming runtime.** Streaming is contract-only: publish the `SaltStreamEvent` shape so hosts that want it can wire it up.
- **No LSP-style protocol adapter.** MCP has won. JetBrains, VS Code, Cursor, Claude Code, Codex, Windsurf, Copilot CLI all speak it.
- **No multi-DS host.** Salt should not host MUI's or Chakra's registries. If multi-DS happens, it happens in a separate community project that adopts the spec.
- **No public `salt-ds-bench` scoreboard.** Publish the benchmark protocol and methodology. Use it internally. A public leaderboard turns into PR work and "Salt vs MUI" marketing — wrong product motion.
- **No `.salt/edit-sets/` rollback system.** Git already solves this. Attestations (E4) record what was touched; `git revert` is the recovery tool.
- **No multi-tenant MCP runtime.** Stated as a one-line spec rule ("MCP is single-tenant per process"). Hosted Salt-as-a-service is a different product.
- **No token-cost surfacing, bad-guidance feedback infrastructure, or non-React framework support.** Host territory, existing channel (GitHub Issues), and out-of-scope-by-design respectively. Document the boundaries; don't build the features.
- **No relationship work as engineering scope.** Phase 5.3 publishes `salt_workflow_v1` as a spec; getting other DS teams to adopt it is not a deliverable. If it happens, it happens.

**The rule that produced these cuts:**

> Can the host own it? Can git own it? Can the model own it? Can the community own it?
> If yes to any, Salt doesn't ship it.

When a proposed addition doesn't pass that test, it belongs in this appendix, not in a phase.

---

*End of roadmap.*



























