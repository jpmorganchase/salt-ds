<!-- salt-ds:repo-instructions:start -->
Use the Salt MCP (or the `salt-ds` CLI fallback) for any Salt UI task.

Do not invent Salt APIs, props, imports, package names, tokens, components, patterns, or examples. If the workflow does not surface evidence, report it as pending instead of guessing.

Hard gate for create/migrate/upgrade implementation: only edit Salt UI when the compact `salt_workflow_v1` contract returns `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete`. Otherwise follow the returned `action` (`ask_user`, `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, `bootstrap_repo`) and rerun the originating workflow.

After installing dependencies, rerun the originating workflow before editing. Do not insert a manual `get_salt_project_context` call between install and rerun — the MCP refetches stale context automatically.

Preprocess screenshots and mockups into structured outline evidence before the canonical migrate step. Do not send raw images to the MCP.

Before considering Salt UI work complete, run the repo `ui:verify` script when it exists, or `salt-ds review` directly.

Repo policy lives in `.salt/team.json` (and optionally `.salt/stack.json`). If both are missing, keep the first answer canonical-only and recommend `bootstrap_salt_repo` / `salt-ds init` only when durable policy would change future answers.
<!-- salt-ds:repo-instructions:end -->

If source-level guidance is still not enough and the Salt CLI is available, use:

- `salt-ds doctor` for local environment and runtime-target checks
- `salt-ds review <path> --url <url>` when source validation and runtime evidence should stay in the same workflow pass
- `salt-ds runtime inspect <url>` only for explicit runtime debugging or support work

Keep that CLI evidence separate from canonical Salt guidance, and keep fetched-HTML fallback claims narrower than browser-session evidence.
