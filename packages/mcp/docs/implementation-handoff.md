# Implementation Handoff — Prompts, Copilot Settings, and Session Plan

Status: working tracker for Phase 0 → Phase 2 implementation work. The roadmap is the source of truth for scope; this doc only sequences PRs and provides paste-ready prompts.
Date: 2026-06-09
Companion to: `gold-standard-roadmap.md`, `session-findings-2026-06.md`

Use this as a printable cheat sheet when starting each PR. Each section is paste-ready. When a PR lands, mark its row in §2 done so the next maintainer knows where to pick up.

> **Revision history**
>
> - **2026-06-10 rev 7:** Authored the two §3 paste-ready prompts that had been deferred since rev 3 — **PR 8 (task 2.13: CI required check + E2)** and **PR 9 (task 2.9: split `status: partial` into `partial` + `internal_limitations`)**. PR 8's prompt also folds in the §8.4 cleanup (the CI-side label gate that PR 18 left half-done waiting on `salt-ds review --since`), so closing both lands together. The "deferred prompt" note between PR 7 and PR 10 is replaced with a forward-pointer to PR 18's §8.4 cleanup. No code changes.
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
   - If a "Custom agents" or "Experimental features" toggle exists, leave custom agents OFF (we're dropping `@SaltUI` in PR 2 anyway).

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
| 8 | **2.13** CI required check (E2) | Sonnet 4.5 | Agent | 1.5 hr | Low | |
| 9 | **2.9** split `status: partial` | Opus 4.7 High | Agent | 2 hr | Medium | |
| 10 | **0.7** close the 0.6 coverage gap list (upstream fixes) | Opus 4.7 (medium) | Agent | 3 hr | Medium | ⚠️ Partial — (a) **landed**: `SaltProviderNext` props are in the registry, brand-prop defaults extracted, JPM Brand example present in `examples.json`. (b) **not landed**: `composition_contract` field still missing on 28 pattern records (0.6 spec fails). (c) **not landed**: 24 foundation entities still have no canonical example, no `site/foundation-category-map.json`. Also: the `SaltProviderNext` first-class-entity check in `registryCoverage.spec.ts` still raises 2 gaps because the spec searches for the exact name and the extracted entity record name doesn't match — bisect before assuming this is registry vs. spec. |
| 11 | **0.11 + 2.11** plain-text file-path fallback | Sonnet 4.5 | Agent | 45 min | Low | |
| 12 | **0.9** auto-invalidate context on `install_dependencies` | Sonnet 4.5 thinking | Agent | 1 hr | Low | ✅ Done (`packages/mcp/src/__tests__/installDependenciesContextInvalidation.spec.ts` 2/2 pass; `staleProjectContextIds` set added to `ToolExecutionRuntime` in `toolDefinitions.ts`; `packages/skills/salt-ds/agents/openai.yaml` action-loop guidance updated to drop the manual `get_salt_project_context` rerun instruction) |
| 13 | **0.10** tool-selection benchmark | Sonnet 4.5 | Agent | 1.5 hr | Low | ✅ Done (commit `3b1118187`; ranker + 20-prompt corpus + 4 description swaps; see §8.2 for pre-existing failures unmasked while verifying) |
| 14 | **0.8** canonical-example round-trip test (depends on PR 10) | Opus 4.7 (medium) | Agent | 1.5 hr | Medium | ✅ Done as a failing spec (commit `73913767a`); follow-up heuristic-repair work is **roadmap row 0.8a** — see §8.1 for the 9-story gap list |
| 15 | **1.8** `get_salt_entities` batch lookup (M13 / F6) | Opus 4.7 (medium) | Agent | 2 hr | Medium | |
| 16 | **2.10** theme-aware `create_salt_ui` (depends on PR 10) | Opus 4.7 (medium) | Agent | 2 hr | Medium | |
| 17 | **2.15** agent provenance attestations (E4, depends on PR 7) | Opus 4.7 (medium) | Agent | 3 hr | Medium | |
| 18 | **2.16** policy-driven escalation (E5, depends on PR 7) | Sonnet 4.5 | Agent | 1.5 hr | Low | ⚠️ Partial — PreToolUse `require_human_review_for` branch landed in `salt-ds review --hook` (rule schema in `packages/cli/src/commands/workflow.ts`; help text in `packages/cli/src/lib/args.ts`; cli.spec.ts test at line 6457 passes). **Not landed**: the CI-side label gate, because it needs PR 8's `salt-ds review --since` which is still open. Also no example added to `workflow-examples/consumer-repo/.salt/team.json` yet. |
| 19 | **Phase 1** mega-file splits (one per task: 1.1, 1.2, 1.3) | **Opus 4.7 High 1M** | Agent | 4–6 hr each | High | Not started — `workflow.ts` is 3,350 lines (slight growth on the 3,337 baseline), `toolDefinitions.ts` is 2,222 lines (grew with 0.9 work). Both files now urgently need splitting before any further Phase 2 work lands. |

Sonnet for mechanical / well-bounded work. Opus High 1M only when cross-file architectural reasoning is the bottleneck — never just because "the task feels important." Dependency order matters: PR 10 unblocks PRs 14 and 16; PR 7 unblocks PRs 17 and 18.

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

> **Note on PR 18's CI half:** PR 8 ships `salt-ds review --since` and the `.github/workflows/salt-review.yml` writer. PR 18's `require_human_review_for` PreToolUse branch is already landed (see §8.4) but its CI-side label gate is gated on PR 8 — close the §8.4 loop in the same PR 8 session.

### PR 8 — Task 2.13 (CI required check — E2)

```
Implement Phase 2 task 2.13 from packages/mcp/docs/gold-standard-roadmap.md
(also session-findings-2026-06.md E2). This pairs with PR 7's hook layer
to give Salt cross-host server-side enforcement: bypassable only by a
repo admin removing the required check.

Read first:
- packages/mcp/docs/gold-standard-roadmap.md §Phase 2 task 2.13
- packages/mcp/docs/session-findings-2026-06.md E2
- packages/cli/src/commands/workflow.ts — existing `salt-ds review`
  command and its file-args path (the --since mode extends this, it
  does not replace it)
- packages/cli/src/commands/init.ts — existing `--add-agent-hooks`
  option (the --add-ci-checks option mirrors it)
- packages/cli/src/lib/args.ts — CLI flag parsing surface

This is one PR with three pieces:

1. New `--since <ref>` mode on `salt-ds review`. When set:
   - Resolve the diff list between HEAD and <ref> via `git diff --name-only --diff-filter=ACMR <ref>`.
   - Filter to Salt-affected files (TSX/TS/JSX/JS/MDX with @salt-ds
     imports, plus .salt/team.json, .salt/stack.json).
   - Run review on the filtered set.
   - Exit non-zero (use the existing review exit-code helper) when any
     blocking finding is detected. Print findings to stdout in the
     normal compact-JSON format unless --pretty is set.
   - Also fold in PR 18's CI-side label gate: if
     `.salt/team.json` `require_human_review_for` matches any of the
     changed files AND the env var `SALT_REVIEW_HUMAN_REVIEWED_LABEL`
     is not "true", exit non-zero with a structured reason naming the
     rule. This closes §8.4 and the half-landed PR 18.

2. New `--add-ci-checks` option on `salt-ds init`. When set:
   - Write `.github/workflows/salt-review.yml` running
     `npx salt-ds review --since "${{ github.event.pull_request.base.sha }}"`
     against PR events, marked as a required check.
   - Write `.gitlab-ci.yml` snippet (or `.gitlab/salt-review.yml`
     conditional include) doing the same against
     `$CI_MERGE_REQUEST_DIFF_BASE_SHA`.
   - Both files must include the SALT_REVIEW_HUMAN_REVIEWED_LABEL
     plumbing: GitHub Actions reads the PR labels and exports the env
     var if `salt-human-reviewed` is present; GitLab reads
     `$CI_MERGE_REQUEST_LABELS`.
   - Skip writing when an existing file at the path already declares
     the salt-review job, same idempotence pattern as
     `--add-agent-hooks` in init.ts.

3. Tests:
   - cli.spec.ts cases: --since exits 0 on a clean diff, exits non-zero
     on a blocking finding, exits 0 when the diff has no Salt files,
     exits non-zero with the policy-gate reason when
     require_human_review_for matches and the label env is absent,
     exits 0 when the same diff has the label env set.
   - cli.spec.ts cases: --add-ci-checks writes the two CI files
     (create + idempotent update + no-op when already wired); init
     without --add-ci-checks does not write them.

Tell me the --since git-resolution helper API and the
`workflow-examples/consumer-repo/.salt/team.json`
`require_human_review_for` example BEFORE editing. (The example was
deferred from PR 18 — surface it here so §8.4 closes cleanly.)

Then implement and run:
yarn vitest run packages/cli/src/__tests__/cli.spec.ts
yarn vitest run packages/cli/src/__tests__/hookIO.spec.ts

Do not modify PR 7's hookIO.ts surface (E1 / E6 / E7 are settled). Do
not introduce a new public CLI surface beyond the two flags above.
```

**Verify yourself:** with two repos open — one with a clean Salt diff, one with a deprecated-prop diff — run `salt-ds review --since main` in each and confirm exit codes 0 and non-zero respectively. Then add `salt-human-reviewed` to your local label env and confirm a `require_human_review_for`-matching diff still fails without it and passes with it.

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

### PR 17 — Task 2.15 (E4 agent provenance attestations)

**Depends on PR 7.** Reuses the `--hook` flag and `hookIO` helper landed there.

```
Implement task 2.15 from packages/mcp/docs/gold-standard-roadmap.md.

Read first:
- packages/mcp/docs/gold-standard-roadmap.md §Phase 2 task 2.15
- packages/mcp/docs/session-findings-2026-06.md E4
- packages/cli/src/lib/hookIO.ts (landed in PR 7)
- packages/cli/src/commands/workflow.ts — the --hook implementation

Goal: when salt-ds review --hook runs from PostToolUse, write an
attestation record to .salt/attestations/<hash>.json capturing
registry_hash, evidence_refs, files_touched (with post-edit content
hash), post_action_ran, trace_id (placeholder for Phase 4.1 replay),
and a timestamp.

Add salt-ds review --hook --verify-attestations: invoked from a Stop
hook or standalone in CI. Verifies recorded attestations match current
committed file hashes; fails on drift.

Required:
1. Attestation writer in packages/cli/src/lib/attestations.ts
   (internal-only, do not export).
2. --verify-attestations flag on salt-ds review.
3. Update bootstrap_salt_repo to write the Stop hook alongside the
   PostToolUse hook from PR 7.
4. Tests: write-on-PostToolUse, verify-pass, verify-fail after a
   manual edit, verify-pass after a clean rerun.
5. Document .salt/attestations in packages/cli/README.md.

Do not implement 2.16 in this PR.
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

### 8.4 PR 18 (task 2.16) is half-done and waiting on PR 8 (task 2.13)

- **Status:** PreToolUse `require_human_review_for` matching is implemented behind `salt-ds review --hook` (rule schema in `packages/cli/src/commands/workflow.ts` ~line 3423; help text in `packages/cli/src/lib/args.ts`; a passing cli.spec.ts case at line 6457).
- **Blocked-on:** the CI-side label gate (`salt-ds review --since <ref>` + `salt-human-reviewed` label) needs the `--since` CLI plumbing that PR 8 introduces. Until PR 8 lands, the policy can only be enforced via the agent hook, not via the PR check.
- **Cleanup also pending:** add a non-trivial `require_human_review_for` example to `workflow-examples/consumer-repo/.salt/team.json` per the original PR 18 brief (step 5).
- **Track as part of PR 8 or as a fast-follow** once PR 8 lands — do not re-open the policy-schema work, only the CI gate.

End of handoff.

























