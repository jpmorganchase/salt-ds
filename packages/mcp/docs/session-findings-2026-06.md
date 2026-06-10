# Session Findings — 2026-06 (real consumer Copilot trace)

Status: evidence-grounded review
Source: `chat.json` — 9-turn VS Code Copilot session against `@salt-ds/mcp` in an external Vite + React `salt-app` repo
Companion to: `gold-standard-roadmap.md`

> **Revision history**
>
> - **2026-06-08 (rev 2):** post-scope-discipline pass. F11 reframed; E1–E7 reframed around VS Code agent hooks. The roadmap's §2.1.5 cuts also drop the rollback/undo, multi-tenant, vision-adapter, LSP, multi-DS-host, and public-scoreboard ideas that were tentatively scoped from this findings document — see roadmap Appendix B for the explicit list. This document keeps the trace-grounded findings; the scope decisions live in the roadmap.
> - **2026-06-08 (rev 1):** initial findings from `chat.json` trace.

This document records what actually happened in a real session, ties each observation back to either the architecture or the registry, and lists the concrete fixes the trace implies. It is the ground-truth update to the roadmap.

## Session shape

| # | User prompt | Salt tools | Total tools | Outcome |
|---|---|---:|---:|---|
| 0 | "Can you bootstrap a Salt application?" | 2 | 3 | ✅ bootstrap + team policy created |
| 1 | "Can you help me create a Dashboard with Salt" | 19 | 53 | ✅ dashboard built, build green |
| 2 | "convert this to the brand theme" | 2 | 23 | ⚠️ partial — brand props missed |
| 3 | "Does the app header follow Salt's pattern?" | 1 | 4 | ✅ review found real issues |
| 4 | "yes please do" | 6 | 29 | ⚠️ rebuilt header; reviewer flagged its own canonical pattern |
| 5 | "does the ui align with salt standards" | 1 | 5 | ⚠️ "partial" status confused the user |
| 6 | "why did you add styles to the root id" | 0 | 1 | ✅ correctly attributed to Vite scaffold |
| 7 | "btw you were wrong the metrics are incorrect" | 2 | 13 | 🔴 user correction; registry lacked canonical metric structure |
| 8 | "you didn't apply the props to enable the brand theme" | 1 | 13 | 🔴 user correction; registry lacked brand prop values |

Two of nine turns ended in user corrections of substantive defects. Both corrections trace back to the same root cause.

---

## Root cause #1 — Registry coverage gaps push the model out of bounds

The skill explicitly says:

> Do not inspect `node_modules`, copied app code, or generic web examples to choose Salt-specific components, patterns, tokens, props, or layout structures.

The session shows the model violating this rule in turns 2, 4, 7, and 8 — not because the model disregarded the skill, but because the registry left it no alternative. Specifically:

| Entity / fact | Registry status | What the model did | Result |
|---|---|---|---|
| `SaltProviderNext` | Not returned by `get_salt_entity` | Grepped `node_modules`, read `theme-next.css`, located the export | Found it, but per skill rule should not have been forced to |
| JPM Brand prop defaults (`accent`, `corner`, `headingFont`, `actionFont`) | Not in registry; docs say "default brand props" without naming them | Hunted `node_modules` source again | Initially omitted them entirely (turn 2), only fixed after user complained (turn 8) |
| Canonical Metric pattern structure (`Display2` with the trend arrow as a child, `gap: 0`) | `get_salt_examples` for Metric did not return the canonical pattern with sufficient structure | Used `find` + `cat` on `packages/core/stories/patterns/metric/metric.stories.tsx` | Initially wrong (turn 1), only fixed after user complained (turn 7) |
| Canonical App header pattern composition | `get_salt_examples` returned partial guidance | `cat` on `packages/core/stories/patterns/app-header/app-header.stories.tsx` | Eventually reproduced, but at the cost of 6 Salt + 23 supporting calls in turn 4 |

**Both user-visible defects in this 9-turn session come from this category.** The Theme Evidence Rule and No Invention Rule are working as designed; the registry is the bottleneck.

### What the skill says vs. what the registry forces

```
Skill rule:        "Do not inspect node_modules."
Registry reality:  No SaltProviderNext entity, no brand prop defaults,
                   no fully-composed metric/app-header example.
Model's choice:    Read node_modules anyway (violates skill but is the
                   only way to ground without hallucinating).
```

