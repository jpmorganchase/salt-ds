# Implementation Handoff — Prompts, Copilot Settings, and Session Plan

Status: working tracker for Phase 0 → Phase 2 implementation work. The roadmap is the source of truth for scope; this doc only sequences PRs and provides paste-ready prompts.
Date: 2026-06-09
Companion to: `gold-standard-roadmap.md`, `session-findings-2026-06.md`

Use this as a printable cheat sheet when starting each PR. Each section is paste-ready. When a PR lands, mark its row in §2 done so the next maintainer knows where to pick up.

> **Revision history**
>
> - **2026-06-10 rev 10:** Picks up the roadmap **rev-3 foundation-strict pass** (`gold-standard-roadmap.md` revision history rev 3 + new §2.1.6 cut table + new §2.1.7 flag-budget rule). Tracker-only changes: (a) **Expanded PR 8 (task 2.13) scope** to also remove the already-shipped CI-YAML emitter from `packages/semantic-core/src/bootstrapScaffolding.ts` and the `SALT_REVIEW_HUMAN_REVIEWED_LABEL` bleed into `packages/semantic-core/schemas/project-conventions.schema.json` (roadmap task **0.5b**, folded into lean PR 8). The new PR 8 scope is: back out the rev-7 CLI surface (per §8.6) + remove the bootstrap CI emitter (0.5b) + surface `require_human_review_for` as ordinary blocking findings + add `packages/cli/docs/ci-integration.md` + add `workflow-examples/consumer-repo/.salt/team.json` example. (b) **Added PR 20** for roadmap task **0.12** (published-schema vendor-name regression test — makes the schema-leak class impossible going forward). (c) **Added PR 21** for roadmap task **1.1b** (shrink `init.ts` from 895 lines to <500; mostly falls out of 0.5b's CI-YAML removal, with minor extraction of the remaining init concerns). (d) **Bumped PR 11 (task 2.3 skill trim)** ahead of PRs 15–18 in the recommended-order column — the skill is growing (2,383 lines / 39 files vs. M5's 2,335 / 36 baseline) while every Phase 2 item that touches skill prose adds more. Land 2.3 before further skill prose. (e) Updated PR 17 (task 2.15 attestations) note to reflect the rev-3 narrowing: ship the attestation **payload** as a published Zod schema, emit on stdout when `--emit-attestation` is set; the `.salt/attestations/<hash>.json` on-disk layout becomes a demo default in `workflow-examples/`, not a Salt foundation commitment. (f) Updated PR 19c (task 1.3) note to point at the rev-3 cross-cutting §3.3 narrowing (pure async functions, no state-machine DSL); the rev-2 `.step()` chain is no longer the target shape.
> - **2026-06-10 rev 9:** Tracker maintenance pass against the live working tree (no source-code changes). (a) Re-snapshotted mega-file line counts in the §2 PR 19 row — `workflow.ts` is now **3,913 lines** (the rev-6 audit cited 3,350; the rev-8 reading cited 3,350; both stale by +576), `toolDefinitions.ts` is **2,051 lines** (rev 6 cited 2,222 "after PR 9 work"; the actual current value is below that because §8.5's PR 12 revert pulled the file back to its 3b1118187 baseline). (b) **Split §2 PR 19 into three rows (19a / 19b / 19c)** — one per Phase 1 task (1.1, 1.2, 1.3) — so each split can be marked done independently and so the row-level status column matches reality. (c) **Expanded §8.6 back-out list with the two files the rev-8 enumeration missed:** `packages/semantic-core/src/bootstrapScaffolding.ts` (8 SALT_REVIEW... hits; the writer that emits the CI YAML, so the env-var name survives in newly-bootstrapped consumer repos until it's removed) and `packages/semantic-core/schemas/project-conventions.schema.json` (1 hit in the `require_human_review_for` description that documents the env-var as the bypass mechanism in the published JSON Schema). Also added a missing entry for `packages/cli/README.md` (1 hit). (d) **Rewrote §8.6 anchors as `git grep` patterns + symbol excerpts** rather than line numbers; the line numbers were uncommitted-edit anchors that would shift the moment anything else touched the files, but the symbols (`resolveSinceDiff`, `addCiChecks`, `gitlabSnippet`, `SALT_REVIEW_HUMAN_REVIEWED_LABEL_ENV_VAR`, `setupSinceFixtureRepo`) are stable. (e) Updated §0 "If you're in IntelliJ" paragraph to reflect that PR 2 landed Option C (conditional opt-in, default no-write) rather than the dropped Option A. (f) Removed an orphan "End of handoff." line that was stranded between §8.4 and §8.5 from a pre-rev-5 layout, and added one at the actual end of the doc. (g) Companion roadmap edit: `gold-standard-roadmap.md` §1.3 M1 row had `projectContext.ts` cited at a path that no longer exists (`packages/semantic-core/src/tools/projectContext.ts`); the file actually lives at `packages/mcp/src/server/projectContext.ts` and is still 1,335 lines. Also added a snapshot-date stamp to M1 since the count drift is now in three of seven cited files, and tightened the Phase 0 exit criterion so the "every pattern story passes `review_salt_ui` clean" line is attributed to 0.8a (its actual outcome) rather than 0.8 (which ships the failing spec).
> - **2026-06-10 rev 8:** Redesigned PR 8 (task 2.13) after a maintainer review concluded the rev-7 prompt over-extended the CLI surface — it drove a `--since` flag, an `--add-ci-checks` init option that writes opinionated CI files at canonical paths, and a `SALT_REVIEW_HUMAN_REVIEWED_LABEL` env var the CLI reads to flip its own exit code. Rev 8 swaps all three for a single composable primitive: `require_human_review_for` violations surface as ordinary blocking findings on `salt-ds review <files...>`, CI does diff-mode in a 5-line shell snippet wired in by the consumer, and a new `packages/cli/docs/ci-integration.md` documents the composition. §8.4 is folded into the lean PR 8 scope (the deferred `team.json` example closes there). New **§8.6** lists the in-flight CLI surface that was scaffolded in the working tree under the rev-7 prompt and needs to be backed out before PR 8 lands. No source-code changes in this rev; the tracker now points at the lean design.
> - **2026-06-10 rev 7:** Authored the two §3 paste-ready prompts that had been deferred since rev 3 — **PR 8 (task 2.13: CI required check + E2)** and **PR 9 (task 2.9: split `status: partial` into `partial` + `internal_limitations`)**. PR 8's prompt also folds in the §8.4 cleanup (the CI-side label gate that PR 18 left half-done waiting on `salt-ds review --since`), so closing both lands together. The "deferred prompt" note between PR 7 and PR 10 is replaced with a forward-pointer to PR 18's §8.4 cleanup. No code changes. **Superseded in part by rev 8** — the PR 8 prompt in §3 is now the rev-8 lean version; the rev-7 design is preserved in §8.6 as the back-out list.
> - **2026-06-10 rev 6:** Full audit pass against the live working tree (no source-code changes; tracker-only). Marked PRs 4, 5, 6, 7, and 12 ✅ Done (their code, tests, and untracked artifacts are all on the branch — they had simply never been ticked off in §2). Marked PR 10 (task 0.7) and PR 18 (task 2.16) ⚠️ Partial with the specific subtasks that remain. PR 19 (Phase 1 mega-file splits) explicitly noted as not started — `workflow.ts` is 3,350 lines (slight growth) and `toolDefinitions.ts` is 2,222 lines (grew with 0.9 work). Roadmap task **0.5** (tidy `chat.json` + `component-category-map.json`) flagged in §8.3 as partly done. Confirmed the four pre-existing failures recorded in §8.2 still reproduce.
> - **2026-06-09 rev 5:** PRs 13 (task 0.10) and 14 (task 0.8) marked ✅ Done with commit anchors. New §8 "Known follow-ups" added capturing (a) the 0.8 `composition.nested-interactive-primitives` heuristic-repair gap list surfaced by the new canonical-example round-trip spec, (b) pre-existing `publicContractParity.spec.ts` upgrade/migrate semantic mismatches discovered while verifying 0.10, and (c) the pre-existing `agenticEvals.spec.ts > falls back to component routing` reproducible failure. Companion roadmap change: `gold-standard-roadmap.md` row **0.8a** added (the explicit follow-up to 0.8, mirroring the 0.6 → 0.7 chain).
> - **2026-06-09 rev 4:** Audit pass against the live repo. PR 1 (task 0.3) marked ✅ Done (Option B shipped). PR 2 (F11) reclassified ✅ Done (Option C landed, not the prompt's requested Option A — see `session-findings-2026-06.md` root cause #9 "Decision (2026-06)" for the ratification). PR 2 §3 prompt annotated as superseded. No code or scope change in this rev — just bringing the tracker in line with what's already on `mcp`.
> - **2026-06-09 rev 3:** PR 3 (task 0.6) marked done. §2 table extended with PRs 10–18 covering the remaining Phase 0–2 work (0.7, 0.8, 0.9, 0.10, 0.11/2.11, 1.8, 2.10, 2.15, 2.16) and the §3 paste-ready prompts added in numerical order. Status column added to §2 so future PRs can be marked done in-place. Header status line reframed: this doc is a working tracker for PR sequencing; `gold-standard-roadmap.md` remains the source of truth for scope. §5 budget extended with the PRs 10–18 tranche. Phase 1 mega-file splits moved to row 19 to preserve numerical ordering.
> - **2026-06-09 rev 2:** §0 now covers both IntelliJ and VS Code setup paths. §3 prompts no longer prefix with "Use salt-ds to…" — that framing is a consumer-skill pattern that's wrong for maintainer work on the Salt monorepo itself. §0 and the §6 pre-flight no longer tell you to verify the Salt MCP is loaded: the MCP is not required for this work, and the prompts deliberately don't invoke it. Direct file reads and the existing test suite are the right tools.
> - **2026-06-09 rev 1:** initial handoff.

## 0. One-time Copilot setup

This work is IDE-agnostic. Pick your editor; both paths reach the same end state.

**The Salt MCP is not required for this work.** It's a consumer tool, and the prompts in §3 don't invoke it. If it happens to be configured from other workflows, that's fine — just don't worry about whether it's loaded or which Salt tools it exposes. Direct file reads via the IDE's built-in editor tools and the existing test suite are what these PRs need.

### If you're in IntelliJ (JetBrains Copilot)

1. **Settings → Tools → GitHub Copilot → Chat:**
   - Ensure "Agent mode" is enabled (it's the default in recent builds).
   - Ensure "Use instruction files" / "Use AGENTS.md" is on so the workspace `AGENTS.md` and `.github/copilot-instructions.md` load automatically.
   - If a "Custom agents" or "Experimental features" toggle exists, leave custom agents OFF (PR 2 landed **Option C**: `@SaltUI` is no longer written by default, but the conditional opt-in path is retained for hosts that advertise custom-agent support — IntelliJ doesn't yet, so the default is correct for you).

2. **Chat input controls:**
   - **Mode dropdown** (next to the model picker): set to **Agent** for every PR. Ask mode can't write files; Edit mode is too conservative for multi-file work.
   - **Model picker:** set per PR (see §2 table below).
   - **Custom agent picker (if visible):** leave on the default. Do not select `@SaltUI`.

3. **For hook verification when you reach PR 7 (Phase 2.12+):** JetBrains Copilot may not yet expose VS Code's agent hook spec. Plan to do the hook end-to-end smoke test in VS Code, Claude Code, or Copilot CLI on the same checkout — you don't have to switch your dev environment, just spin one up for the verification step. (See §3 PR 7.)

### If you're in VS Code

`Cmd+Shift+P → Preferences: Open User Settings (JSON)` and confirm:

```jsonc
{
  // Required: lets the agent reach for tools and edit files
  "chat.agent.enabled": true,

  // Required: loads AGENTS.md / .github/copilot-instructions.md / SKILL.md
  // into every session in this workspace
  "github.copilot.chat.codeGeneration.useInstructionFiles": true,

  // Required for hook work later (Phase 2.12+)
  "chat.hookFilesLocations": {
    ".github/hooks": true
  },

  // Recommended: in a monorepo, picks up parent-repo customizations
  "chat.useCustomizationsInParentRepositories": true,

  // Recommended: lets you switch models per request
  "github.copilot.chat.experimental.modelPicker": true
}
```

In the chat input:

- **Mode picker:** set to **Agent** for every PR.
- **Model picker:** set per PR (see §2 below).
- **Custom agent picker:** leave on the default. Do not pick `@SaltUI`.

## 1. Session hygiene rules

Apply these to every PR session:

1. **One PR per chat session.** Start a fresh chat between PRs. Carrying context across unrelated work is the #1 source of agent drift.
2. **Set the model and mode first**, then paste the prompt. The model selector defaults to the last-used model, which is often wrong for the new task.
3. **After the agent's plan, before any edits:** read its proposed plan, push back if it bundles multiple roadmap tasks. Use "Revert that. Do only task X." literally.
4. **Verify tests yourself.** Run `yarn vitest run <path/to/spec>` in a terminal after the agent says it's done. Do not trust the agent's claim that tests passed; the trace shows this is unreliable (turns 2, 7, 8).
5. **Commit per PR.** Don't let work-in-progress from one wedge bleed into the next.

## 2. Per-PR plan

Recommended order. Estimates are wall-clock for a focused session including the verification step.

| # | PR | Model | Mode | Est. time | Premium requests | Status |
|---|---|---|---|---|---|---|
| 1 | **0.3** tool-surface reconciliation | Sonnet 4.5 | Agent | 30 min | Low | ✅ Done (Option B) |
| 2 | **F11** drop `@SaltUI` agent | Sonnet 4.5 | Agent | 45 min | Low | ✅ Done (Option C: host-conditional opt-in; default no-write) |
| 3 | **0.6** registry coverage CI assertion | Opus 4.7 (medium reasoning) | Agent | 1.5 hr | Medium | ✅ Done |
| 4 | **0.4** `doctor --check-install` | Sonnet 4.5 thinking | Agent | 1 hr | Low | ✅ Done (`packages/cli/src/commands/doctor.ts` + cli.spec.ts coverage; all `--check-install` paths pass) |
| 5 | **0.1** Playwright split | **Opus 4.7 High 1M** | Agent | 3–4 hr | High | ✅ Done (new `packages/runtime-inspector-browser/` workspace; `inspectShared.ts` + `inspectLazyLoader.spec.ts` added; `runtime-inspector-core/package.json` peer-deps updated; `scripts/build.mjs` skip-optional-peer logic added; `packagePublishBoundary.spec.ts` updated to assert playwright is **not** bundled) |
| 6 | **0.2** lazy registry loader | Opus 4.7 (medium) | Agent | 2 hr | Medium | ✅ Done (`packages/semantic-core/src/registry/lazyRegistry.ts` + `artifactCache.ts`; `LoadRegistryOptions.prefetch` field; `infoBytesBudget.spec.ts` measures `salt-ds info` at **1.2 KB** of registry artifacts vs. the <2 MB target) |
| 7 | **2.12 + 2.17 + 2.18** `--hook` flags (E1, E6, E7) | Opus 4.7 (medium) | Agent | 3 hr | Medium | ✅ Done (`packages/cli/src/lib/hookIO.ts` internal helper; `--hook` flag on `review` and `info`; `init --add-agent-hooks` writes `.github/hooks/salt.json`; `hookIO.spec.ts` 18/18 + cli.spec.ts hook scenarios pass) |
| 8 | **2.13 + 0.5b** CI required check (E2) + drop bootstrap CI emitter — *lean rev-8 design + rev-10 expansion* | Sonnet 4.5 | Agent | 1.5 hr | Low | ✅ Done (commit `4b4ad4557`, 9 files). Shipped: (i) rev-7 CLI surface backed out (`args.ts`, `init.ts`, `workflow.ts`, `cli.spec.ts`, `cli/README.md`, `bootstrapScaffolding.ts`, `project-conventions.schema.json`) — `sinceDiff.ts` deleted, `ensureSaltCiChecks` + `runReviewSinceCommand` + `SALT_REVIEW_HUMAN_REVIEWED_LABEL_*` + GitHub/GitLab YAML templates + `mergeSaltGitlabCiRoot` + `fileAlreadyHasSaltReviewCi` all removed. (ii) `applyRequireHumanReviewPolicyFindings` helper in `workflow.ts` injects synthetic issues with `rule_id` = `policy.require_human_review_for.<kind-slug>`, `category: "conventions"`, `severity: "error"`; wired into both `runReviewLikeCommand` (line ~3014) and `runReviewHookPostToolUse` (line ~3705) so the standalone command and the PostToolUse hook surface findings identically; aggregate counts + per-file `decision` recomputed so the canonical-needs-attention path drives exit 20. (iii) `packages/cli/docs/ci-integration.md` added (GH Actions + GitLab snippets, exit-code contract, vendor-neutral bypass guidance). (iv) `workflow-examples/consumer-repo/.salt/team.json` carries a 3-rule example (auth-flow-edit, theme-provider-edit, scope-only/unspecified). `bootstrapScaffolding.ts` final length: 437 lines (predicted ~450). `init.ts` final length: 723 lines (predicted ~700; PR 21 closes the rest). Tests: `cli.spec.ts` 89 passed / 1 skipped (the skip is an unrelated browser-mode test); `hookIO.spec.ts` 18/18 pass. `git grep SALT_REVIEW_HUMAN_REVIEWED_LABEL` returns zero hits outside this doc. `git grep -- '--since'` inside `packages/cli/src/` returns zero hits. |
| 9 | **2.9** split `status: partial` | Opus 4.7 High | Agent | 2 hr | Medium | ✅ Done — `packages/mcp/src/__tests__/statusPartialSplit.spec.ts` 5/5 pass covering all four `(status, internal_limitations)` combinations. `PublicInternalLimitations` shape + `EMPTY_PUBLIC_INTERNAL_LIMITATIONS` + `normalizeInternalLimitations` pinned in `packages/semantic-core/src/tools/publicContract.ts`; `MCP_WORKFLOW_OUTPUT_SCHEMA` carries the new field in `packages/mcp/src/server/toolDefinitions.ts`; `applyReviewEvidenceGate` no longer downgrades `status` to `partial` for `unsupported_claim_count > 0` alone (only true `validation_issues` do); `SALT_WORKFLOW_CONTRACT_SEMVER` bumped `1.0.0 → 1.1.0` + capability-manifest `contract_lifecycle` changelog entry; `packages/mcp/docs/salt-workflow-v1-host-contract.md` + `SKILL.md` + `references/shared/transport.md` updated to treat `partial` as user-facing remaining work only and read `internal_limitations` as a separate signal; `publicContractParity.spec.ts` now asserts `internal_limitations` parity across all 6 compact tests via the new `expectInternalLimitationsParity` helper; compact byte budgets bumped to absorb the new field; **no new parity failures introduced** — the 4 pre-existing failures in §8.2.2 still reproduce verbatim. **See §8.5** for a regression in PR 12 surfaced during this work. |
| 10 | **0.7** close the 0.6 coverage gap list (upstream fixes) | Opus 4.7 (medium) | Agent | 3 hr | Medium | ⚠️ Partial — (a) **landed**: `SaltProviderNext` props are in the registry, brand-prop defaults extracted, JPM Brand example present in `examples.json`. (b) **not landed**: `composition_contract` field still missing on 28 pattern records (0.6 spec fails). (c) **not landed**: 24 foundation entities still have no canonical example, no `site/foundation-category-map.json`. Also: the `SaltProviderNext` first-class-entity check in `registryCoverage.spec.ts` still raises 2 gaps because the spec searches for the exact name and the extracted entity record name doesn't match — bisect before assuming this is registry vs. spec. |
| 11 | **0.11 + 2.11** plain-text file-path fallback | Sonnet 4.5 | Agent | 45 min | Low | |
| 11.5 | **2.3** trim skill *(rev-10 priority bump: land before any further skill-prose adds)* | Opus 4.7 (medium) | Agent | 2 hr | Medium | ✅ Done (commit `452de3569`, 5 files / +311 / -326). Shipped: (a) new `packages/skills/salt-ds/references/shared/core.md` (88 lines) consolidates the always-loaded behavior contract — No Salt Invention Rule, Theme Evidence Rule, Hard Gate, Action Loop, Project Context First, Shared Workflow Contract / Stable-First Rule, Output Posture. (b) `SKILL.md` rewritten as a thin router: **253 → 82 lines** (router headers only: Always-Load First, Example Triggers, Trigger Boundary, Workflow Selection, Reference Routing). Frontmatter `name: salt-ds` + the agent-agnostic `description` preserved verbatim. (c) `skillContracts.spec.ts` rewritten to structural assertions: `extractFrontmatter()` parses + asserts `name` and the description shape, `extractHeaders()` asserts the exact router ToC matches `EXPECTED_SKILL_HEADERS` and asserts every `EXPECTED_CORE_HEADERS` lives in `core.md`, `extractReferenceLinks()` walks every `references/.../*.md` path in the router and `fs.access`-checks it for link integrity, plus two semantic-level concept regexes on `core.md` (anti-invention bullet, Hard-Gate fields). Downstream surface-parity assertions (transport, repo instructions, consumer example, bootstrap scaffolding) kept verbatim — they cover cross-surface drift, a different invariant from the router-trim invariant. (d) `agenticPolicyEvals.spec.ts` updated to load `core.md` alongside `SKILL.md` and assert the moved phrases (compact workflow signals, `salt_workflow_v1.action.kind` binding, required-concept sweep, theme guardrails, explicit-user-nouns) on the combined skill+core first-load surface. (e) `surfaceFactsGuard.spec.ts` theme-bootstrap wording test reads `core.md` instead of `SKILL.md` (the dynamic banned-sentinel sweep auto-includes the new file). Always-loaded surface shrinks from 253 lines (SKILL.md only) to 170 lines (82 router + 88 core); router-only drop is 253 → 82, matching roadmap §2.3's "~60-line router" target. Progressive-disclosure budgets unchanged (`skillEntrypointChars: 18_000`; `openAiDefaultPromptChars: 2_300`) and both still hold. **Verified green**: `@salt-ds/skills` 14/14 across all 3 spec files; `@salt-ds/cli` 134 passed / 1 skipped (the skip is the unrelated browser-mode test). Pre-existing failures unchanged by PR 11.5 and reproduced on stash-pop: `@salt-ds/semantic-core` `themeDeprecatedTokenReplacementMetadata.spec.ts` 2 failures (missing opacity/track deprecated-token basis — unrelated to skill markdown); `@salt-ds/mcp` 17 failures (baseline carried across PRs 8/12/20 per §8.5). |
| 12 | **0.9** auto-invalidate context on `install_dependencies` | Sonnet 4.5 thinking | Agent | 1 hr | Low | ✅ Done (commit `2445e8b6c`, 3 files / +400 / -7). Shipped: (a) `ToolExecutionRuntime.staleProjectContextIds: Set<string>` + `createToolExecutionRuntime` init; (b) `isProjectContextStale` + `markProjectContextStale` exported helpers; (c) `cacheProjectContext` clears the stale flag on successful cache write; (d) `resolveOrCollectProjectContext` contextId branch refetches via `collectSaltProjectContextData({ root_dir: cached.root_dir })` and re-caches when the id is stale, and the `lastProjectContextId` reuse fast-path skips stale ids; (e) internal `resultRequestsInstallDependencies(result)` checks both `action.kind` and `next_required_action.kind`; (f) `create_salt_ui`, `migrate_to_salt`, `review_salt_ui`, `upgrade_salt_ui` execute bodies call `markProjectContextStale(runtime, projectContext.root_dir)` after every workflow result that requests `install_dependencies`, gated on `isSaltProjectContextReadyForRepoAwareWork(projectContext)`. `packages/mcp/src/__tests__/installDependenciesContextInvalidation.spec.ts` 2/2 pass (collapse install→rerun loop; mark stale on every install_dependencies emit including failures). `packages/skills/salt-ds/references/shared/copilot-hosts.md` install_dependencies bullet now explicitly drops the manual `get_salt_project_context` call between the install and the rerun (`openai.yaml` already used generic phrasing — no edit needed). Full `@salt-ds/mcp` suite: 17 failures present after PR 12, all 17 confirmed pre-existing by stash-and-rerun against the same 7 suspect files on the pre-PR-12 working tree — PR 12 introduces zero new regressions. See §8.5 for the re-land closure note. |
| 13 | **0.10** tool-selection benchmark | Sonnet 4.5 | Agent | 1.5 hr | Low | ✅ Done (commit `3b1118187`; ranker + 20-prompt corpus + 4 description swaps; see §8.2 for pre-existing failures unmasked while verifying) |
| 14 | **0.8** canonical-example round-trip test (depends on PR 10) | Opus 4.7 (medium) | Agent | 1.5 hr | Medium | ✅ Done as a failing spec (commit `73913767a`); follow-up heuristic-repair work is **roadmap row 0.8a** — see §8.1 for the 9-story gap list |
| 15 | **1.8** `get_salt_entities` batch lookup (M13 / F6) | Opus 4.7 (medium) | Agent | 2 hr | Medium | |
| 16 | **2.10** theme-aware `create_salt_ui` (depends on PR 10) | Opus 4.7 (medium) | Agent | 2 hr | Medium | |
| 17 | **2.15** agent provenance attestations (E4, depends on PR 7) | Opus 4.7 (medium) | Agent | 3 hr | Medium | *Rev-10 narrowing:* ship the attestation **payload** as a published Zod schema at `salt-ds.dev/schemas/attestation/v1`; emit on stdout when `--emit-attestation` is set; the `--verify-attestations` flag reads from stdin (or any consumer-chosen store). The `.salt/attestations/<hash>.json` on-disk layout becomes a demo default in `workflow-examples/`, **not** a foundation commitment. Do not pick the hashing algorithm, the retention policy, the GC story, or the sharding strategy for the consumer's audit store. |
| 18 | **2.16** policy-driven escalation (E5, depends on PR 7) | Sonnet 4.5 | Agent | 1.5 hr | Low | ⚠️ Partial — PreToolUse `require_human_review_for` branch landed in `salt-ds review --hook` (rule schema in `packages/cli/src/commands/workflow.ts`; help text in `packages/cli/src/lib/args.ts`; cli.spec.ts test at line 6457 passes). **Not landed**: the CI-side label gate, because it needs PR 8's `salt-ds review --since` which is still open. Also no example added to `workflow-examples/consumer-repo/.salt/team.json` yet. |
| 19a | **Task 1.1** split `packages/cli/src/commands/workflow.ts` | **Opus 4.7 High 1M** | Agent | 4–6 hr | High | Not started — file is **3,913 lines** as of 2026-06-10 (+576 over the roadmap §1.3 baseline of 3,337 and +563 over rev-6's 3,350 reading). Highest-leverage of the three splits; should land first per Appendix A's safe-split order. |
| 19b | **Task 1.2** split `packages/mcp/src/server/toolDefinitions.ts` | **Opus 4.7 High 1M** | Agent | 4–6 hr | High | Not started — file is **2,051 lines** as of 2026-06-10. The rev-6 audit cited 2,222 "after 0.9 work" but §8.5's PR 12 revert pulled the file back to its 3b1118187 baseline, hence the smaller count today. |
| 19c | **Task 1.3** split `packages/semantic-core/src/tools/publicContract.ts` + `workflowContracts.ts` | **Opus 4.7 High 1M** | Agent | 4–6 hr | High | Not started — `publicContract.ts` is **2,486 lines** as of 2026-06-10 (+112 from PR 9's `internal_limitations` work), `workflowContracts.ts` is **2,334 lines** (unchanged). Roadmap Appendix A says do the types extraction (step 1) and `publicContract` barrel (step 2) before any of the workflow-side splits; sequence accordingly. **Rev-10 note:** target shape is plain async functions per the rev-3 cross-cutting §3.3 narrowing (no state-machine DSL, no `.step()` chain) and explicit dependency arguments per the rev-3 cross-cutting §3.4 cut (no React-style hooks). |
| 20 | **0.12** published-schema vendor-name regression test *(rev 3 / rev 10)* | Sonnet 4.5 | Agent | 45 min | Low | ✅ Done (commit `72b04eb1e`, 2 specs / 434 lines). Paired specs, one per published-schema surface: (a) `packages/semantic-core/src/__tests__/publishedSchemaVendorNameAudit.spec.ts` walks every `*.schema.json` under `packages/semantic-core/schemas/` and audits every `title`/`description`/`markdownDescription`/`$comment` field; (b) `packages/mcp/src/__tests__/publishedSchemaVendorNameAudit.spec.ts` walks every `TOOL_DEFINITIONS` entry from `packages/mcp/src/server/toolDefinitions.ts`, asserts on each tool-level `description` string, and uses `z.toJSONSchema()` (Zod v4 public API) to render each input/output schema before walking the same description carriers. Both specs assert zero hits against: CI vendor names (`github`, `gitlab`, `bitbucket`, `circleci`, `jenkins`, `azure`, `buildkite` — case-insensitive); host-editor names (`vscode`, `cursor` — case-insensitive); `AGENTS.md` (case-sensitive — matching CI would over-match lowercase letters); and the `SALT_[A-Z][A-Z0-9_]*` env-var-style identifier regex (uppercase only — lowercase `salt_workflow_v1`-style contract names are allowed). Failure messages include schema file (or tool name), JSON pointer to the offending field, matched token, and verbatim text. Negative-tested by injecting `GitHub` + `SALT_FOO` into a JSON description (caught 2 hits) and `vscode` + `cursor` + `GitLab` + `SALT_BAR_BAZ` into one Zod `.describe()` call (caught 4 hits); both reverted to green when the injected tokens were removed. 4/4 tests pass at landing. |
| 21 | **1.1b** shrink `init.ts` to <500 lines *(rev 3 / rev 10)* | Opus 4.7 (medium) | Agent | 2 hr | Medium | Not started — `packages/cli/src/commands/init.ts` is **895 lines** today (second-largest violation of the Phase 1 800-line target after `workflow.ts`; was not on the rev-2 §1.3 M1 list — quiet drift). PR 8's 0.5b removal drops ~200 lines naturally; PR 21 extracts the rest into `commands/init/{bootstrap,hostAdapters,uiVerify,agentHooks}.ts` so `init.ts` becomes a router. Land *after* PR 8 (so the post-0.5b shape is the baseline). |

Sonnet for mechanical / well-bounded work. Opus High 1M only when cross-file architectural reasoning is the bottleneck — never just because "the task feels important." Dependency order matters: PR 10 unblocks PRs 14 and 16; PR 7 unblocks PRs 17 and 18; **PR 8 unblocks PR 20 and PR 21**; **PR 11.5 (skill trim) should land before any later PR that adds skill prose** (PRs 15, 16, 17, 18 all do).

**Rev-10 sequencing tl;dr.** The next 5 PRs in priority order are now: **PR 8** (lean 2.13 + 0.5b bootstrap CI emitter removal), **PR 12 re-land** (task 0.9 toolDefinitions.ts staleProjectContextIds per §8.5), **PR 11.5** (task 2.3 skill trim, before further skill prose), **PR 19a** (task 1.1 workflow.ts split, before any further Phase 2 work touches the 3,913-line file), **PR 20** (task 0.12 schema vendor-name test, makes the rev-7 leak class impossible going forward). Everything else slots in after these.

## 3. Paste-ready prompts

Each prompt assumes a fresh chat session in the repo root.

### PR 1 — Task 0.3 (tool-surface reconciliation)

```
Implement Phase 0 task 0.3 as documented in
packages/mcp/docs/gold-standard-roadmap.md.

Do exactly one task: 0.3 (reconcile public MCP tool surface). Read these
files first for context:
- packages/mcp/docs/gold-standard-roadmap.md §Phase 0 task 0.3
- packages/mcp/docs/session-findings-2026-06.md root cause #3
- packages/mcp/README.md (the "Public Tool Surface" section)
- packages/mcp/src/server/toolDefinitions.ts (the four extras at lines
  ~1270, 1297, 1330, 1386)
- packages/mcp/src/__tests__/createServer.spec.ts (EXPECTED_TOOL_NAMES)

There are two options:
  A) Hide validate_salt_review_report, resume_salt_review,
     persist_salt_context_pack, persist_salt_generated_artifact behind a
     constructor option / env var (SALT_MCP_EXPOSE_SUPPORT_TOOLS=1)
     and keep the default tool count at 9.
  B) Document them publicly in packages/mcp/README.md and
     packages/mcp/docs/public-api-matrix.md with explicit readOnlyHint:false
     callouts for the persistence tools.

Tell me which option you picked and the one-sentence reason BEFORE editing
anything. Then make the change and update EXPECTED_TOOL_NAMES. Run
`yarn vitest run packages/mcp/src/__tests__/createServer.spec.ts
packages/mcp/src/__tests__/packagePublishBoundary.spec.ts` and confirm pass.

Produce a PR title and description suitable for the salt-ds repo. Do not
start tasks 0.1, 0.2, 0.6, F11, or any other roadmap item.
```

**Verify yourself:** `yarn vitest run packages/mcp/src/__tests__/createServer.spec.ts` and grep the README for tool names matching the test.

### PR 2 — F11 (drop `@SaltUI`)

> **Superseded — kept for history.** Option C landed instead of Option A: `salt-ds init` no longer writes `.github/agents/salt-ui.agent.md` by default, but the conditional opt-in path is retained for hosts that advertise custom-agent support. See `session-findings-2026-06.md` root cause #9 "Decision (2026-06)" for the rationale; §5.8 of the roadmap picks up the cross-IDE format-normalization work from here. Treat F11 as closed; do not re-run this prompt.

```
Implement task F11 as documented in packages/mcp/docs/session-findings-2026-06.md.

Apply Option A from root cause #9: drop salt-ui.agent.md from
bootstrap_salt_repo entirely. Do not ship the 5-line shim.

Edit:
- packages/mcp/src/server/bootstrapRepo.ts — stop writing salt-ui.agent.md
- packages/semantic-core/src/bootstrapScaffolding.ts — remove
  VSCODE_SALT_UI_AGENT_TEMPLATE if no longer used
- packages/skills/salt-ds/SKILL.md — remove "delegate to the Salt UI agent"
  language
- packages/skills/salt-ds/assets/repo-instructions.template.md — same
- workflow-examples/consumer-repo/AGENTS.md — same
- workflow-examples/consumer-repo/.github/copilot-instructions.md — same
- workflow-examples/consumer-repo/.github/agents/salt-ui.agent.md — delete
- packages/skills/__tests__/skillContracts.spec.ts — update assertions
- packages/mcp/src/__tests__/createServer.spec.ts — remove related assertions
- packages/cli/src/__tests__/cli.spec.ts — update bootstrap test expectations

Tell me the file list before editing. Then make the changes and run:
`yarn vitest run packages/skills packages/mcp/src/__tests__/createServer.spec.ts
packages/cli/src/__tests__/cli.spec.ts`

Do not touch hooks (E1-E7), registry coverage (0.6), or anything in Phase 1.
```

**Verify yourself:** Search the repo for "Salt UI agent" and "salt-ui.agent.md" — both should return zero hits (except in the changelog/PR description).

### PR 3 — Task 0.6 (registry coverage CI)

```
Implement task 0.6 from packages/mcp/docs/gold-standard-roadmap.md.

Add a vitest spec at packages/mcp/src/__tests__/registryCoverage.spec.ts
that walks the loaded registry and asserts:

1. Every entity in components.json has at least one canonical example
   (cross-reference examples.json).
2. Every entity in patterns.json has at least one canonical example AND a
   populated composition_contract.
3. Every foundation entity has at least one canonical example.
4. SaltProviderNext is present as a first-class entity (this is the F1
   test case — it will fail today, that is intentional).

The spec MUST fail today on the SaltProviderNext gap and any other missing
canonical examples. Do not fix the gaps — that's the next PR. The output
of the failing spec is the gap list.

Add the spec, run it, paste the failure output into the PR description as
"Known gaps to close in the follow-up PR." Then make sure the spec is
included in the regular vitest run (no special test command needed).

Do not modify the registry, the build, or any entity data. Coverage spec
only.
```

**Verify yourself:** Run the new spec. It should fail with a list of names. That list is the spec for PR #4 in the registry-coverage chain.

### PR 4 — Task 0.4 (`doctor --check-install`)

```
Implement task 0.4 from packages/mcp/docs/gold-standard-roadmap.md.

Add a --check-install flag to `salt-ds doctor` (packages/cli/src/commands/doctor.ts).
When set, it should:

1. Walk node_modules/@salt-ds/cli/package.json and node_modules/@salt-ds/mcp/package.json.
2. Check whether playwright appears in transitive dependencies.
3. Scan the repo for usage of `salt-ds runtime inspect --mode browser` and
   `--mode auto` in package.json scripts, CI files, and AGENTS.md.
4. If playwright is installed but no browser-mode usage is detected, emit
   a warning suggesting --mode fetched-html or removing runtime-inspector-browser
   when 0.1 lands.

Update packages/cli/README.md and packages/cli/src/__tests__/cli.spec.ts
accordingly.

Do not start 0.1 (Playwright split). This task only adds the diagnostic.
```

### PR 5 — Task 0.1 (Playwright split — the big one)

Use **Opus 4.7 High 1M** for this one specifically.

```
Implement task 0.1 from packages/mcp/docs/gold-standard-roadmap.md.
This is a cross-package refactor. Take the full context window.

Read first:
- packages/runtime-inspector-core/package.json
- packages/runtime-inspector-core/src/inspect.ts
- packages/mcp/docs/gold-standard-roadmap.md task 0.1 and §1.2 issue C1
- scripts/build.mjs (especially publishBundledWorkspaceDependencies logic
  at lines 80-118 and 234)
- packages/mcp/src/__tests__/packagePublishBoundary.spec.ts

Goal: split runtime-inspector-core into a jsdom-only core and a new
packages/runtime-inspector-browser package. Playwright moves to the
browser package as peerDependencyMeta.optional.

Required behavior:
- `salt-ds runtime inspect --mode fetched-html` (or default) works
  without playwright installed.
- `salt-ds runtime inspect --mode browser` lazy-requires the browser
  package and exits with a clear install hint if it's absent.
- @salt-ds/cli and @salt-ds/mcp no longer bundle playwright in their
  published transitive dependencies. packagePublishBoundary.spec.ts must
  assert this.

Tell me the new package's package.json and the high-level file move plan
BEFORE making the changes. Then implement it as a sequence of small
commits I can review individually.

Run the full vitest suite when done. Do not start 0.2 (lazy registry),
that's the next PR.
```

**Verify yourself:**

```sh
yarn workspace @salt-ds/cli build
ls dist/salt-ds-cli/node_modules/playwright 2>/dev/null && echo "FAIL: playwright present" || echo "PASS"
yarn vitest run packages/mcp/src/__tests__/packagePublishBoundary.spec.ts
```

### PR 6 — Task 0.2 (lazy registry)

```
Implement task 0.2 from packages/mcp/docs/gold-standard-roadmap.md.

Read packages/semantic-core/src/registry/loadRegistry.ts and
packages/cli/src/lib/registry.ts first.

Goal: replace eager loadRegistry with a Proxy-backed lazy loader. Each
artifact (components.json, patterns.json, tokens.json, etc.) loads on first
property touch. Add an in-memory LRU. Add a --prefetch flag for hosts
that want eager load.

salt-ds info should now read <2 MB instead of 24 MB. Time it before and
after on a clean clone.

Update tests that depend on registry-loaded state. Do not change the
registry artifact shapes or the build.
```

### PR 7 — Tasks 2.12 + 2.17 + 2.18 (hook flags, bundled)

```
Implement the agent-hook enforcement layer as documented in
packages/mcp/docs/gold-standard-roadmap.md tasks 2.12, 2.17, and 2.18,
plus the matching E1, E6, E7 entries in session-findings-2026-06.md.

This is one PR with three pieces:

1. New internal helper packages/cli/src/lib/hookIO.ts. Parses VS Code
   agent hook JSON from stdin per
   https://code.visualstudio.com/docs/agent-customization/hooks.
   Provides typed accessors for hookEventName, tool_name, tool_input,
   tool_response, sessionId. Output helpers for {continue, decision,
   reason, hookSpecificOutput}. Exit-code helper (2 = block + stderr).
   Internal-only — do not export from the CLI's index.

2. New --hook flag on salt-ds review (packages/cli/src/commands/workflow.ts).
   When set:
     - Read hook JSON from stdin instead of file args via hookIO.
     - For PostToolUse: extract edited files from tool_input, run review
       on the Salt-affected subset, exit 2 with findings on stderr if
       blocking, exit 0 otherwise.
     - For PreToolUse: read .salt/team.json require_human_review_for,
       emit permissionDecision: "ask" for matching changes, "allow"
       otherwise.

3. New --hook flag on salt-ds info. When set, emit
   {hookSpecificOutput: {additionalContext: "..."}} summarizing registry
   version, declared policy, available patterns, MCP availability.

Update salt-ds bootstrap (--add-agent-hooks option) to write
.github/hooks/salt.json. Format:

{
  "hooks": {
    "PostToolUse": [{ "type": "command", "command": "npx salt-ds review --hook" }],
    "SessionStart": [{ "type": "command", "command": "npx salt-ds info --hook" }]
  }
}

Add tests for hookIO and the new --hook flags. Do not implement E4
attestations or E5 policy escalation — they share the same surface but
need separate PRs to keep diffs small.

Tell me the hookIO API surface before implementing.
```

> **Note on PR 18's CI half (rev 8):** The rev-7 framing said PR 8 ships `salt-ds review --since` and the `.github/workflows/salt-review.yml` writer, and PR 18's CI-side label gate was blocked on that plumbing. Rev 8 (see the PR 8 prompt below) drops `--since` and `--add-ci-checks` entirely — the CI gate is now whatever the consumer's CI already uses (labels, CODEOWNERS, branch protection), and the lean PR 8 surfaces `require_human_review_for` matches as ordinary blocking findings so CI and the agent hook reach the same primitive. §8.4 closes inside PR 8.

### PR 8 — Task 2.13 (CI required check — E2) + Task 0.5b (drop bootstrap CI emitter) — *rev-8 lean redesign + rev-10 expansion*

> **Why this prompt changed:** the rev-7 prompt drove `--since`, `--pretty`, `--add-ci-checks`, and a `SALT_REVIEW_HUMAN_REVIEWED_LABEL` env var into the CLI. A maintainer review concluded that crossed the line from "primitive" to "policy": the diff resolution is one shell line over the existing `salt-ds review [target ...]` primitive, the canonical-path CI writer hard-codes the consumer's CI vendor and file layout, and the env-var bypass couples the CLI to a specific override mechanism. Rev 8 keeps PR 8 as a small composable primitive plus a docs page; CI integration is composed by the consumer. **Rev 10 expansion:** also remove the already-shipped CI-YAML emitter from `packages/semantic-core/src/bootstrapScaffolding.ts` and the `SALT_REVIEW_HUMAN_REVIEWED_LABEL` description bleed in `packages/semantic-core/schemas/project-conventions.schema.json` (roadmap task 0.5b). The rev-9 §8.6 audit found these two files in the back-out list but the original rev-8 prompt didn't enumerate them; they're added here.

```
Implement Phase 2 task 2.13 + Phase 0 task 0.5b from
packages/mcp/docs/gold-standard-roadmap.md (also session-findings-2026-06.md
E2) under the lean rev-8 + rev-10 scope. The earlier rev of this prompt drove
`--since`, `--add-ci-checks`, and a SALT_REVIEW_HUMAN_REVIEWED_LABEL env var
into the CLI plus a CI-YAML emitter into bootstrapScaffolding.ts. That work is
partially in the working tree (see §8.6 of implementation-handoff.md) and is
being intentionally backed out — the design rationale in revs 7→8→10 of the
handoff concluded the CLI should stay a small composable primitive and CI
integration belongs in docs, not in the CLI surface and not in bootstrap output.

Read first:
- packages/mcp/docs/gold-standard-roadmap.md §Phase 2 task 2.13 and
  §Phase 0 task 0.5b
- packages/mcp/docs/gold-standard-roadmap.md §2.1.6 (the foundation-strict
  cut rationale, including "no Salt-shipped CI YAML" and "no env-var-named
  bypass mechanisms")
- packages/mcp/docs/session-findings-2026-06.md E2
- packages/mcp/docs/implementation-handoff.md §8.4 and §8.6 (back-out
  list and design rationale)
- packages/cli/src/commands/workflow.ts — existing `salt-ds review`
  command (positional file/dir args are already the documented
  "scan a target" primitive: `salt-ds review src`)
- packages/cli/src/lib/args.ts — current CLI flag surface (note the
  `--since`, `--pretty`, and `--add-ci-checks` entries you will be
  removing per §8.6)
- packages/cli/src/commands/init.ts — current init scaffolding
  (`--add-agent-hooks` stays; the `--add-ci-checks` branch added by
  the rev-7 work is being removed)
- packages/semantic-core/src/bootstrapScaffolding.ts — the CI-YAML
  emitter you will be removing (the GitHub Actions writer, the GitLab
  snippet/root writers, the SALT_REVIEW_HUMAN_REVIEWED_LABEL_* and
  SALT_GITLAB_CI_* constants, the salt-human-reviewed label-name
  constant; ~150 lines total)
- packages/semantic-core/schemas/project-conventions.schema.json —
  the `require_human_review_for` description string that names the
  env-var bypass mechanism

This PR ships four small pieces:

1. Back out the in-flight CLI surface listed in §8.6. No `--since`,
   no `--pretty`, no `--add-ci-checks`, no `SALT_REVIEW_HUMAN_REVIEWED_LABEL`
   read anywhere in the CLI. Delete the matching cli.spec.ts cases
   (the four `--add-ci-checks` cases, the `--since` cases, the
   env-var-bypass case, and the `initGitRepo` / `commitAll` /
   `setupSinceFixtureRepo` helpers if they have no other consumer).
   The `salt-ds review [target ...]` primitive remains exactly as it
   is today.

2. **(0.5b, rev-10 addition)** Remove the CI-YAML emitter from
   `packages/semantic-core/src/bootstrapScaffolding.ts`: the
   `.github/workflows/salt-review.yml` writer, the
   `.gitlab/salt-review.yml` writer, the `.gitlab-ci.yml`
   "conservative merge" logic, the `SALT_REVIEW_HUMAN_REVIEWED_LABEL_*`
   and `SALT_GITLAB_CI_*` constants, and the `salt-human-reviewed`
   label-name constant baked into emitted YAML. After this lands,
   `bootstrapScaffolding.ts` shrinks from ~597 to ~450 lines. Rewrite
   the `require_human_review_for` description in
   `packages/semantic-core/schemas/project-conventions.schema.json`
   so it describes what the rule does (escalates matching changes to
   human review and surfaces as a blocking
   `policy.require_human_review_for.<kind>` finding) and points at
   `packages/cli/docs/ci-integration.md` for the consumer-side bypass
   story — no mention of `SALT_REVIEW_HUMAN_REVIEWED_LABEL`, no
   mention of GitHub or GitLab.

3. Surface `require_human_review_for` policy violations as ordinary
   blocking findings on `salt-ds review`. The finding carries a
   stable rule id (proposal: `policy.require_human_review_for.<kind>`)
   and the matched file path. The CLI emits the finding and exits
   non-zero via the existing review exit-code helper; it has no
   opinion about labels, env vars, or bypass mechanisms. Reuse the
   policy-matching helper that the existing PreToolUse hook branch
   already uses (it lives in workflow.ts ~line 3423 per §8.4) — do
   not duplicate the matching logic.

4. Document CI composition in a new
   packages/cli/docs/ci-integration.md. Include copy-paste ~5-line
   snippets for GitHub Actions and GitLab CI. Each snippet is just:
   compute the changed file list with
   `git diff --name-only --diff-filter=ACMR "$BASE" -- '*.{ts,tsx,jsx,js,mdx}'`,
   pipe to `xargs -r npx salt-ds review`, branch-protect the job.
   Include one paragraph on bypass: "if your org needs a manual
   override, gate the job in your CI config — labels, CODEOWNERS,
   branch protection rules, whatever your repo already uses. The CLI
   doesn't know about your bypass model and shouldn't." Cross-link
   from packages/cli/README.md. Also add a non-trivial
   `require_human_review_for` example to
   `workflow-examples/consumer-repo/.salt/team.json` (this closes the
   §8.4 cleanup).

Tests (cli.spec.ts):
- `salt-ds review <file>` against a file matching
  `require_human_review_for` returns one blocking finding with the
  expected rule id and exits non-zero.
- Same file with the policy not matching returns no policy finding
  and exits per the usual review outcome.
- Drop the four `--add-ci-checks` cases, all `--since` cases, and
  the env-var-bypass case.
- Drop any unused git-fixture helpers introduced by the rev-7 work.

Tests (semantic-core / bootstrap):
- `bootstrap_salt_repo` no longer emits `.github/workflows/salt-review.yml`
  or `.gitlab/salt-review.yml` or any `.gitlab-ci.yml` merge.
- `git grep SALT_REVIEW_HUMAN_REVIEWED_LABEL` returns zero hits
  outside `packages/mcp/docs/implementation-handoff.md`.
- Any existing bootstrapScaffolding spec covering the removed writers
  is deleted, not silenced.

Tell me the rule-id naming, the team.json example shape, and the
follow-up `init.ts` line count (PR 21's baseline) BEFORE editing. Do
not add new CLI flags. Do not write CI files into the consumer repo.
Do not add init scaffolding. Do not modify PR 7's
hookIO.ts surface.

Run:
yarn vitest run packages/cli/src/__tests__/cli.spec.ts
yarn vitest run packages/cli/src/__tests__/hookIO.spec.ts
```

**Verify yourself:** after this PR, `git diff packages/cli/src/lib/args.ts` against `mcp` HEAD should show zero new `salt-ds review` flags and zero new `salt-ds init` flags. `git grep SALT_REVIEW_HUMAN_REVIEWED_LABEL` should return zero hits. `salt-ds review <file-matching-require_human_review_for-rule>` should exit non-zero with a finding whose `rule_id` starts with `policy.require_human_review_for.`. The two snippets in `packages/cli/docs/ci-integration.md` should be runnable as-is when pasted into a real GitHub Actions or GitLab CI job.

### PR 9 — Task 2.9 (split `status: partial` into `partial` + `internal_limitations`)

```
Implement Phase 2 task 2.9 from packages/mcp/docs/gold-standard-roadmap.md
(also session-findings-2026-06.md F3 / root cause #2). This is a
contract-shape change to salt_workflow_v1 — coordinate carefully with
publicContractParity.spec.ts (which already has 4 pre-existing failures
recorded in §8.2.2; do not let this PR add a 5th).

Read first:
- packages/mcp/docs/gold-standard-roadmap.md §Phase 2 task 2.9
- packages/mcp/docs/session-findings-2026-06.md root cause #2
- packages/semantic-core/src/tools/publicContract.ts — where status is
  emitted today (look for `status: "partial"` paths)
- packages/semantic-core/src/tools/workflowContracts.ts — review /
  migrate / upgrade contract builders that populate status
- packages/semantic-core/src/tools/capabilityManifest.ts —
  contract_lifecycle that needs the version bump
- packages/skills/salt-ds/SKILL.md and references/shared/*.md —
  agent-facing prose mentioning "partial"

Goal: `status: partial` today overloads two unrelated states:
  (1) "the user request is partly addressed; more follow-through is
      needed" — legitimate partial.
  (2) "the workflow itself could not validate part of its own output
      because the registry has internal gaps (unsupported_claim_count
      > 0)" — internal limitation.

After this PR, `partial` means only (1). State (2) becomes a separate
top-level `internal_limitations: { unsupported_claim_count: number,
unsupported_rule_kinds: string[] }` block that is independent of
`status`. A clean run with internal limitations is now
`status: success, internal_limitations: { … }`.

Required:
1. Pin the new `internal_limitations` shape in
   `packages/semantic-core/src/tools/publicContract.ts` next to the
   existing top-level fields. Zod schema, types, and the discriminant
   that splits (1) from (2).
2. Update every status-producing site in workflowContracts.ts and the
   individual workflow contracts to emit the new shape:
   - workflows that today emit `status: partial` purely for
     `unsupported_claim_count > 0` reasons should emit
     `status: success, internal_limitations: { … }`.
   - workflows that today emit `status: partial` for genuine
     user-facing remaining work should keep `status: partial` AND
     populate `internal_limitations` when both are true.
3. Bump the salt_workflow_v1 contract version per the SemVer policy
   (this is an additive top-level field plus a status-meaning change,
   so a MINOR bump is the floor). Update
   `capabilityManifest.ts` `contract_lifecycle` accordingly.
4. Update skill prose in `packages/skills/salt-ds/SKILL.md` and
   `packages/skills/salt-ds/references/shared/transport.md` so the
   agent treats `partial` only as user-facing remaining work and
   reads `internal_limitations` as a separate signal.
5. Add a regression test:
   `packages/mcp/src/__tests__/statusPartialSplit.spec.ts` covering all
   four combinations: (success, no limitations), (success, with
   limitations), (partial, no limitations), (partial, with
   limitations). Assert the field is present even when empty so hosts
   can branch on its presence without runtime checks.
6. Update `publicContractParity.spec.ts` to assert CLI and MCP emit
   the same `internal_limitations` block. The 4 pre-existing failures
   recorded in §8.2.2 are unrelated and must not be papered over —
   verify they still reproduce after your change.
7. Update `packages/mcp/docs/salt-workflow-v1-host-contract.md` with
   the new field, the version bump note, and a migration paragraph
   covering the renamed-semantics of `partial`.

Tell me the exact `internal_limitations` Zod shape (mandatory? always
present? defaults?) and the version-bump string BEFORE editing. Do not
introduce other top-level fields. Do not touch the action vocabulary
(that's task 2.4) or the ask_user payload (that's task 2.10).

Run:
yarn vitest run packages/mcp/src/__tests__/publicContractParity.spec.ts
yarn vitest run packages/mcp/src/__tests__/createServer.spec.ts
yarn vitest run packages/mcp/src/__tests__/agenticEvals.spec.ts
yarn vitest run packages/cli/src/__tests__/cli.spec.ts
yarn vitest run packages/skills/__tests__
```

**Verify yourself:** capture a `review_salt_ui` result that previously came back as `status: partial` purely for validator coverage gaps (the consumer trace turn 5 case) and confirm it now comes back as `status: success` with `internal_limitations.unsupported_claim_count > 0`. Also confirm the contract version bump appears in `salt://capabilities/manifest`.

### PR 10 — Task 0.7 (close the 0.6 coverage gap list)

This is the direct follow-up to PR 3. The 0.6 registry-coverage spec at `packages/mcp/src/__tests__/registryCoverage.spec.ts` is intentionally failing today; this PR closes the gap list it produces, and the spec is how you know you're done.

```
Implement task 0.7 from packages/mcp/docs/gold-standard-roadmap.md.

Read first:
- packages/mcp/docs/gold-standard-roadmap.md §Phase 0 task 0.7
- packages/mcp/docs/maintaining-salt-ai-tooling.md §Core Rule (docs →
  category map → build extraction → runtime ordering)
- packages/semantic-core/src/types.ts (PatternRecord, ComponentRecord)
- packages/semantic-core/src/build (the extraction layer that produces
  components.json / patterns.json)
- packages/mcp/src/__tests__/registryCoverage.spec.ts (the failing spec
  that defines "done")

Three coordinated pieces, all done UPSTREAM of the registry. Do not
hand-author entries into components.json, patterns.json, or examples.json.

(a) SaltProviderNext as a first-class registry entity. Ensure canonical
    docs and JSDoc on the SaltProviderNext component in @salt-ds/core
    carry the full prop schema (accent, corner, headingFont, actionFont)
    and brand defaults so the existing build extracts it. Add the JPM
    Brand recipe as a canonical example.

(b) composition_contract as a defined PatternRecord field. Pin the shape
    in packages/semantic-core/src/types.ts. Document it in
    maintaining-salt-ai-tooling.md "Stable Layers". Teach the build to
    derive it from composed_of plus pattern docs.

(c) Foundations as first-class entities. Decide the source-of-truth
    surface (likely a new site/foundation-category-map.json or a
    docs-extraction pass over site/docs/foundations/**), then update
    the build to emit foundation records with canonical examples.
    Wiring create_salt_ui to consult them is 2.10, not this PR — this
    PR just has to make the entities exist.

Tell me which of (a)/(b)/(c) you're tackling first and the high-level
file list BEFORE editing. Implement as a sequence of commits, one per
piece.

When done, run:
yarn vitest run packages/mcp/src/__tests__/registryCoverage.spec.ts
packages/mcp/src/__tests__/registry.integration.spec.ts

registryCoverage.spec.ts MUST pass with zero gaps. Do not start 2.10.
```

**Verify yourself:** Re-run the 0.6 spec. Every section should be green. Then `grep -r "SaltProviderNext" packages/mcp/generated/` should return real entity hits, not just deprecation chain.

### PR 11 — Tasks 0.11 + 2.11 (plain-text file-path fallback, bundled)

```
Implement tasks 0.11 and 2.11 from packages/mcp/docs/gold-standard-roadmap.md
as a single PR. They are the same work at two layers (Phase 0 immediate
fix and Phase 2 contract restatement).

Read first:
- packages/mcp/docs/session-findings-2026-06.md root cause #8 (F9 / M16)
- packages/semantic-core/src/tools/publicContract.ts — where inline file
  references are emitted
- packages/mcp/src/server/toolDefinitions.ts — assistant-bound response
  formatting

Goal: whenever an assistant-bound response includes an inline file
reference (Markdown link, VS Code-style widget), always include the
plain-text path alongside it so unrendered chat UIs don't render blanks
like "Created: -  — default Salt team policy".

Steps:
1. Inventory every emission site that produces an inline file reference.
2. Add a sibling `path` field (or include the path inline in the text
   body) so the message is intelligible without rendering.
3. Bump the salt_workflow_v1 contract version per the SemVer policy and
   note the change in capability_manifest.contract_lifecycle (this is
   the 2.11 contract-restatement half).
4. Add a regression test asserting plain-text paths are present.

Tell me the emission-site list before editing. Do not touch hooks
(E1–E7) or any other Phase 2 contract change.
```

**Verify yourself:** strip rich rendering from a captured workflow result and confirm every file reference is still readable.

### PR 12 — Task 0.9 (auto-invalidate context on `install_dependencies`)

```
Implement task 0.9 from packages/mcp/docs/gold-standard-roadmap.md.

Read first:
- packages/mcp/docs/session-findings-2026-06.md root cause #4 (M12 / F5)
- packages/mcp/src/server/toolDefinitions.ts — projectContext caching
- packages/semantic-core/src/tools/projectContext.ts
- packages/skills/salt-ds/** — current action-loop guidance that
  manually instructs a get_salt_project_context rerun

Goal: when an install_dependencies action completes, the cached project
context must be invalidated automatically so the next workflow turn
picks up the new package state. Today this is a three-step manual loop
(install → rerun get_salt_project_context → rerun original workflow);
make it one step.

Required:
- On install_dependencies completion (success OR failure), mark cached
  project context for the affected root_dir stale.
- The next call that depends on project context refetches transparently.
- Action-loop docs in packages/skills/salt-ds/**/*.md drop the manual
  rerun instruction.
- Regression test: simulate install_dependencies completion, then a
  follow-up get_salt_entity, and assert no manual rerun was required.

Do not start 0.10 or 1.8.
```

### PR 13 — Task 0.10 (tool-selection benchmark)

```
Implement task 0.10 from packages/mcp/docs/gold-standard-roadmap.md.

Read first:
- packages/mcp/docs/session-findings-2026-06.md root cause #7 (M15 / F8)
- packages/mcp/src/__tests__/agenticEvals.spec.ts — existing eval style
- packages/mcp/src/server/toolDefinitions.ts — tool descriptions and
  annotations

Goal: add a deterministic eval that asserts host-side tool selection
picks the correct Salt tool first for 20 representative consumer prompts.

Steps:
1. Compile a 20-prompt corpus covering create / review / migrate /
   upgrade / info / entity-lookup / pattern-lookup intents.
2. Implement a deterministic ranker that scores each registered MCP
   tool against the prompt using only the tool's name, description,
   and annotations (no model call). This mirrors what host LLMs do at
   tool-selection time.
3. Assert the correct Salt tool ranks #1 for each prompt.
4. Audit toolDefinitions.ts descriptions; strengthen any description
   that scored weakly. Do not rename tools.

Do not start 1.8 — batch lookup ships separately.
```

### PR 14 — Task 0.8 (canonical-example round-trip test)

**Depends on PR 10.** Until canonical examples and `composition_contract` are extracted, this test will surface extraction noise as if it were heuristic noise.

```
Implement task 0.8 from packages/mcp/docs/gold-standard-roadmap.md.

Read first:
- packages/mcp/docs/session-findings-2026-06.md root cause #3 (M11 / F4)
- packages/semantic-core/src/tools/reviewSaltUi.ts
- packages/core/stories/patterns/** — the canonical pattern story files

Goal: for every pattern story file in packages/core/stories/patterns/**,
run review_salt_ui against the story's source and assert zero blocking
findings. If a heuristic flags its own canonical reference, the heuristic
is wrong — fail the build.

Required:
1. Add packages/mcp/src/__tests__/canonicalExampleReviewRoundTrip.spec.ts.
2. Enumerate pattern stories at runtime; do not hardcode the list.
3. For each story, run review_salt_ui and assert
   findings.blocking.length === 0.
4. On failure, the assertion message must include the story path, the
   heuristic id, and a one-line excerpt of the flagged code so the
   gap is actionable.
5. Do not fix flagged heuristics in this PR — list them in the PR
   description as "Heuristics to repair," same coverage-spec pattern
   as PR 3.

Do not modify pattern stories. Stories are the canonical reference;
heuristics flex around them.
```

### PR 15 — Task 1.8 (`get_salt_entities` batch lookup)

Trace-leveraged: M13 / F6 cites 19 round-trips per create turn. Batch lookup is the cheapest cut.

```
Implement task 1.8 from packages/mcp/docs/gold-standard-roadmap.md.

Read first:
- packages/mcp/docs/session-findings-2026-06.md root cause #5 (M13 / F6)
- packages/mcp/src/server/toolDefinitions.ts — the existing
  get_salt_entity tool
- packages/semantic-core/src/tools/getSaltEntity.ts
- packages/skills/salt-ds/SKILL.md — create-workflow guidance that
  currently does N sequential lookups

Goal: add a get_salt_entities({ names: string[], include?: Section[] })
batch tool that returns N entity records in one round-trip. Update the
skill to prefer the batch form when ≥2 entities are needed in the
canonical create flow.

Required:
1. New get_salt_entities Zod input + output schema, executor, MCP
   registration. Reuse the existing get_salt_entity resolver.
2. Accept names as an ordered array; preserve order in the response.
3. If a name is ambiguous, return per-name ambiguity rather than
   failing the whole batch.
4. Update packages/skills/salt-ds/**.md to call out the batch form.
5. Regression test: assert the canonical create flow now uses one
   batch call instead of N sequential get_salt_entity calls.
6. Update README and public-api-matrix.md.

Tell me the schema shape before implementing. Do not split
toolDefinitions.ts in this PR — that's task 1.2.
```

### PR 16 — Task 2.10 (theme-aware `create_salt_ui`)

**Depends on PR 10.** The question this PR adds needs SaltProviderNext to be a real registry entity so the brand-prop defaults can be cited from data, not prose.

```
Implement task 2.10 from packages/mcp/docs/gold-standard-roadmap.md.

Read first:
- packages/mcp/docs/gold-standard-roadmap.md §Phase 2 task 2.10
- packages/mcp/docs/session-findings-2026-06.md root cause #6 (M14 / F7)
- packages/semantic-core/src/tools/createSaltUi.ts
- packages/semantic-core/src/tools/publicContract.ts — the ask_user
  action kind and its schema

Goal: when the create prompt is theme-ambiguous AND the repo has no
declared theme provider, create_salt_ui emits action.kind: ask_user
with one targeted question:

  "stable SaltProvider (base theme) or SaltProviderNext (JPM Brand)?"

Surface the registry-backed prop defaults inline in the question
payload so the host can render them.

Required:
1. Detect theme-ambiguous prompts via a narrow keyword set (theme,
   brand, provider, primary color, accent, JPM, dark mode). No
   inference soup.
2. Detect "repo has no declared theme provider" via
   get_salt_project_context output. If a provider is declared, skip
   the question and use it.
3. Emit ask_user with structured options
   (id: "salt-provider" | "salt-provider-next") plus the
   registry-backed prop defaults pulled from the SaltProviderNext
   entity that PR 10 added.
4. Regression test: a theme-ambiguous prompt against a clean repo
   produces ask_user on turn 1, not later.

Do not change the ask_user contract shape — that's 2.4.
```

### PR 17 — Task 2.15 (E4 agent provenance attestations) — *rev-3 narrowing: payload, not on-disk format*

**Depends on PR 7.** Reuses the `--hook` flag and `hookIO` helper landed there.

> **Why this prompt changed (rev 10):** the rev-2 design wrote attestations to a Salt-chosen on-disk layout (`.salt/attestations/<hash>.json`). The rev-3 foundation-strict pass (roadmap §2.1.6 and Appendix B) cut that: Salt does not pick the disk layout, the hashing algorithm, the retention policy, the GC story, or the sharding strategy for the consumer's audit store. The narrowed shape ships the attestation **payload** as a published Zod schema and emits it on stdout when `--emit-attestation` is set. Consumers wire stdout to whatever audit store they already have (git notes, signed commits, GitHub check API, SIEM, internal audit log, plain file). The `.salt/attestations/<hash>.json` directory becomes a demo default in `workflow-examples/`, not a Salt foundation commitment.

```
Implement task 2.15 from packages/mcp/docs/gold-standard-roadmap.md
under the rev-3 "ship payloads, not formats" narrowing.

Read first:
- packages/mcp/docs/gold-standard-roadmap.md §Phase 2 task 2.15
  (the rev-3 narrowing is in the row note)
- packages/mcp/docs/gold-standard-roadmap.md §2.1.6 ("ship payloads,
  not formats" principle, attestation row in the cut table)
- packages/mcp/docs/session-findings-2026-06.md E4
- packages/cli/src/lib/hookIO.ts (landed in PR 7)
- packages/cli/src/commands/workflow.ts — the --hook implementation

Goal: when salt-ds review --hook runs from PostToolUse, EMIT a
Zod-typed attestation payload on stdout when --emit-attestation is
set. The payload captures registry_hash, evidence_refs, files_touched
(with post-edit content hash), post_action_ran, trace_id (placeholder
for Phase 4.1 replay), and a timestamp. Salt does NOT write the
payload to a Salt-chosen file path; consumers pipe stdout to whatever
audit store they already use.

Required:
1. Pin the attestation payload as a Zod schema in
   packages/semantic-core/src/tools/publicContract.ts (or a sibling
   contract module). Export the TypeScript type. The schema will be
   published at salt-ds.dev/schemas/attestation/v1 by Phase 5; for
   this PR just pin the Zod source-of-truth.
2. Add a --emit-attestation flag on salt-ds review (within the
   §2.1.7 flag budget — review is at 12 currently after PR 8's cleanup;
   --emit-attestation makes it 13, so you must remove a flag in the
   same PR or split this to a separate PR. Check the post-PR-8 flag
   count before editing). When set, on a clean PostToolUse review,
   emit the attestation payload as NDJSON on stdout (one line).
3. Add a --verify-attestations flag on salt-ds review. Reads
   attestation payloads from stdin (one per line), verifies the
   recorded file hashes against the current committed file hashes,
   exits non-zero on drift. Standalone-usable in CI as well as from a
   Stop hook.
4. Update bootstrap_salt_repo to write a Stop hook alongside the
   PostToolUse hook from PR 7. The Stop hook should pipe stdin (the
   consumer's chosen audit store output) into
   `salt-ds review --verify-attestations`. Document the default
   demo pattern (a file at workflow-examples/.../attestations.ndjson)
   in workflow-examples/, NOT as a Salt-side foundation commitment.
5. Tests: emit-on-PostToolUse (parses as the published Zod schema);
   verify-pass on consistent input; verify-fail after a manual edit;
   verify-pass after a clean rerun.
6. Document the attestation payload schema and the consumer
   composition pattern (git notes, signed commits, GitHub check API,
   SIEM, audit log, plain file) in packages/cli/README.md and
   packages/cli/docs/ci-integration.md (which PR 8 created).

Do NOT:
- Write attestations to a Salt-chosen file path. The CLI emits to
  stdout; consumers redirect.
- Pick a hashing algorithm in the contract — leave hashing to a
  per-payload field (`hash_alg: "sha256"` etc.) so consumers can
  upgrade independently.
- Add a retention / GC policy. That's the consumer's audit store's job.
- Implement 2.16 in this PR.

Tell me the Zod schema shape, the flag-budget impact, and the
workflow-examples/ demo path BEFORE editing.
```

### PR 18 — Task 2.16 (E5 policy-driven escalation)

**Depends on PR 7 and PR 8.**

```
Implement task 2.16 from packages/mcp/docs/gold-standard-roadmap.md.

Read first:
- packages/mcp/docs/gold-standard-roadmap.md §Phase 2 task 2.16
- packages/mcp/docs/session-findings-2026-06.md E5
- packages/cli/src/lib/hookIO.ts
- packages/semantic-core/src/policy — the .salt/team.json schema

Goal: when salt-ds review --hook detects a PreToolUse event, read
.salt/team.json require_human_review_for: [{ kind, reason?, scope? }]
and emit hookSpecificOutput.permissionDecision: "ask" for matching
edits before they happen. CI (PR 8) blocks matching PRs unless they
carry the salt-human-reviewed label.

Required:
1. Extend the .salt/team.json schema in packages/semantic-core/src/policy
   to accept require_human_review_for. Document the kinds
   (e.g. "auth-flow-edit", "license-change", "schema-migration") and
   the matching algorithm.
2. PreToolUse branch in salt-ds review --hook that consults the schema
   and emits permissionDecision: "ask" with a structured reason.
3. CI integration in salt-ds review --since <ref> (PR 8) that detects
   require_human_review_for matches and fails unless the PR carries
   the salt-human-reviewed label.
4. Tests: PreToolUse matching, non-matching, label-present,
   label-absent.
5. Update workflow-examples/consumer-repo/.salt/team.json to show a
   non-trivial require_human_review_for example.

Do not change unrelated team.json fields.
```

### Later: Phase 1 mega-file splits

For each mega-file split, one PR each, **Opus 4.7 High 1M** for each:

```
Implement Phase 1 task 1.1 (or 1.2, 1.3 — pick one) from packages/mcp/docs/gold-standard-roadmap.md.

Read packages/mcp/docs/gold-standard-roadmap.md Appendix A for the safe
split order and the file in question:
- packages/cli/src/commands/workflow.ts (3,337 lines) for task 1.1
- packages/mcp/src/server/toolDefinitions.ts (2,034 lines) for task 1.2
- packages/semantic-core/src/tools/publicContract.ts (2,374 lines) and
  workflowContracts.ts (2,334 lines) for task 1.3

Split the file into a directory per Appendix A. Keep a thin barrel module
at the original path so external imports don't break. After each
extracted module, run the matching spec (workflowScenarios.spec.ts for 1.1,
tools.spec.ts + createServer.spec.ts for 1.2). No PR may grow a touched
file's line count.

Tell me the proposed directory layout BEFORE moving any code. After I
approve, do the split as one PR with logical commits per workflow / per
tool. Do not narrow the semantic-core exports in the same PR — that's
task 1.4.
```

## 4. Recovery patterns when the agent goes off-script

| Symptom | Send back |
|---|---|
| Agent bundled multiple roadmap tasks | "Revert all changes outside task <N>. Re-do only task <N> as scoped in the original prompt." |
| Agent claimed tests pass but didn't run them | "Run `yarn vitest run <path>` in the terminal and paste the exit code." |
| Agent invented a Salt API | "That entity is not in the registry. Use `get_salt_entity` for the actual name or stop and tell me what's missing." |
| Agent skipped the pre-edit decision checkpoint | "Stop. Tell me which option you picked and why before any further edits." |
| Agent edited workflow.ts (Phase 1) without splitting | "That edit grew the file. Revert. Phase 1 says no PR may grow a touched file's line count." |
| Agent suggested adding a new tool/subcommand/package | "Check roadmap Appendix B and §2.1.5. If the proposal doesn't pass the four-question test, don't add it." |

## 5. Token / credit budget guide

For one full pass through PRs 1–9 (roughly Phase 0 + initial Phase 2):

| Tier | Estimated premium-request count | Rough credit burn |
|---|---|---|
| Sonnet 4.5 (PRs 1, 2, 4, 8) | ~80 requests | Low |
| Opus 4.7 medium (PRs 3, 6, 7) | ~120 requests | Medium |
| Opus 4.7 High 1M (PR 5, plus each Phase 1 file split) | ~200 requests per PR | High |

If your Copilot Enterprise quota is constrained, do PRs 1, 2, 4, 8 first — they're the small Sonnet-tier wins and they unblock everything else without burning Opus credits.

**PRs 10–18 (the remaining Phase 0–2 work) add roughly:**

| Tier | Estimated premium-request count | Rough credit burn |
|---|---|---|
| Sonnet 4.5 (PRs 11, 12, 13, 18) | ~80 requests | Low |
| Opus 4.7 medium (PRs 10, 14, 15, 16, 17) | ~250 requests | Medium |
| Opus 4.7 High 1M | none in this tranche | — |

No High 1M needed here — the architectural reasoning is bounded per PR. PR 10 (task 0.7) is the next-most-leveraged of the tranche: it turns the 0.6 spec from failing to green and unblocks PRs 14 and 16.

## 6. Per-PR pre-flight checklist

Before pasting any prompt:

- [ ] Fresh chat session
- [ ] Mode = Agent (per §0 instructions for your IDE)
- [ ] Model set per §2 table
- [ ] Custom agent picker, if visible, on the default (not `@SaltUI`)
- [ ] Working directory = repo root
- [ ] Branch is up to date with `mcp` (`git pull --rebase`)
- [ ] No uncommitted changes from previous PR (`git status` clean)
- [ ] Roadmap and findings docs accessible (the agent will need to read them)

After the agent says it's done:

- [ ] Read the diff in `git diff --stat` — does the scope match the prompt?
- [ ] Run the suggested vitest command yourself
- [ ] Check that no files outside the PR scope were modified
- [ ] Commit with the PR title the agent suggested (or your own)
- [ ] Start a fresh chat for the next PR

## 7. Notes for fresh sessions

If you (or a teammate) returns to this doc weeks later:

- The model recommendations may have shifted — re-evaluate against whatever Opus/Sonnet tier is current.
- The roadmap §2.1.5 scope discipline still applies. Don't add new tasks; if something seems missing, check Appendix B first.
- If new Phase 2 items (E1+E2 hooks especially) have already landed, you can probably drop a tier on later PRs — enforced review reduces model-self-discipline risk.
- The chat.json trace pattern still applies: name the workflow, scope before content, force pre-edit decisions, treat the workflow result as a contract.
- Check §8 first before assuming a failing test is yours to fix — pre-existing failures discovered by earlier PRs are recorded there with reproduction anchors.

## 8. Known follow-ups (gap lists from landed PRs)

Each entry below either (a) has a scoped roadmap row already and is waiting on its turn in the queue, or (b) is something a landed PR uncovered but didn't fix. Treat this section the same way you treat the §2 status column: when you close one, strike it out with the commit anchor; when you discover a new one, add a row.

The pattern this section follows mirrors §2 of the gold-standard roadmap: **the failing spec / observed bug is the input spec for the follow-up PR.** Don't paraphrase the gap list — point at the test that produces it so the follow-up author can re-run it and re-verify.

### 8.1 Task 0.8 heuristic-repair gap list (next: roadmap row 0.8a)

- **Source of truth:** `packages/mcp/src/__tests__/canonicalExampleReviewRoundTrip.spec.ts` (commit `73913767a`). The spec fails today by design; its assertion message is the actionable gap list. Re-run with `yarn vitest run packages/mcp/src/__tests__/canonicalExampleReviewRoundTrip.spec.ts` to refresh.
- **Where the work is tracked:** `gold-standard-roadmap.md` row **0.8a** ("Close the 0.8 canonical-example gap list").
- **Snapshot of the gap (9 blocking findings, all from one heuristic):**

  | Heuristic | Story | Line | Composition |
  |---|---|---|---|
  | `composition.nested-interactive-primitives` / `avoid-nesting-interactive-salt-primitives` | `announcement-dialog.stories.tsx` | 69 | Dialog → Button |
  | (same) | `app-header.stories.tsx` | 109 | Tooltip → Button (this is the literal M11 / F4 case) |
  | (same) | `breadcrumbs.stories.tsx` | 117 | Menu → Button |
  | (same) | `contact-details.stories.tsx` | 182 | Tooltip → Button |
  | (same) | `file-upload.stories.tsx` | 190 | Tooltip → Button |
  | (same) | `keyboard-shortcuts.stories.tsx` | 238 | Dialog → Switch |
  | (same) | `list-builder.stories.tsx` | 200 | Tooltip → Button |
  | (same) | `menu-button.stories.tsx` | 26 | Menu → Button |
  | (same) | `split-button.stories.tsx` | 32 | Menu → Button |

- **Why it's narrow:** all 9 findings come from one over-aggressive heuristic. Menu Button **is** Menu + Button by definition; Tooltip is **designed** to wrap interactive elements to add hover/focus metadata; Dialog is the canonical container for action controls and form toggles. The fix is almost certainly an allow-list keyed on parent pattern (Menu / Tooltip / Dialog) — see roadmap 0.8a for the scoped plan.

### 8.2 Pre-existing test failures discovered while verifying landed PRs

Both items below were verified pre-existing by stashing the in-flight changes and re-running. They are **not** caused by PR 13 or PR 14 — they are surfaced here so they don't get attributed to the wrong commit and so the next maintainer can pick them up.

#### 8.2.1 `agenticEvals.spec.ts > deterministic agentic evals > "falls back to component routing when a forced-pattern file-manager prompt still clearly names Table"`

- **Status:** Reproduces on plain `mcp` HEAD (verified with PR 13's `toolDefinitions.ts` swaps stashed).
- **Symptom:** semantic-core's `createSaltUi` returns `solution_type: "pattern" / decision.name: "Breadcrumbs"` for the prompt `"file manager with breadcrumbs navigation and a data table showing files and folders"` when called with `solutionType: "pattern"`. Test expects `solution_type: "component" / Table`.
- **Owner code:** `packages/semantic-core/src/tools/createSaltUi.ts` (forced-pattern fallback logic).
- **Likely cause:** an in-flight change on this branch (the working tree has unrelated WIP across `packages/semantic-core/src/build/*`, `packages/semantic-core/src/tools/getExamples.ts`, `packages/semantic-core/src/types.ts`, and the registry loaders) — but the regression was not introduced by PR 13 or 14.
- **Anchor:** `packages/mcp/src/__tests__/agenticEvals.spec.ts:552`.

#### 8.2.2 `publicContractParity.spec.ts` — 4 upgrade / migrate semantic mismatches

- **Status:** Reproduces on plain `mcp` HEAD (verified with PR 13's `toolDefinitions.ts` swaps stashed).
- **Symptom:** confidence-level / safety-shape divergence between the CLI and the MCP for upgrade and migrate workflows. Example diff:
  ```
  - "confidence_level": "medium",
  + "confidence_level": "high",
  ```
- **Affected tests:**
  - `public contract parity > keeps migrate compact semantics aligned across CLI and MCP`
  - `public contract parity > keeps upgrade compact semantics aligned across CLI and MCP`
  - `public contract parity > keeps migrate full semantics aligned where CLI and MCP overlap`
  - `public contract parity > keeps upgrade full semantics aligned where CLI and MCP overlap`
- **Anchor:** `packages/mcp/src/__tests__/publicContractParity.spec.ts:1413` (and the three sibling cases).
- **Owner code:** likely the workflow-output envelope on one of the two surfaces; not yet bisected.
- **Note:** these did not block any of PRs 11 / 12 / 13 / 14 landing, but the CLI/MCP parity contract is one of the explicit invariants the spec exists to protect, so this should not stay broken indefinitely.

### 8.3 Roadmap task 0.5 (tidy working-tree noise) — partly done

- **Source of truth:** `gold-standard-roadmap.md` row 0.5 (Phase 0).
- **Status:** `chat.json` is no longer tracked in the working tree (likely already deleted). `site/component-category-map.json` is still in the modified-but-uncommitted set on this branch.
- **Action:** include the category-map change in whatever PR is shipping the matching docs/extraction work it belongs to, or back it out if it was incidental.

### 8.4 PR 18 (task 2.16) cleanup is folded into the lean PR 8 (rev 8)

- **Original framing (rev 7):** PR 18's CI-side label gate was "blocked" on PR 8's `--since` plumbing and the `salt-human-reviewed` label convention.
- **Rev-8 redesign:** PR 8 drops `--since` and `--add-ci-checks` entirely (see §8.6). The CI gate is now whatever the consumer's CI already uses — labels, CODEOWNERS, branch protection — and the CLI is no longer in the bypass-mechanism business.
- **What remains:**
  - PreToolUse `require_human_review_for` matching is already landed in `salt-ds review --hook` (rule schema in `packages/cli/src/commands/workflow.ts` ~line 3423; help text in `packages/cli/src/lib/args.ts`; cli.spec.ts test at line 6457).
  - Lean PR 8 surfaces the same policy as an ordinary blocking finding on `salt-ds review <files...>` so CI and the agent hook reach the same primitive through different entry points. No new flags, no env-var plumbing.
  - Add a non-trivial `require_human_review_for` example to `workflow-examples/consumer-repo/.salt/team.json` per the original PR 18 brief (step 5) — included in PR 8's scope.
- **Action:** no separate fast-follow needed; the cleanup closes inside the lean PR 8 session.

### 8.5 PR 12 (task 0.9) `toolDefinitions.ts` regression — reverted during PR 9 — *✅ closed by PR 12 re-land (commit `2445e8b6c`)*

**Closed 2026-06-11.** All six checklist items below landed in commit `2445e8b6c`, and `packages/mcp/src/__tests__/installDependenciesContextInvalidation.spec.ts` is 2/2 green. The skill-prose half closed at the same time: `packages/skills/salt-ds/references/shared/copilot-hosts.md`'s `install_dependencies` bullet now drops the manual `get_salt_project_context` rerun instruction. `packages/skills/salt-ds/agents/openai.yaml` was inspected during the re-land and is already correct — it uses generic "rerun the originating workflow with the returned evidence bridge" phrasing and never instructed a manual `get_salt_project_context` call, so no edit was needed. Full `@salt-ds/mcp` suite: 17 failures present with PR 12 applied, all 17 cross-checked as pre-existing by stash-and-rerun against the same 7 suspect files (`publicContractParity.spec.ts` 4 + `tools.spec.ts` 3 + `liveEvalHarness.spec.ts` 5 + `translationModules` / `createCatalogSupport` / `canonicalExampleReviewRoundTrip` / `semanticRegression` / `agenticEvals` 1 each = 17 identical hits on the pre-PR-12 working tree). The historical reproduction details below are kept as the audit trail.

- **Source of truth:** `git --no-pager log --oneline packages/mcp/src/server/toolDefinitions.ts` still shows commit `3b1118187` as HEAD; the in-flight PR 12 work in that file is **not** in the working tree any more.
- **Why it was reverted:** the in-flight edits had partially deleted `resolveProjectContext`, `resolveOrCollectProjectContext`, and `decodeProjectContextId` (function signatures removed but their bodies left as orphan blocks), and the `ToolExecutionRuntime` interface lost its `projectContexts` and `lastProjectContextId` fields. esbuild refused to parse the file, which took down every MCP-side suite. PR 9 needed those suites green to verify task 2.9; reverting `toolDefinitions.ts` to HEAD was the only path that kept PR 9's contract-shape change verifiable without spending the session re-deriving PR 12's intended shape from a half-corrupted diff.
- **What's still on disk (intact and committable):**
  - `packages/mcp/src/__tests__/installDependenciesContextInvalidation.spec.ts` (untracked, expects the runtime to invalidate the cached context after `install_dependencies` completes)
  - `packages/skills/salt-ds/agents/openai.yaml` (action-loop guidance dropped the manual `get_salt_project_context` rerun instruction)
  - The skill-prose updates in `SKILL.md`, `transport.md`, and `copilot-hosts.md` describing the new behavior
- **What needs to be re-landed in `toolDefinitions.ts`:**
  1. `staleProjectContextIds: Set<string>` field on `ToolExecutionRuntime` (keep `projectContexts` and `lastProjectContextId` as well).
  2. `staleProjectContextIds: new Set()` initialization in `createToolExecutionRuntime`.
  3. `runtime.staleProjectContextIds.delete(contextId)` line inside `cacheProjectContext` so successful caching clears the stale flag.
  4. New helpers `isProjectContextStale(runtime, contextId): boolean` and `markProjectContextStale(runtime, rootDir): void`.
  5. Stale-context refresh branch inside `resolveOrCollectProjectContext`: when the requested `contextId` is in `staleProjectContextIds`, re-collect via `collectSaltProjectContextData` before returning, and skip the auto-reuse of `lastProjectContextId` when it is stale.
  6. `markProjectContextStale` call at every `install_dependencies` post-execution site so the next workflow turn transparently refetches package state.
- **Verification:** `yarn vitest run packages/mcp/src/__tests__/installDependenciesContextInvalidation.spec.ts` should pass 2/2 after re-landing.
- **Process lesson for future PRs:** the IDE/editor agent had a write-race that silently dropped edits across tool calls, which is how PR 12's `toolDefinitions.ts` work corroded over the past few sessions without anybody catching it. Mitigations: (a) commit each PR as soon as it's verified green instead of letting the working tree accumulate dozens of half-applied edits across overlapping PRs; (b) when an edit tool reports success but a follow-up `git diff` shows nothing landed, fall back to a python/sed script that bypasses the editor surface; (c) before starting any cross-file refactor, snapshot the affected files (`cp`, `git stash`, or a branch) so a corrupted in-flight state is recoverable.


### 8.6 PR 8 (task 2.13) rev-7 CLI surface to back out — *added rev 8 · ✅ closed by PR 8 (commit `4b4ad4557`)*

**Closed 2026-06-11.** All back-out items in this section landed in commit `4b4ad4557`. Verification block ran clean: `git grep SALT_REVIEW_HUMAN_REVIEWED_LABEL` returns zero hits outside this doc; `git grep -- '--since'` inside `packages/cli/src/` returns zero hits; `salt-ds review <file-matching-policy>` exits 20 with `rule_id` `policy.require_human_review_for.auth-flow-edit`. The historical content below is kept as the audit trail for what the rev-7 in-flight surface looked like — do not re-introduce.

---

Discovered while reviewing the rev-8 design question: does `--since` pull its weight, and is the CLI taking on too many flags? Conclusion was **no** and **yes** respectively — see the rev-8 entry in the Revision history and the redesigned PR 8 prompt in §3. The rev-7 prompt drove a chunk of CLI surface into the working tree that is uncommitted and **must be removed before PR 8 lands in its lean form**, otherwise the lean prompt above will be working against scaffolding that contradicts it.

- **What's on disk (uncommitted as of 2026-06-10).** Anchored by `git grep` patterns + symbol excerpts rather than line numbers — the rev-8 line-number anchors were brittle to any other edit landing in the same files, but the symbols and the help-text strings are stable enough to re-find reliably. Run each grep before editing to confirm the hit list is still what's described here.
  - **`packages/cli/src/lib/args.ts`** (1 `SALT_REVIEW_HUMAN_REVIEWED_LABEL` hit, 4 mentions of the rev-7 flags). `git grep -n -- '--since\|--pretty\|--add-ci-checks\|SALT_REVIEW_HUMAN_REVIEWED_LABEL' packages/cli/src/lib/args.ts` enumerates the help-text and usage-example lines that advertise the rev-7 surface (currently 4 lines in the `salt-ds init` / `salt-ds review` synopses and the explanatory paragraph that describes the env-var gate).
  - **`packages/cli/src/commands/init.ts`** — the `flags["add-ci-checks"]` branch plus the `.github/workflows/salt-review.yml` and GitLab snippet/root writers. `git grep -n 'add-ci-checks\|gitlabSnippet\|gitlabRoot\|SALT_GITLAB_CI_ROOT_RELATIVE_PATH' packages/cli/src/commands/init.ts` enumerates the call sites; the GitHub Actions writer lives in the `addCiChecks` branch (currently a single `flags["add-ci-checks"] === "true"` test), the GitLab snippet/root writers live in dedicated `gitlabSnippetPath` / `gitlabRootPath` blocks earlier in the file. Remove all of them; the lean PR 8 ships no init-side CI scaffolding.
  - **`packages/cli/src/commands/workflow.ts`** (7 `SALT_REVIEW_HUMAN_REVIEWED_LABEL` hits) — the `--since` resolver, the Salt-affected-file filter built on top of it, and the exit-code branches that consume the env var. `git grep -n 'resolveSinceDiff\|review --since\|SALT_REVIEW_HUMAN_REVIEWED_LABEL' packages/cli/src/commands/workflow.ts` enumerates the work. The whole `// ---------- salt-ds review --since <ref> (Phase 2 task 2.13 / E2) ----------` block comes out, including the `SALT_REVIEW_HUMAN_REVIEWED_LABEL_ENV_VAR` / `SALT_REVIEW_HUMAN_REVIEWED_LABEL_VALUE` constants and the structured `env_var` reason emitted on policy match.
  - **`packages/cli/src/__tests__/cli.spec.ts`** (12 `SALT_REVIEW_HUMAN_REVIEWED_LABEL` hits) — the `--since` cases, the four `--add-ci-checks` cases, the env-var bypass cases, and the `initGitRepo` / `commitAll` / `setupSinceFixtureRepo` helpers (back out the helpers only if no other test consumes them; check with `git grep -n 'setupSinceFixtureRepo\|initGitRepo\|commitAll' packages/cli/src/__tests__/cli.spec.ts`). For the test enumeration, use `git grep -n 'review --since\|add-ci-checks\|SALT_REVIEW_HUMAN_REVIEWED_LABEL' packages/cli/src/__tests__/cli.spec.ts` and remove whole `describe` / `it` blocks rather than picking off individual lines.
  - **`packages/cli/README.md`** (1 `SALT_REVIEW_HUMAN_REVIEWED_LABEL` hit) — one paragraph in the documented `salt-ds review` flag list that describes the `--since` + env-var integration. `git grep -n -- '--since\|SALT_REVIEW_HUMAN_REVIEWED_LABEL' packages/cli/README.md` finds it. Replace with a one-line pointer to `packages/cli/docs/ci-integration.md`.
  - **`packages/semantic-core/src/bootstrapScaffolding.ts`** (8 `SALT_REVIEW_HUMAN_REVIEWED_LABEL` hits) — *added rev 9.* This is the bootstrap-side writer that produces the `.github/workflows/salt-review.yml` and `.gitlab-ci.yml` blocks `init --add-ci-checks` emits. It exports `SALT_REVIEW_HUMAN_REVIEWED_LABEL_ENV_VAR` and `SALT_REVIEW_HUMAN_REVIEWED_LABEL_NAME` as constants and embeds both names verbatim in the generated YAML, so the env-var convention survives in newly-bootstrapped consumer repos even when the CLI surface is gone. `git grep -n 'SALT_REVIEW_HUMAN_REVIEWED_LABEL\|salt-human-reviewed\|salt-review\.yml\|gitlab-ci' packages/semantic-core/src/bootstrapScaffolding.ts` enumerates the call sites. Remove the constants and the CI-YAML emitter together; the lean PR 8 ships no bootstrap CI scaffolding.
  - **`packages/semantic-core/schemas/project-conventions.schema.json`** (1 `SALT_REVIEW_HUMAN_REVIEWED_LABEL` hit) — *added rev 9.* The `require_human_review_for` description string in the published JSON Schema documents the env-var as the CI bypass mechanism. `git grep -n SALT_REVIEW_HUMAN_REVIEWED_LABEL packages/semantic-core/schemas/project-conventions.schema.json` finds it. Rewrite the description to describe what the rule **does** (escalates matching changes to human review and surfaces as a blocking `policy.require_human_review_for.<kind>` finding) and point at `packages/cli/docs/ci-integration.md` for the consumer-side bypass story; the published schema should not describe the bypass mechanism of one specific CI integration.
  - Any `SALT_REVIEW_HUMAN_REVIEWED_LABEL` env-var read anywhere else in the tree. `git grep SALT_REVIEW_HUMAN_REVIEWED_LABEL` should return zero hits outside `packages/mcp/docs/implementation-handoff.md` (i.e. this doc) when back-out is complete.

- **Why back it out (the rev-8 design rationale):**
  - `--since` is a 1-line shell wrapper around the existing `salt-ds review [target ...]` primitive (`git diff --name-only --diff-filter=ACMR "$BASE" -- '*.{ts,tsx,jsx,js,mdx}' | xargs -r npx salt-ds review`). The CLI does not earn a flag for saving five lines of shell glue per CI integration.
  - Most teams want to know about the **current state** of their UI (drift, deprecation debt, brand-migration progress), not the diff. `salt-ds review .` already does that; `--since` would tilt the tool's center of gravity toward CI-only usage and away from the developer-on-laptop case.
  - `--add-ci-checks` writes opinionated CI files at canonical paths (`.github/workflows/salt-review.yml`, `.gitlab-ci.yml`). That crosses the line from primitive into policy and silently assumes GitHub or GitLab — no Bitbucket, CircleCI, Jenkins, Azure DevOps, Buildkite, etc.
  - `SALT_REVIEW_HUMAN_REVIEWED_LABEL` couples the CLI to a specific bypass mechanism (env-var-flips-result, with the label noun baked in). Gold-standard CLIs exit non-zero on the violation and let the CI wrapper decide whether to swallow the exit code based on labels, approvals, CODEOWNERS, branch protection, ticket-system gates, or whatever convention the org already runs.
  - Today's `salt-ds review` is being asked to do too many orthogonal jobs by the time PRs 7 / 8 / 17 stack: review files, do hook IO, do diff-mode, verify attestations. That is not a primitive any more. Gold standard = one verb does one thing well, plus great composition docs.

- **What replaces it (the lean PR 8, in §3):**
  - `salt-ds review <files...>` stays exactly as it is today.
  - `require_human_review_for` violations are surfaced as ordinary blocking findings with a stable rule id (`policy.require_human_review_for.<kind>`).
  - `packages/cli/docs/ci-integration.md` documents the 5-line GH Actions snippet, the 5-line GitLab snippet, and one paragraph on bypass mechanisms living in the consumer's CI config.
  - `workflow-examples/consumer-repo/.salt/team.json` gets a non-trivial `require_human_review_for` example.

- **Verification when back-out + lean PR 8 lands:**
  - `git diff packages/cli/src/lib/args.ts` against `mcp` HEAD: zero new `salt-ds review` flags, zero new `salt-ds init` flags.
  - `git grep SALT_REVIEW_HUMAN_REVIEWED_LABEL`: zero hits.
  - `git grep -- '--since'` inside `packages/cli/src/`: zero hits (other than this doc).
  - `salt-ds review <file-matching-the-policy>` exits non-zero with one blocking finding whose `rule_id` starts with `policy.require_human_review_for.`.
  - The two snippets in `packages/cli/docs/ci-integration.md` are runnable as-is when pasted into a real GitHub Actions or GitLab CI job.

- **If you disagree with the rev-8 redesign:** before re-expanding the surface, write down which specific gold-standard property the lean shape fails (e.g. "consumers reported they couldn't compose `git diff | xargs salt-ds review` reliably because X"). Speculative re-expansion is the same trap that produced the rev-7 prompt — every flag we ship is a flag we can't quietly remove later.

End of handoff.
