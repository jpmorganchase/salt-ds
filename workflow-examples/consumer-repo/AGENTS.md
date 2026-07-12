<!-- salt-ds:repo-instructions:start -->

Use the Salt MCP for any Salt UI task.

Do not invent Salt APIs, props, imports, package names, tokens, components, patterns, or examples. If the workflow does not surface evidence, report it as pending instead of guessing.

Hard gate for create/migrate implementation: only edit Salt UI when the compact `salt_workflow_v1` contract returns `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete`. Otherwise follow the returned action. `ask_user` stops. When a tool and concrete arguments are present, call them without inventing aliases or placeholders. Workflow evidence counts as grounding; use `get_salt_reference` only when returned, explicitly requested, or an intended API remains ungrounded.

After installing dependencies, rerun the originating workflow before editing. Do not insert a manual `get_salt_project_context` call between install and rerun; every workflow resolves context fresh.

For `fix_context`, diagnose and correct or obtain the explicit root or policy decision, then rerun the original workflow fresh. On schema rejection, refresh the live tool surface and originating workflow once; if returned arguments still fail their target schema, report a contract defect and stop rather than replaying them.

Preprocess screenshots and mockups into structured outline evidence before the canonical migrate step. Do not send raw images to the MCP.

For review, `action.kind: apply_fixes` with `scope: grounded_findings` identifies source-backed remediations but does not authorize mutation. Apply only those concrete fixes when edits were already authorized, then rerun the complete updated file through the review post-action.

Do not claim Salt UI work complete until every changed Salt source file's complete current contents have separately passed `review_salt_ui`; a diff, excerpt, placeholder, or truncated copy is not sufficient and the v1 limit is 524,288 characters per file. Pass source-backed `guidance.review_targets` unchanged only to a composition-root file that owns the complete set; omit them for leaf files. If no single file owns a target or composition contract distributed across files, disclose that v1 cannot prove aggregate coverage and do not claim that check complete. Rerun after source gaps or grounded fixes, then run `ui:verify` when it exists. Report nonzero `internal_limitations.unsupported_claim_count` and `unsupported_rule_kinds` as residual coverage limits.

Repo policy lives in `.salt/team.json` (and optionally `.salt/stack.json`). If both are missing, keep the first answer canonical-only and explain that durable repo policy is deferred outside the public v1 MCP workflow.

<!-- salt-ds:repo-instructions:end -->