This is the most important single finding in the trace. Either the skill rule has to weaken to permit source-of-truth inspection when the registry is silent, or the registry has to cover the entities the model actually needs to reach `evidence.status: complete`.

The right answer is the latter. The roadmap needs an explicit Registry Coverage workstream.

---

## Root cause #2 — `status: partial` overloads two unrelated states

The contract uses `partial` for both:

1. "The user request is partly addressed; more follow-through is needed." (legitimate partial)
2. "The workflow itself could not validate part of its own output because the registry has internal gaps (`unsupported_claim_count > 0`)." (internal limitation)

Turn 5 is type 2: the user asked "does the UI align with Salt standards"; the result was `status: partial`, `safety.blocking_reasons: []`, `questions: []`, `summary: "Salt review found no issues blocking the reviewed scope."` The model had to translate that into "Yes — but my own validator has gaps." It did so correctly, but the contract handed it the wrong shape to work with.

**Implication:** `partial` should mean only type 1. Type 2 needs its own field, e.g. `internal_limitations: { unsupported_claim_count, unsupported_rule_kinds[] }` that is separate from workflow status. A clean run with internal limitations should be `status: success, internal_limitations: { … }`.

---

## Root cause #3 — Review heuristic disagrees with the canonical reference

Turn 4 trace:

```
Salt review on rebuilt DashboardHeader returned a finding:
  "Tooltip + Button is a nested interactive components composition"

Canonical reference packages/core/stories/patterns/app-header/app-header.stories.tsx:
  Uses Tooltip + Button verbatim.
```

The model noted explicitly:

> The review flags a pattern that the canonical App header story itself uses verbatim. This appears to be a heuristic conflict between the Tooltip composition rule and the App header pattern's own canonical example. Let me confirm the build and report.

A more agreeable agent would have churned indefinitely chasing a contradiction. This is a class of bug — review heuristics that aren't validated against their own canonical references. Easy to detect with a CI invariant: run `review_salt_ui` over every canonical story per pattern and assert zero findings on the canonical example.

---

## Root cause #4 — `install_dependencies` rerun is a manual step

Turn 1:

1. `create_salt_ui` returns `partial` because `@salt-ds/*` packages aren't declared.
2. `action.kind: install_dependencies`, packages listed.
3. Model runs `npm install` (correct).
4. Model calls `create_salt_ui` again — but it still returns "packages not declared" because the cached project context was not invalidated.
5. Model calls `get_salt_project_context` again to refresh.
6. Model calls `create_salt_ui` a third time; finally `success`.

The contract should treat `install_dependencies` completion as a context-invalidation event so the rerun is one step, not three. This is a clean transport-layer fix.

---

## Root cause #5 — One-by-one entity lookups are expensive

Turn 1 made 19 separate Salt MCP calls including 7 individual `get_salt_entity` lookups and 3 `get_salt_examples`. No batch endpoint exists, so the model issues a request per entity even when it knows all six entity names up front.

Combined with the registry payload load on every MCP boot, this is the dominant cost source for create workflows.

---

## Root cause #6 — `create_salt_ui` didn't ask about theme

When the user said "Create a Dashboard" in turn 1, the workflow returned canonical Salt guidance with the **base** `SaltProvider` and `@salt-ds/theme/index.css`. The user's actual intent was the JPM Brand theme — revealed in turn 2 by "convert this to the brand theme" and made explicit only by turn 8's correction.

`action.kind: ask_user` exists exactly for this. The first turn could have asked:

> "Salt has two providers: stable `SaltProvider` (base theme) and `SaltProviderNext` (JPM Brand theme with `accent`, `corner`, font props). Which do you want?"

It didn't. The first `ask_user` only appears in turn 7, after the model had already shipped the wrong default. The contract is honest, but the workflow's question-asking heuristics aren't pulling theme decisions out of broad create prompts.

---

## Root cause #7 — Tool discovery friction

Turn 0 thinking: *"I need to access the `create_salt_ui` MCP tool through tool_search to handle this creation workflow."*

The MCP tool was registered and described. Copilot still needed `tool_search` to find it. The descriptions in `toolDefinitions.ts` may not carry enough lexical signal for tool-selection heuristics on every host. Worth auditing description text against host-side tool-selection ranking.

---

## Root cause #8 — Assistant text dropped inline file references

