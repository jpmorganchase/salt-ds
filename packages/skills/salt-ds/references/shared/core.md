# Salt DS — Always-Loaded Core

Load this file once at the start of any Salt workflow turn, before workflow-specific references. It carries the always-on behavior bullets every Salt workflow shares: no-invention, hard gate, action loop, project context, output posture, stable-first. SKILL.md is a thin router; the binding behavior contract lives here.

## No Salt Invention Rule

Do not guess or hallucinate Salt APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, or documentation links.
Before naming or implementing Salt-specific structure, fetch canonical Salt evidence through MCP or CLI.
If evidence is missing, follow `next_required_action`, retrieve the required entity or examples, ask the user, or stop with the blocker.
Do not fill gaps from generic React, CSS, HTML, copied repo code, or model memory.

## Theme Evidence Rule

Do not name Salt provider or theme imports, provider props, fonts, accent/corner values, package paths, or compatibility paths from this skill.
When provider or theme bootstrap matters, obtain those facts from workflow output, registry-backed generated context with evidence refs, `.salt` project policy, or explicit user input.
If that evidence is missing, report theme bootstrap as pending or unsupported and continue only with workflow steps that do not require the missing theme facts.

## Hard Gate

Do not edit Salt UI for `create`, `migrate`, or `upgrade` implementation work unless the current workflow contract has all of these fields:

- `status: success`
- `action.kind: implement`
- `safety.exact_request_safe: true`
- `evidence.status: complete`

After editing, run the returned review or post action before calling the work complete.
Treat quick-check observations, starter snippets, package installs, retrieval results, successful builds, and partial scaffolds as non-implementation approval.

## Action Loop

For implementation-capable Salt workflows:

1. For repo-aware work, establish trusted project context first, or pass a known `root_dir` or `context_id` to the workflow.
2. Call the workflow.
3. Read `status`, `action.kind`, `next_required_action`, `safety`, `questions`, and `evidence`.
4. Perform exactly the returned action.
5. If `action.kind` is `ask_user`, stop and wait for the user answer; treat the answer as a new or updated workflow input, not as an evidence bridge.
6. After `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, or `bootstrap_repo`, rerun the originating workflow with the returned evidence bridge. For create entity follow-through, pass MCP `resolved_entities: ["Name"]` or CLI `--resolved-entity Name`.
7. Edit only when the rerun satisfies the Hard Gate.
8. Run review after edits.

Installing Salt packages is not implementation permission. After installing, immediately rerun the originating workflow and edit only if that rerun returns `status: success`, `action.kind: implement`, and `evidence.status: complete`.

## Project Context First

For deep or repo-spanning Salt work, start from project context before choosing Salt-specific structure.
In `quick-check`, you may start from the current file, selection, or diff when the answer is clearly bounded, then add project context when feasibility or safety requires it.

When repo-aware guidance needs project context:

- prefer Salt MCP project context when available
- if the host already knows the active workspace path, pass it as `root_dir` on `get_salt_project_context` or the repo-aware workflow call instead of relying on cwd inference
- use `salt-ds info --json` as the CLI equivalent when MCP is blocked or unavailable
- treat repo context as the first pass for framework, package, import, runtime-target, and policy detection
- if project-context resolution returns `needs_explicit_root`, `mismatch`, or resolves a root without the expected manifest, stop and retry with explicit `root_dir` or a known `context_id`
- skip project context only for clearly Salt-agnostic exploration where repo shape does not affect the answer

## Shared Workflow Contract

For every Salt workflow:

1. Obtain canonical Salt guidance through MCP or CLI before making Salt-specific choices.
2. Keep the user task and page-level framing intact in the first canonical step.
3. Treat repo conventions and project memory as downstream context, not canonical Salt guidance.
4. Read compact workflow output from stable top-level workflow signals first: `status`, `safety`, `action`, `next_required_action`, `allowed_next_actions`, `recipe`, `questions`, `evidence`, and `summary`.
5. Treat `salt_workflow_v1.action.kind` as binding: perform exactly the returned action, and only edit when the Hard Gate is satisfied.
6. Validate with the returned review or post action before treating implementation work as done.

Preserve explicit user nouns that are not yet covered as unresolved requirements.
Retrieve canonical evidence for those nouns, but do not implement those regions until the workflow contract or support evidence covers them.
Use `recipe.steps`, `questions`, and `evidence.missing` to explain what remains unresolved instead of filling gaps with guessed Salt structure.

### Stable-First Rule

Prefer stable production-ready Salt directions first.
Do not reach for custom UI, lab/experimental usage, or decorative styling until the nearest canonical Salt pattern, primitive, composition, and foundation have been ruled out.
If the transport or validation warns that a recommendation is unstable, noisy, or needs attention, do not finalize it as the main answer without saying so.

## Output Posture

Keep results decision-first.
When blocked, say exactly what is blocked, what succeeded, and what remains unresolved.
Summarize blocked, partial, `ask_user`, retrieve, or missing-evidence states from existing fields only; do not invent a new compact field.
Treat `status: "partial"` as **user-facing remaining work** only — unresolved regions, follow-through entities, composite plans that still need grounding. It does not mean the workflow's own validator coverage is incomplete.
Read the top-level `internal_limitations` block (`unsupported_claim_count`, `unsupported_rule_kinds`) as a separate signal: registry/validator coverage gaps that the workflow itself could not confirm. A clean run with `internal_limitations.unsupported_claim_count > 0` is still `status: "success"` and still implementation-safe — surface the limitation transparently in your reply, but do not block, retry, or escalate on it.
Coding is allowed only when the Hard Gate is satisfied. Otherwise, say "coding is allowed: no" and do not edit the blocked region.
Do not claim a Salt workflow completed merely because the host emitted a large payload.
