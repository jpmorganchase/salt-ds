# Salt DS Core

## Boundaries

Salt MCP is read-only. It owns canonical Salt lookup, version-aware guidance, workflow gates, and deterministic semantic review. The host owns intent, repo inspection, authorized edits, and local validation. Do not install or upgrade packages, change configuration, add tooling, or broaden scope without user authorization.

Do not guess Salt APIs, props, packages, imports, tokens, composition, examples, or links. Workflow evidence counts as grounding. Call `get_salt_reference` only when an action returns it, the user explicitly asks for an exact reference, or an API you intend to use remains ungrounded. Keep implementation-heavy lookups to 1-3 exact targets. If MCP is unavailable, limit work to labeled observations from installed code, types, or user sources; do not implement an unverified Salt API.

Pass a known `root_dir` to the matching primary workflow. Each workflow resolves context fresh; a prior `get_salt_project_context` result is diagnostic, not reusable state. Load `troubleshooting.md` for root, policy, schema, registry, or complete-source failures.

## Actions and mutation

Treat the returned action as the next Salt step. `ask_user` always stops: ask the returned question and wait. When an action supplies a tool and concrete arguments, call that tool with those arguments; do not invent aliases or substitute placeholders. Honor a returned post-action after its prerequisite succeeds.

Mutation still requires prior user authorization. For create or migrate, edit Salt UI only when the same workflow result has all four gates:

- `status: success`
- `action.kind: implement`
- `safety.exact_request_safe: true`
- `evidence.status: complete`

For review, `action.kind: apply_fixes` with `scope: grounded_findings` means source-backed remediations are available, not that mutation is authorized. If edits were authorized, apply only those concrete fixes and rerun the complete updated file through the returned review post-action. Otherwise report the findings and request authorization.

## Completion

Review the complete current contents of every changed Salt source file separately; never send a diff or excerpt. The public input limit is 524,288 characters per file. Do not truncate a larger file: report that v1 cannot review it and do not claim deterministic completion.

Pass source-backed `guidance.review_targets` unchanged only to the composition-root file that genuinely owns the complete target set; omit them for leaf files. If targets are distributed and no single file owns the aggregate contract, review every file without pretending aggregate coverage, disclose the v1 limitation, and do not claim the target/composition check complete.

Source gaps and `ask_user` results are inconclusive. Fix authorized `apply_fixes` findings and rerun. A reviewed file is clean only with `status: success`, `action.kind: complete`, `evidence.status: complete`, and no source blocker. Disclose nonzero `internal_limitations.unsupported_claim_count` and `unsupported_rule_kinds` as coverage limits.

Use available host-owned Figma or Storybook context, mappings, renders, and existing checks when relevant; never treat design-layer names as Salt APIs or raw visual input as MCP evidence. Run the repo's existing typecheck and focused tests. Deterministic review does not prove runtime behavior, accessibility conformance, product intent, or visual fidelity.

Lead the final response with the user outcome. Include changed files, validations, blockers, coverage limits, and what remains unverified without restating the tool payload.