The assistant's chat output contained markdown that rendered as bare hyphens and empty placeholders in the trace, e.g.:

```
Bootstrap complete. Created:
-  — default Salt team policy
-  — repo instructions
```

The model emitted inline references that the chat UI didn't render. The replies still read fine semantically but the consumer sees blanks where filenames should be. A formatting safety net (always emit the file path as plain text alongside the inline reference) would prevent this.

---

## Root cause #9 — Skill promises custom-agent delegation the host can't honor

Trace turn 1 thinking:

> "I should delegate this to the Salt UI agent since that's the right tool for broad Salt UI tasks like this. Let me check the salt-ds skill to understand the proper workflow first."
> "I'm considering whether to delegate this to the Salt UI subagent or handle it directly, but since the user is asking for help creating a dashboard, I should probably clarify…"

The model never actually delegated. It can't. VS Code Copilot custom agents (`.github/agents/*.agent.md`) are **user-invoked**, not main-agent-delegable — the user has to type `@SaltUI` or pick the agent from the chat-input dropdown to start a session against the custom agent's instructions. The default agent can suggest the switch but it cannot perform it.

Meanwhile:

- The skill says: "Prefer the repo Salt UI agent in `.github/agents/salt-ui.agent.md` for those broad Salt UI tasks when your host supports custom agents."
- `bootstrap_salt_repo` writes the agent file silently and the post-bootstrap text reads "VS Code Salt UI custom agent" with no instruction on how to invoke it.
- The consumer-repo `AGENTS.md` and `copilot-instructions.md` both reference "the Salt UI agent" as if it's a tool the model can invoke.

The result is exactly what the trace shows: the model thinks out loud about delegating, decides not to, processes the prompt inline, and the consumer never finds out the custom agent exists. From the user's perspective the model promised the right routing and silently didn't deliver.

### The bigger question: should `@SaltUI` exist at all?

On reflection, no — at least not in its current form. The evidence:

1. **It is a third copy of the same policy.** SKILL.md, `AGENTS.md`, `.github/copilot-instructions.md`, and `salt-ui.agent.md` repeat substantially the same rules. Four `<!-- salt-ds:…:start -->` blocks, four drift surfaces.
2. **The default agent already exhibits @SaltUI behavior** in the trace. Turn 1 with no custom-agent invocation: reached for `create_salt_ui`, followed the action loop, installed deps, refreshed context, satisfied the hard gate, ran post-action review. The custom agent would have changed nothing.
3. **Neither user correction in the trace would have been prevented** by routing through @SaltUI. Both came from registry coverage gaps (F1+F2), not from missing the custom agent.
4. **The Salt MCP enforces safety server-side.** The hard gate lives in `publicContract.ts`. Prose in an agent file can't enforce anything the workflow contract doesn't already enforce.
5. **It locks Salt to one host's format.** VS Code wants `.agent.md` with specific frontmatter, Cursor wants `.cursor/rules`, Windsurf wants `.windsurfrules`, Claude Code wants `CLAUDE.md` plus its subagent format, Codex defers to `AGENTS.md`. Shipping a custom agent per host = N drift surfaces, N CI matrices.
6. **It muddles "one public surface."** The Salt story is "one public skill: `salt-ds`." A host-specific custom agent in the same repo introduces a second specialist source of truth that competes with the skill.

**Three reasonable paths, in priority order:**

- **A (preferred).** Stop writing `salt-ui.agent.md` in `bootstrap_salt_repo`. The skill + `AGENTS.md` + `copilot-instructions.md` already cover the job. Remove the "delegate to the Salt UI agent" language from the skill. The trace shows nothing is lost.
- **B (compromise).** Keep `salt-ui.agent.md` but reduce it to a five-line discovery shim: name, one-sentence description, "follows this repo's `AGENTS.md`." No duplicated policy. Single source of truth stays `AGENTS.md`. The file exists only to make `@SaltUI` discoverable in the host's agent picker, signaling to users that Salt is configured.
- **C (deferred).** Make the file conditional on host capability negotiation. `bootstrap_salt_repo` only writes `salt-ui.agent.md` when (a) the host advertises support for custom agents and (b) the user opted into IDE adapters at bootstrap. Same gate would apply to `.cursor/rules`, `.windsurfrules`, etc. as those formats appear.

