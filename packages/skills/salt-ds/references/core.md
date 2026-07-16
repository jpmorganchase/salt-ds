# Salt DS Core

## Boundaries

Salt MCP is read-only and owns canonical lookup, version-aware guidance, workflow gates, and semantic review. The host owns intent, repo inspection, authorized edits, and validation. Do not install or upgrade packages, change configuration, add tooling, or broaden scope without authorization.

Do not guess Salt APIs, props, packages, imports, tokens, composition, examples, or links. Workflow evidence counts as grounding. Call `get_salt_reference` only when an action returns it, the user explicitly asks for an exact reference, or an intended API remains ungrounded. Keep lookups to 1-3 exact targets. Without MCP, use labeled observations from installed code, types, or user sources; do not implement an unverified Salt API.

Pass a known `root_dir` to the matching primary workflow. Each workflow resolves context fresh; a prior `get_salt_project_context` result is diagnostic, not reusable state. Load `troubleshooting.md` for root, policy, schema, registry, or complete-source failures.

## Actions and mutation

Treat the returned action as the next Salt step. `action.tool` and `action.post_action.tool` are stable server-local semantic IDs, not necessarily host-visible names. Within the configured Salt server, select the unique exact bare name or qualified name whose final semantic segment equals the ID. Preserve action args exactly. Never suffix-match across unrelated or unidentified servers. If no unique match exists, refresh the Salt surface once, then report the ambiguity and stop; do not invent an alias.

`ask_user` always stops: ask the returned question and wait for new input. A reference post-action is allowed only when the immediately preceding result has `decision.status: results`, requested and found counts equal the requested-name count, zero not-found and ambiguous counts, no unresolved names, and every nested decision is `found`. Otherwise stop without the post-action.

Mutation still requires prior user authorization. For create or migrate, edit Salt UI only when the same workflow result has all four gates:

- `status: success`
- `action.kind: implement`
- `safety.exact_request_safe: true`
- `evidence.status: complete`

For review, `action.kind: apply_fixes` with `scope: grounded_findings` means source-backed remediations are available, not that mutation is authorized. If edits were authorized, apply only those concrete fixes and rerun the complete updated file through the returned review post-action. Otherwise report the findings and request authorization.

## Completion

Review the complete current contents of every changed Salt source file separately; never send a diff or excerpt. The public input limit is 524,288 characters per file. Do not truncate a larger file: report that v1 cannot review it and do not claim deterministic completion.

Pass source-backed `guidance.review_targets` unchanged only to the composition-root file owning the complete set; omit them for leaf files. If no single file owns the aggregate contract, review every file, disclose the v1 limit, and do not claim the target/composition check complete.

Source gaps and `ask_user` results are inconclusive. Fix authorized `apply_fixes` findings and rerun. A reviewed file is clean only with `status: success`, `action.kind: complete`, `evidence.status: complete`, and no source blocker. Disclose nonzero `internal_limitations.unsupported_claim_count` and `unsupported_rule_kinds` as coverage limits.

Use relevant host-owned Figma or Storybook context, but never treat design names as Salt APIs or visuals as MCP evidence. Run existing typechecks and focused tests. Semantic review does not prove runtime behavior, accessibility, intent, or visual fidelity.

Lead the final response with the user outcome. Include changed files, validations, blockers, coverage limits, and what remains unverified without restating the tool payload.
