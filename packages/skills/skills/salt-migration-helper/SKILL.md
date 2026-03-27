---
name: salt-migration-helper
description: migrate salt code between versions, replace deprecated usage, re-check migrated salt output, and modernize outdated patterns. use when the user asks about upgrade impact, breaking changes, deprecated apis, version-aware replacements, css override cleanup, or salt modernization work. return a migration summary, affected apis or patterns, recommended actions, and risk notes.
---

# Salt Migration Helper

Assume the user is migrating code in an application repo that consumes Salt. Identify the version boundaries and code scope before suggesting changes. Focus first on required migration work, then on optional cleanup, validate replacement guidance against canonical Salt sources before suggesting project-specific workarounds, and re-check the migrated result against Salt when updated code is available. Keep the detailed workflow and output structure in the referenced files.

## When To Use

- migrating Salt code between versions
- understanding upgrade impact, breaking changes, or deprecations before editing code
- replacing deprecated Salt usage with current canonical alternatives
- deciding whether CSS overrides, selector hacks, or migration shims should remain after the upgrade
- do not use this as the primary workflow for non-Salt UI translation or general UI review

## Required Workflow

Follow these steps in order.

1. Confirm or infer the source version, target version, affected package scope, and whether the request is about required migration work or optional modernization.
2. Load `references/migration-workflow.md`, `references/common-migration-gotchas.md`, and `references/output-template.md`.
3. Load `../../references/project-conventions.md` only when the consumer repo has wrappers, shims, or migration conventions that could change the final plan, or when `guidance_boundary.project_conventions.check_recommended` is `true`.
4. Load `../../references/canonical-salt-tool-surfaces.md` and follow it for choosing between Salt MCP, CLI fallback, source-level validation, and runtime evidence.
5. Treat this as Salt version upgrade work, not as the primary workflow for translating non-Salt UI into Salt.
6. Complete the workflow in this order:
   - establish the version boundary and required upgrade impact first
   - inspect the current code for deprecated or risky usage
   - identify the canonical Salt replacements
   - re-run validation on the migrated result when updated code is available
   - if MCP is unavailable, start from `salt-ds info --json` and keep the same workflow through the Salt CLI
7. Treat CSS overrides, selector hacks, and migration shims as explicit review items. Highlight them separately and ask whether they should be removed once the canonical Salt replacement is in place.
8. Apply project conventions only after the canonical upgrade step when repo-local wrappers or migration rules change the final implementation.
9. If a migration step depends on custom compatibility code, explain why the canonical Salt replacement does not fully cover the case.
10. Request runtime evidence only when source reasoning and validation are still not enough:
    - use cheap URL fetch or fetched HTML when title, status, coarse structure, or obvious landmarks are enough
    - run `salt-ds doctor` when the runtime target is unclear
    - run `salt-ds review <changed-path> --url <url>` when source validation and runtime evidence should stay in the same pass
    - run `salt-ds runtime inspect <url>` only when the task is explicitly evidence-only debugging or support work
    - treat layout-debug details as advanced evidence only
11. Write the response with `references/output-template.md`.

## Examples

- "Compare our current Salt version to the target release and list the required migration work for this package."
- "Review this migrated Salt file, validate it again, and tell me which CSS overrides can probably be removed."
- "Identify the deprecated APIs in this code path and map them to canonical replacements."
- "Use the migration helper, then inspect the running page before and after the migration so we can decide whether the remaining overrides should stay."

## Common Edge Cases

- If the version boundary is unclear, stop and infer it from package manifests, lockfiles, or explicit code references before giving detailed advice.
- If CSS overrides remain after the migration pass, treat them as a separate decision instead of silently carrying them forward.
- If a compatibility layer is still required, explain why the canonical Salt replacement is not sufficient yet.
- If updated migrated code is available, do not stop after planning the migration; validate the result again.
- If runtime evidence matters, prefer browser-session evidence and keep fetched-HTML fallback claims narrower; use browser tooling or manual testing when the migration risk depends on client-side state, focus behavior, or screenshots.

## Output

Return a version-aware migration response that distinguishes required work from optional cleanup, includes post-migration validation status, and surfaces CSS override removal decisions.