**Decision (2026-06):** Option C landed, not the originally-preferred Option A. `salt-ds init` no longer writes `salt-ui.agent.md` by default (`scripts/consumer-smoke/checks.mjs:248` and `packages/cli/src/__tests__/cli.spec.ts:1029` assert the default no-write). The conditional opt-in path is retained for hosts that explicitly request IDE adapters, and the SKILL.md "delegate to the Salt UI agent" prose has been removed. This closes the consumer-visible regression in this trace and aligns with roadmap §5.8 (cross-IDE custom-agent format normalization), which builds on the conditional substrate rather than re-introducing it. **Treat F11 as closed.** Future cross-IDE adapter work belongs in §5.8, not in re-litigating the A-vs-C choice.

**Implication for the roadmap:** F11 as originally stated ("make custom-agent invocation honest") is too small. The honest fix is to question the artifact itself.

---

## Root cause #10 — Post-action review is agent-trusted, not enforced

The workflow contract for `action.kind: implement` carries a `post_action: review_salt_ui`. The skill, `AGENTS.md`, and `copilot-instructions.md` all say to run it after editing. Trace evidence:

| Turn | Edits made | `review_salt_ui` after? | What the model declared "done" by |
|---|---|---|---|
| 1 | new dashboard + 5 component files | ✅ ran | review pass + `npm run build` |
| 2 | theme provider swap | ❌ skipped | `npm run build` only |
| 4 | header rebuild | ✅ ran (twice) | review pass + build |
| 5 | none (verification turn) | ✅ ran | review explicit ask |
| 7 | Metric structure rewrite | ❌ skipped | `npm run build` only |
| 8 | brand props applied | ❌ skipped | `npm run build` only |

Three of five editing turns shipped code without the post-action review the contract requested. The model substituted `npm run build` — which validates TypeScript, not Salt conformance. A consumer who commits after turn 8 has *zero* Salt validation against the final state of the code.

The entire anti-hallucination story relies on a step the agent silently skipped half the time. **The hard gate is enforced *inside* the workflow, but there is no enforcement layer between "agent claims to have implemented" and "code reaches `main`."** Today, `ui:verify` (`salt-ds review .`) is the only artifact `bootstrap_salt_repo` writes, and it's opt-in and human-run.

This is the most consequential consumer-confidence gap in the entire review. It's worse than the registry coverage issue because it's *invisible* — the user doesn't know review was skipped unless they read the trace.

### Enforcement layers Salt should ship (ranked by value-per-effort)

VS Code (and Claude Code, and Copilot CLI) now expose **agent lifecycle hooks** — shell commands wired to `SessionStart`, `PreToolUse`, `PostToolUse`, `Stop`, etc. via `.github/hooks/*.json`. Exit code 2 on a hook puts the error stderr into the model's context, so the agent self-corrects in the same turn. This is **qualitatively better** than pre-commit / CI / editor enforcement for the agent-skipped-review problem, because the agent never gets to "move on" without seeing the failure.

See: https://code.visualstudio.com/docs/agent-customization/hooks

The right shape:

