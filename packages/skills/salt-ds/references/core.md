# Salt DS Core

Load this file once at the start of a Salt workflow turn.

## Public V1 Contract

Use the Salt MCP server as the only public transport.
The MCP server is read-only.

Public tools:

- `get_salt_project_context`
- `get_salt_reference`
- `review_salt_ui`
- `create_salt_ui`
- `migrate_to_salt`

Public resources:

- `salt://capabilities/manifest`
- `salt://catalog/manifest`
- `salt://catalog/entity/{name}`

Do not call or recommend CLI workflow commands, repo bootstrap tools, artifact persistence tools, runtime inspection, review-resume resources, raw screenshot ingestion, Figma-native ingestion, or upgrade workflows as public v1 behavior.

## No Salt Invention

Do not guess Salt APIs, props, package names, imports, tokens, composition rules, examples, or documentation links.

Before naming or implementing Salt-specific structure, obtain canonical evidence through MCP. If evidence is missing, follow the returned `next_required_action`, use `get_salt_reference`, ask the user, or stop with the blocker.

## Project Context

For repo-aware Salt work, call `get_salt_project_context` first or pass a known `root_dir` or `context_id` into the workflow tool.

If context resolution returns `needs_explicit_root`, `mismatch`, or an untrusted context, stop and retry with an explicit `root_dir` before relying on repo-specific guidance.

## Hard Gate

Do not edit Salt UI for create or migrate implementation work unless the current workflow output has all of:

- `status: success`
- `action.kind: implement`
- `safety.exact_request_safe: true`
- `evidence.status: complete`

After editing, run the returned review or post action before calling the work complete.

Review workflows can produce findings and fixes, but still treat their Salt evidence and action fields as binding.

## Action Loop

1. Establish project context when repo shape matters.
2. Call `create_salt_ui`, `review_salt_ui`, or `migrate_to_salt`.
3. Read `status`, `action.kind`, `next_required_action`, `safety`, `questions`, `evidence`, and `summary`.
4. Perform exactly the returned action.
5. If asked to retrieve entity or example evidence, call `get_salt_reference` with the returned args.
6. If asked to install dependencies or fix context, let the host/user perform that local action, then rerun the originating workflow.
7. Edit only when the Hard Gate is satisfied.
8. Run `review_salt_ui` after edits.

Do not code around partial, blocked, missing-evidence, or ask-user states.

## Output Posture

Keep answers decision-first. Report compact workflow state before implementation detail:

- `status`
- `action.kind`
- `evidence.status`
- `summary`

When blocked, say what succeeded, what is blocked, and what exact MCP follow-up is required. Do not invent new compact fields or treat a large payload as proof of completion.
