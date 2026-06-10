# Salt Workflow V1 Host Contract

Use this guide when wiring Salt into an agent host, skill, prompt, MCP client, or CLI adapter.

`salt_workflow_v1` is the public compact workflow contract. It is agent-agnostic: every host should branch on the same top-level fields before reading rich details.

| Layer                       | Current value                                              |
| --------------------------- | ---------------------------------------------------------- |
| Contract token              | `salt_workflow_v1`                                         |
| SemVer (within v1 major)    | `1.1.0` — exposed via `capability_manifest.contracts.contract_lifecycle.semver` |

## Read Order

Read these fields first:

1. `status`
2. `safety.exact_request_safe`
3. `safety.blocking_reasons`
4. `action`
5. `next_required_action`
6. `allowed_next_actions`
7. `recipe.steps`
8. `questions`
9. `evidence`
10. `internal_limitations`
11. `summary`

`details` in full output is additive. It must not override the top-level compact contract.

## Implementation Gate

Only write Salt UI when all of these are true:

- `status` is `success`
- `safety.exact_request_safe` is `true`
- `action.kind` is `implement`
- `evidence.status` is `complete`
- `evidence.source_urls` or source-backed evidence items point to canonical Salt docs, registry, examples, or project policy

`internal_limitations` does **not** participate in the implementation gate. A clean run with `internal_limitations.unsupported_claim_count > 0` is still implementation-safe — surface the limitation to the user, but do not block on it.

After implementation, run the returned review/post action when present.

## Action Map

Treat `action.kind` as a command, not a suggestion.

| Action kind            | Host behavior                                                                   |
| ---------------------- | ------------------------------------------------------------------------------- |
| `implement`            | Implement only if the implementation gate is satisfied, then run review.        |
| `ask_user`             | Stop and ask the returned question. Do not edit or rerun unchanged; treat the answer as updated workflow input. |
| `retrieve_entity`      | Gather canonical evidence for the named entity, then rerun with the returned evidence bridge before implementing that region. |
| `retrieve_examples`    | Gather canonical examples, then rerun with the returned evidence bridge before implementing example-dependent code. |
| `install_dependencies` | Install the listed packages, then rerun the originating workflow before writing Salt UI. |
| `fix_context`          | Resolve repo context, then rerun the workflow with the trusted context.         |
| `bootstrap_repo`       | Bootstrap managed Salt repo setup before repo-specific Salt edits.              |
| `review`               | Run the Salt review workflow before treating work as complete.                  |
| `rerun_workflow`       | Rerun the originating workflow with the returned evidence bridge.               |
| `tool_call`            | Make the exact tool call requested by the contract.                             |

## Status Vocabulary

| Status     | Meaning                                                                            |
| ---------- | ---------------------------------------------------------------------------------- |
| `success`  | Implementation-ready against the implementation gate.                              |
| `partial`  | The user's request is partly addressed; user-facing follow-through is required (unresolved regions, follow-through entities, composite plans that still need grounding). |
| `blocked`  | A blocking precondition (questions, context, install, bootstrap, semantic mismatch) prevents continuing. |
| `failed`   | The workflow could not produce usable guidance.                                    |

`status: partial` is **not** the right signal for "Salt's own validator could not cover part of its output." That state is the new `internal_limitations` block — see below.

## Internal Limitations (semver 1.1.0)

Top-level block:

```jsonc
{
  "internal_limitations": {
    "unsupported_claim_count": 3,
    "unsupported_rule_kinds": ["component-prop", "pattern-guidance"]
  }
}
```

- Always present on every workflow result. Default = `{ unsupported_claim_count: 0, unsupported_rule_kinds: [] }`. Hosts can branch on the fields directly without runtime nullish checks.
- Records validator/registry coverage gaps — claims the workflow produced but the registry could not confirm because the corresponding entity, prop, or pattern is not yet captured.
- Independent of `status`. A clean run with internal limitations is `status: "success"` plus a populated block. A `partial` run can carry an empty block, a populated block, or both — the two signals never overlap.

Recommended host UX: when `unsupported_claim_count > 0`, surface the limitation transparently to the user ("Salt could not validate N internal claims") but continue with `status`-driven behavior. Do not retry, do not block implementation, and do not display the run as a failure.

## Fail-Closed Rules

- `status: "partial"` is not completion.
- `status: "blocked"` is not completion.
- A generated scaffold is not proof that the Salt workflow completed.
- A successful TypeScript build is not proof that Salt evidence is complete.
- A broadened create result must not be treated as implementation-ready unless the full request is covered by source-backed evidence.
- Generic React examples, copied app code, and `node_modules` are not canonical Salt evidence.
- A populated `internal_limitations` block by itself is not a fail-closed signal — only `status`, `safety`, `evidence`, and `action` participate in fail-closed gating.

Use `recipe.steps`, `questions`, and `evidence.missing` to explain what remains instead of guessing.

## Composite Create

For prompts such as "profile page with tabs and avatar," the first create result may identify the owner as `Tabs` while still requiring `Avatar` follow-through.

Good host behavior:

- keep the owner grounded
- follow `retrieve_entity` or another returned action for unresolved regions
- when create entity follow-through is resolved, rerun with MCP `resolved_entities: ["Avatar"]` or CLI `--resolved-entity Avatar`
- after package installation, rerun the same workflow and wait for `status: success`, `action.kind: implement`, and `evidence.status: complete`
- do not implement unresolved regions as generic UI
- do not call the partial result "done"

## Host Eval Requirements

A host validation pass should include at least:

- exact create that reaches `implement`
- composite create that returns a recipe or retrieval follow-up
- `ask_user` and confirms the host stops
- missing Salt packages and confirms `install_dependencies` is followed by a successful rerun before edits
- review post-action after implementation
- a review run that produces `status: success` with `internal_limitations.unsupported_claim_count > 0` and confirms the host does not treat it as `partial` or as failure

## Migration Note — semver 1.1.0

Earlier `salt_workflow_v1` payloads conflated two distinct states under `status: "partial"`:

1. User-facing remaining work (still represented as `partial`).
2. Validator/registry coverage gaps (`unsupported_claim_count > 0`) — previously also surfaced as `partial`; now surfaced as a separate top-level `internal_limitations` block while `status` stays `success`.

If your host previously branched on `status == "partial"` as "wait, do not implement," update the branch:

- Continue to treat `status: "partial"` as user-facing remaining work.
- Read `internal_limitations.unsupported_claim_count` as an informational signal. Surface it to the user; do not change the implementation gate.
- The `internal_limitations` field is mandatory on every payload going forward — hosts can branch on the inner fields without runtime nullish checks.

`capability_manifest.contracts.contract_lifecycle.semver` reads `"1.1.0"` on every server emitting this change. Lower semvers on older servers signal the pre-split shape.