| # | Layer | Mechanism | Bypassable by | Cost |
|---|---|---|---|---|
| E1 | **`--hook` flag on `salt-ds review`** triggered by `PostToolUse` (VS Code / Claude Code / Copilot CLI shared format). Reads hook JSON from stdin, runs review on the edited files, exits 2 on findings so stderr surfaces to the model in-loop. Installed by `bootstrap_salt_repo --add-agent-hooks` writing `.github/hooks/salt.json` calling `npx salt-ds review --hook`. **Rev 2: replaces the originally-proposed `salt-ds hook` subcommand — overreach per roadmap §2.1.5. A flag on the existing command does the same job without expanding the public surface.** | Per-edit, in-loop | Disabling hooks via setting | S |
| E2 | **CI required check.** `salt-ds review --since <ref>` via GitHub Actions / GitLab CI. Last line for non-VS-Code hosts and hook bypasses. Installed by `bootstrap_salt_repo --add-ci-checks`. | Per-PR | Repo admin removing the required check | S |
| E3 | ~~Editor save hook~~ — **dropped.** `PostToolUse` covers agent edits; VS Code's built-in save-task system covers human edits. The original idea is redundant. | — | — | — |
| E4 | **Agent attestations** *also through the `--hook` flag*. The same `salt-ds review --hook` invocation on `PostToolUse` **writes** `.salt/attestations/<hash>.json` recording registry hash, evidence refs, files touched, hashes after edit, `post_action_ran`. A `Stop` hook calls `salt-ds review --hook --verify-attestations` to confirm hashes match before the session ends. Also exposed standalone in CI via `salt-ds review --verify-attestations` (no `--hook` needed there). Write side of Phase 4.1 replay. | Per-tool + per-session | Deleting attestations (detected in CI) | L |
| E5 | **Policy escalation** *also through `--hook`*. When `salt-ds review --hook` detects a `PreToolUse` payload (via `hookEventName` in stdin), it reads `.salt/team.json` `require_human_review_for: [{kind, reason?}]` and emits `{hookSpecificOutput: {permissionDecision: "ask"}}` for matching edits *before* they happen. CI (E2) treats matching PRs as blocking unless `salt-human-reviewed` label is present. | Per-tool | Removing the rule | M |
| E6 | **`--hook` flag on `salt-ds info`** for `SessionStart`. Returns `{hookSpecificOutput: {additionalContext: "…"}}` summarizing the repo's Salt setup (registry version, declared policy, available patterns) as a one-shot injection — replaces a chunk of always-loaded `AGENTS.md` / skill prose with per-session context. Directly responsive to M5 (skill payload too heavy). | Per-session | — | S |
| E7 | **Shared internal helper** `packages/cli/src/lib/hookIO.ts`. Internal-only stdin parser / output formatter / exit-code mapper used by both `review --hook` and `info --hook`. Not exported, not a public surface — just deduplication. | — | — | S |

**Net public surface added: two flags (`--hook` on `review` and `info`) and one bootstrap option. No new subcommand.**

E4 is the only layer that catches "agent claimed to review but didn't" — the others enforce that *something* reviews the change, not that the agent's own claim is honest. E4 is also the write side of the Phase 4.1 replay capability already on the roadmap, so the engineering scope partly overlaps.

### Major secondary win

Once these hooks exist, the always-loaded skill / `AGENTS.md` / `copilot-instructions.md` prose can shrink dramatically. Rules like *"after editing, run `salt-ds review`"* stop being agent prompts that the model may or may not follow, and become hook contracts that the host enforces regardless. That directly addresses M5 (skill payload too heavy) and reframes root cause #10 — the agent-skipped-review problem isn't a prompting failure to fix in prose, it's a missing enforcement layer to fix in hooks.

### How this changes the `@SaltUI` conversation

