# Consuming Project Conventions

Use the core Salt MCP for canonical Salt guidance. Use project conventions only to refine or replace the final project answer for one application repo or product.

Use `salt-ds info --json` for detected repo context. Use `.salt/team.json` or `.salt/stack.json` for declared policy only.

If a repo still needs the default local Salt policy files, bootstrap them first with `salt-ds init`.

The simplest model does not require any runtime package:

1. keep `.salt/team.json` in the repo
2. load it when `guidance_boundary.project_conventions.check_recommended` is `true`
3. apply the matching rule in the final answer

For consumer use, keep the product model on `salt-ds`. Do not treat `@salt-ds/project-conventions-runtime` as a second required Salt product.

If your organization needs shared upstream defaults, publish a declarative conventions pack such as `@acme/salt-conventions` and reference it from `.salt/stack.json`. Let `salt-ds` own the workflow, detection, and merge behavior around that policy.

The runtime package in [`../../project-conventions-runtime`](../../project-conventions-runtime) remains available as advanced infrastructure for layered policy mechanics, but it should not be the main thing teams think they are adopting.

If you need to create, update, or review the conventions setup itself, use the public `salt-ds` skill from [`../../skills`](../../skills) and make it explicit that the job is conventions setup rather than UI build or review.
For a simple bootstrap, start with `.salt/team.json` plus a small repo instruction snippet that tells the agent when to read that file.

Recommended default location in a consumer repo:

```text
AGENTS.md
.salt/
└── team.json
```

If your organization has a shared line-of-business layer, add `.salt/stack.json` as the layered upgrade path. The stack can list the team file plus any local or package-backed upstream layers.

Local file-backed layers are valid too. Use them when one repo wants to trial layered policy without publishing a shared conventions pack yet.

## Shared Conventions Pack Path

For selected teams, package-backed layers in `.salt/stack.json` are the shared conventions pack path.

Use that path when:

- your organization publishes shared Salt conventions as an internal package
- multiple repos need the same line-of-business defaults
- you want teams to test private guidance without changing the default product model

Keep the preview narrow:

- package-backed line-of-business conventions
- team overrides in `.salt/team.json`
- clear provenance in the merged result

Local layered extensions are also valid:

- add file-backed layers in `.salt/stack.json`
- use them for one repo or a small local trial
- keep package-backed layers for shared upstream policy across multiple repos

What teams should install:

- `salt-ds`

What organizations may publish:

- a shared conventions pack such as `@acme/salt-conventions`
- named exports for different lines of business or product areas

What teams should not need to adopt as part of the main consumer story:

- a second Salt-facing runtime package just to use the workflow product

What `salt-ds info --json` means:

- `policy.stackLayers`
  - shows both file-backed and package-backed layers, plus `resolution` status and resolved paths
- `policy.sharedConventions.enabled`
  - turns on only when package-backed layers are present, because that flag marks shared upstream policy
- `policy.sharedConventions.packDetails`
  - shows the shared pack name, export, installed version, resolution status, and resolved path for each package-backed layer

Use those fields to answer:

- did the repo find the expected stack layers?
- did the shared pack resolve at all?
- which pack version was actually installed?
- is the team file or local layer still missing?

Do not treat this as a second setup path for every consumer repo.

## When Canonical Salt Is Enough

Use the Salt MCP result directly when:

- `guidance_boundary.project_conventions.check_recommended` is `false`
- the task is a pure Salt lookup, token decision, or foundation question
- no local wrappers, shells, or repo-specific migration shims are involved

## When To Check Project Conventions

Check repo-specific conventions when:

- `guidance_boundary.project_conventions.check_recommended` is `true`
- `guidance_boundary.project_conventions.topics` includes items such as:
  - `wrappers`
  - `page-patterns`
  - `navigation-shell`
  - `local-layout`
  - `migration-shims`
- the repo already mentions approved wrappers, custom shells, compatibility layers, or local pattern rules

## Keep The Two Layers Separate

Present the final answer in two steps:

- canonical Salt
  - the nearest correct Salt component, pattern, example, or migration path
- detected context
  - framework, package versions, repo instructions, imports, runtime targets, and other facts discovered from the repo
- project policy
  - the repo-specific wrapper, shell, or migration rule that changes how the canonical Salt answer is applied

Do not present repo policy as if it came from the Salt registry.

When a matching convention exists, it should win for the final project answer. Canonical Salt stays visible as provenance, not as the final policy.

If you use the runtime helper, keep these fields visible:

- `canonical_choice`
- `project_convention_applied`
- `final_choice`
- `merge_reason`

When an approved wrapper wins, also keep the wrapper provenance visible when it exists:

- `project_convention_applied.import`
- `project_convention_applied.use_when`
- `project_convention_applied.avoid_when`
- `project_convention_applied.migration_shim`
- `final_choice.import`

## Recommended Merge Order

1. Resolve the canonical Salt answer first.
2. Check project conventions only if the boundary metadata recommends it.
3. If the repo only has `.salt/team.json`, apply that file directly.
4. If multiple downstream layers exist, apply them from broadest to most specific:
   `line of business -> team -> repo`.
5. Within the effective project conventions, apply matching rules in this order:
   `banned_choices`, `preferred_components`, `approved_wrappers`, `pattern_preferences`, then canonical Salt.
6. If a matching project convention exists, use it as the final project answer.
7. Preserve both reasons in the final output.

## Missing And Partial Conventions

- If no project conventions are available, keep the canonical Salt answer and say that no repo refinement was applied.
- If project conventions exist but none match the canonical answer, keep the canonical Salt answer and preserve the boundary metadata.
- If only one part of the repo guidance is defined, apply only that part and leave the rest canonical.

## Conflicts

- Treat `banned_choices` as the strongest rule.
- Use `preferred_components` before generic wrapper or pattern rules when both match the same canonical answer.
- Keep wrappers and page patterns repo-specific in the final presentation; they do not replace the canonical Salt rationale.

## Example

- Canonical Salt answer: `Button`
- line-of-business conventions answer: `LobButton`
- team conventions answer: `TeamButton`
- Final recommendation: use `TeamButton`, import it from the repo wrapper location when provided, and explain that it is the team convention layered on top of canonical Salt and the shared LoB defaults

## Related Docs

- [`consumer-repo-setup.md`](./consumer-repo-setup.md)
- [`project-conventions-contract.md`](./project-conventions-contract.md)
- [`../../workflow-examples/project-conventions/conventions-pack.happy-path.md`](../../workflow-examples/project-conventions/conventions-pack.happy-path.md)
- [`../../project-conventions-runtime/README.md`](../../project-conventions-runtime/README.md)
- [`../../workflow-examples/consumer-repo/README.md`](../../workflow-examples/consumer-repo/README.md)
