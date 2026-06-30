<!-- salt-ds:repo-instructions:start -->
Use the Salt MCP for any Salt UI task.

Do not invent Salt APIs, props, imports, package names, tokens, components, patterns, or examples. If the workflow does not surface evidence, report it as pending instead of guessing.

Hard gate for create/migrate implementation: only edit Salt UI when the compact `salt_workflow_v1` contract returns `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete`. Otherwise follow the returned `action` (`ask_user`, `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`) and rerun the originating workflow.

After installing dependencies, rerun the originating workflow before editing. Do not insert a manual `get_salt_project_context` call between install and rerun — the MCP refetches stale context automatically.

Preprocess screenshots and mockups into structured outline evidence before the canonical migrate step. Do not send raw images to the MCP.

Before considering Salt UI work complete, run the repo `ui:verify` script when it exists, then use `review_salt_ui` through the Salt MCP for Salt-specific review.

Repo policy lives in `.salt/team.json` (and optionally `.salt/stack.json`). If both are missing, keep the first answer canonical-only and explain that durable repo policy is deferred outside the public v1 MCP workflow.
<!-- salt-ds:repo-instructions:end -->
