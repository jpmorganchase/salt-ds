# Salt Workflow V1 Host Contract

Use this guide when wiring Salt into an agent host, skill, prompt, MCP client, or CLI adapter.

`salt_workflow_v1` is the public compact workflow contract. It is agent-agnostic: Copilot, Claude, Codex, and other hosts should branch on the same top-level fields before reading rich details.

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
10. `summary`

`details` in full output is additive. It must not override the top-level compact contract.

## Implementation Gate

Only write Salt UI when all of these are true:

- `status` is `success`
- `safety.exact_request_safe` is `true`
- `action.kind` is `implement`
- `evidence.status` is `complete`
- `evidence.source_urls` or source-backed evidence items point to canonical Salt docs, registry, examples, or project policy

After implementation, run the returned review/post action when present.

## Action Map

Treat `action.kind` as a command, not a suggestion.

| Action kind | Host behavior |
| --- | --- |
| `implement` | Implement only if the implementation gate is satisfied, then run review. |
| `ask_user` | Stop and ask the returned question. Do not edit around it. |
| `retrieve_entity` | Gather canonical evidence for the named entity before implementing that region. |
| `retrieve_examples` | Gather canonical examples before implementing example-dependent code. |
| `install_dependencies` | Install the listed packages before writing Salt UI. |
| `fix_context` | Resolve repo context, then rerun the workflow with the trusted context. |
| `bootstrap_repo` | Bootstrap managed Salt repo setup before repo-specific Salt edits. |
| `review` | Run the Salt review workflow before treating work as complete. |
| `tool_call` | Make the exact tool call requested by the contract. |

## Fail-Closed Rules

- `status: "partial"` is not completion.
- `status: "blocked"` is not completion.
- A generated scaffold is not proof that the Salt workflow completed.
- A successful TypeScript build is not proof that Salt evidence is complete.
- A broadened create result must not be treated as implementation-ready unless the full request is covered by source-backed evidence.
- Generic React examples, copied app code, and `node_modules` are not canonical Salt evidence.

Use `recipe.steps`, `questions`, and `evidence.missing` to explain what remains instead of guessing.

## Composite Create

For prompts such as "profile page with tabs and avatar," the first create result may identify the owner as `Tabs` while still requiring `Avatar` follow-through.

Good host behavior:

- keep the owner grounded
- follow `retrieve_entity` or another returned action for unresolved regions
- do not implement unresolved regions as generic UI
- do not call the partial result "done"

## Host Eval Requirements

A host validation pass should include at least:

- exact create that reaches `implement`
- composite create that returns a recipe or retrieval follow-up
- `ask_user` and confirms the host stops
- missing Salt packages and confirms `install_dependencies` comes before edits
- review post-action after implementation
