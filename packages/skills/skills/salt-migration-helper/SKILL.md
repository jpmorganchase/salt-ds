---
name: salt-migration-helper
description: migrate salt code between versions, replace deprecated usage, and modernize outdated patterns. use when the user asks about upgrade impact, breaking changes, deprecated apis, version-aware replacements, or salt modernization work. return a migration summary, affected apis or patterns, recommended actions, and risk notes.
---

# Salt Migration Helper

Identify the version boundaries and code scope before suggesting changes. Focus first on required migration work, then on optional cleanup, and validate replacement guidance against canonical Salt sources before suggesting project-specific workarounds. Keep the detailed workflow and output structure in the referenced files.

## Workflow

1. Confirm or infer the source version, target version, affected package scope, and whether the request is about required migration work or optional modernization.
2. Load `references/migration-workflow.md`, `references/common-migration-gotchas.md`, and `references/output-template.md`.
3. Use Salt MCP only where it narrows the migration:
   - `compare_salt_versions` for upgrade impact and deprecations.
   - `analyze_salt_code` for code-level findings.
   - `get_salt_entity` and `get_salt_examples` for canonical replacements.
   - Treat Salt MCP output as canonical Salt guidance. If the codebase has approved wrappers, shims, or local migration conventions, confirm them through separate project conventions instead of assuming they are part of the core Salt registry.
4. If a migration step depends on custom compatibility code, explain why the canonical Salt replacement does not fully cover the case.
5. Write the response with `references/output-template.md`.

## Output

Return a version-aware migration response that distinguishes required work from optional cleanup.