VS Code's agent format supports `hooks:` directly in the custom agent frontmatter, scoped to that agent's sessions only. So if `salt-ui.agent.md` stays at all (Option B from root cause #9), its *real* differentiator is shipping a **stricter** hook profile than the default agent — e.g. blocking the `Stop` event until the entire change set is review-clean. That's a genuinely different artifact, not duplicated policy prose, and makes the custom agent file worth keeping in a way the original draft was not.

### Combined minimum recommendation

Ship E1 + E2 + E6 in the same PR as Phase 0 / early Phase 2. They each reuse the small `hookIO.ts` helper and share two `--hook` flags on existing commands. Together they turn "we hope the agent reviews" into "the agent literally cannot ship code without review running, and the host has been told from the first turn that Salt is configured here." E4 follows when replay (Phase 4.1) lands. E5 is enterprise polish.

---

## What the trace says is working

1. **Hard gate held.** The model refused to edit until `status: success`, then ran the post-action review. The contract's anti-hallucination story works.
2. **Skill orientation worked.** Every first-line thought reached for Salt MCP tools before generic React.
3. **Review caught real defects** in turn 3 (`review-canonical-mismatch`, `review-composition-misuse` for the App header) and the model responded with a substantive rebuild in turn 4.
4. **Bootstrap is one-shot.** `bootstrap_salt_repo` produced team policy, repo instructions, Copilot block, and the Salt UI custom agent in one call. Strong first-run UX.
5. **Project context recovers gracefully** from stale state — the model called `get_salt_project_context` again after `npm install` and the contract worked.

---

## Concrete fixes the trace implies

These are session-grounded, not speculative.

| # | Fix | Phase in roadmap | Severity |
|---|---|---|---|
| F1 | Add `SaltProviderNext` and the brand prop defaults to the registry as first-class entities with examples. | Phase 0 (registry coverage workstream) | Critical |
| F2 | Audit pattern stories so `get_salt_examples` returns the canonical composed example for each pattern (Metric, App header, Analytical dashboard, Header block, Card module). Add a CI assertion that every pattern surfaces ≥1 example that round-trips through `validateStarterCodeSnippets`. | Phase 0 | Critical |
| F3 | Split `status: partial` into `partial` (user-facing remaining work) and a new `internal_limitations` block (registry/validator gaps). Update `publicContract.ts`, capability manifest contract version note, and the skill prose. | Phase 2 | Major |
| F4 | Add a CI test that runs `review_salt_ui` over each pattern's canonical story file and asserts zero findings. Fail the build if a heuristic flags its own canonical reference. | Phase 0 | Major |
| F5 | Make `install_dependencies` completion auto-invalidate project context so the rerun is one step, not three. Implement inside the runtime layer (Phase 3 `@salt-ds/workflow-runtime`). | Phase 1/3 | Major |
| F6 | Add a batch entity lookup: `get_salt_entities({ names: string[], include?: Section[] })` returning a map. Update the skill to prefer the batch form when ≥2 entities are needed. | Phase 1 | Major |
| F7 | Teach `create_salt_ui` to ask about theme choice when the prompt is theme-ambiguous and the repo doesn't already have a declared theme provider. Emit `action.kind: ask_user` with the choice surfaced. | Phase 2 | Major |
| F8 | Audit MCP tool descriptions in `toolDefinitions.ts` for lexical strength on host-side tool selection. Add a tool-selection benchmark that asks "given prompt X, did the host call the right Salt tool first?" to `agenticEvals.spec.ts`. | Phase 0 | Major |
| F9 | Always emit fallback plain-text file paths alongside inline references in assistant-bound responses so unrendered UIs don't show blanks. | Phase 2 | Minor |
| F10 | Add an opt-out for the skill's "do not inspect node_modules" rule when registry returns `evidence.status: incomplete` for the requested entity, OR — preferred — close the gap so this clause never fires. F1+F2 make this moot. | Phase 0 | Major |
| F11 | **Drop `salt-ui.agent.md` from `bootstrap_salt_repo` by default** (Option A) or reduce it to a 5-line discovery shim that defers all policy to `AGENTS.md` (Option B). Remove "delegate to the Salt UI agent" language from the skill and consumer-repo templates. Default agent in the trace already exhibits the right behavior without the custom agent. If kept, its real differentiator is shipping a stricter `hooks:` profile (per E1+E4) than the default agent. | Phase 0 | Major |
| E1 | **`--hook` flag on `salt-ds review`** triggered by `PostToolUse` (shared VS Code / Claude Code / Copilot CLI format). Exits 2 with stderr to surface findings to the model in-loop. Installed by `bootstrap_salt_repo --add-agent-hooks`. **Rev 2:** replaces the originally-proposed `salt-ds hook` subcommand — overreach per roadmap §2.1.5. | Phase 2 | Critical |
| E2 | **CI required check.** `salt-ds review --since <ref>` via GitHub Actions / GitLab CI. Last line for non-VS-Code hosts and hook bypasses. Installed by `bootstrap_salt_repo --add-ci-checks` writing `.github/workflows/salt-review.yml`. | Phase 2 | Critical |
| E3 | ~~Editor save hook~~ — **dropped.** `PostToolUse` covers agent edits; VS Code's built-in save-task system covers human edits. | — | — |
| E4 | **Agent provenance attestations** also through `--hook`. `PostToolUse` (`salt-ds review --hook`) writes `.salt/attestations/<hash>.json`; `Stop` hook calls `salt-ds review --hook --verify-attestations`. Standalone `salt-ds review --verify-attestations` in CI. Closes "agent claimed to review but didn't." Write side of replay (Phase 4.1). | Phase 2 → Phase 4 | Major |
| E5 | **Policy-driven escalation** also through `--hook`. `salt-ds review --hook` detects `PreToolUse` payloads and emits `permissionDecision: "ask"` for changes matching `.salt/team.json` `require_human_review_for`. CI (E2) blocks matching PRs unless `salt-human-reviewed` label is present. | Phase 2 | Major |
| E6 | **`--hook` flag on `salt-ds info`** for `SessionStart`. Returns `additionalContext` summarizing repo Salt setup as a one-shot injection — replaces a chunk of always-loaded skill/`AGENTS.md` prose with per-session context. Reduces context tax per turn (responsive to M5). | Phase 2 | Major |
| E7 | **Shared `packages/cli/src/lib/hookIO.ts` internal helper** used by `review --hook` and `info --hook`. Not exported, not a public surface — just deduplication. | Phase 2 | Critical |
---

## Headline metrics from the trace

| Metric | Value | Reading |
|---|---|---|
| Tool calls per turn (median) | 24 | High; F6 alone could drop this ~30% |
| Tool calls in the largest create turn | 53 | One create = a small repo of activity |
| Salt MCP calls per turn (median) | 2 | Underweight relative to support tools |
| User-correcting turns | 2 of 9 (22%) | Both traceable to F1 |
| `partial` results misread as failure-adjacent | 1 of 9 (turn 5) | F3 fixes |
| Heuristic self-contradictions | 1 of 9 (turn 4) | F4 fixes |
| Late `ask_user` escalations | 1 of 9 (turn 7) | F7 helps |
| Skill-rule violations forced by registry gaps | 4 of 9 (turns 2, 4, 7, 8) | F1+F2 fix |
| Custom-agent delegation promised but not delivered | 1 of 9 (turn 1) | F11 fixes |
| Editing turns that shipped without the post-action review | 3 of 5 editing turns (60%) | E1+E2 close the gap; E4 makes the agent's claim verifiable |

**Pareto insight:** F1 + F2 + F4 + F5 together would have eliminated both user corrections, the self-contradicting review, and the stale-context loop. That is the highest-leverage four-item set in the entire roadmap based on this trace.

---

## Roadmap delta

The trace doesn't change the structure of the roadmap but it changes priority. Phase 0 gains a Registry Coverage workstream that runs in parallel with the install-footprint and tool-surface fixes already planned.

### New Phase 0 task list (additive)

| Task | Refs | Outcome |
|---|---|---|
| 0.6 Registry coverage audit: walk every public Salt component, pattern, and provider; assert each appears in `components.json`/`patterns.json` with at least one canonical example and a populated `composition_contract`. Fail CI on gaps. | F1, F2, F10 | Closes the most-cited root cause. |
| 0.7 Add `SaltProviderNext` as a registry entity with full prop schema and brand-defaults documentation. | F1 | Stops the brand-theme regression. |
| 0.8 Canonical-example round-trip test: every pattern story file passes `review_salt_ui` with zero findings. | F4 | No more self-contradicting reviews. |
| 0.9 Auto-invalidate project context on `install_dependencies` completion. | F5 | Three-step loop becomes one. |
| 0.10 Tool-selection benchmark in `agenticEvals.spec.ts` for "is the right Salt tool picked first?" across 20 prompts. | F8 | Catches description regressions before consumers do. |

### Phase 2 amendments

- 2.9 Split `status: partial` into `partial` + `internal_limitations`. Add to `salt_workflow_v1` contract changelog. (F3)
- 2.10 Teach `create_salt_ui` to ask about theme on theme-ambiguous prompts. (F7)
- 2.11 Plain-text file-path fallback in assistant responses. (F9)

### Phase 1 amendments

- 1.8 Add `get_salt_entities` batch lookup. (F6)
- Skill update to prefer it whenever ≥2 entities are needed.

---

## Closing

The architecture passed the real-world test. The MCP+CLI+skill model held together for 9 turns of nontrivial, multi-step UI work and the contract's anti-hallucination gate prevented the model from inventing APIs even when the registry let it down.

The two user-visible defects in the session came from the registry being thin in exactly the places the user touched first: a non-default theme and the most prominent pattern on the dashboard. Closing those gaps is straightforward, finite work — much smaller in scope than the architectural roadmap — and would have moved the session from "two corrections" to "zero corrections" without any contract change.

Equally important and not visible from the source alone: **the post-action review was skipped in 3 of 5 editing turns.** Today the only thing standing between an agent-skipped review and `main` is the consumer noticing. Pre-commit + CI enforcement (E1+E2) closes that gap with one PR's worth of work and converts the entire anti-hallucination story from agent-trusted to actually-enforced.

In other words: the next ten points of consumer confidence come from registry coverage and review enforcement, not from more cleverness in the runtime.


















