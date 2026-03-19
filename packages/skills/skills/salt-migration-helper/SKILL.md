---
name: salt-migration-helper
description: migrate salt code between versions, replace deprecated usage, and modernize outdated patterns. use when the user asks about upgrade impact, breaking changes, deprecated apis, version-aware replacements, or salt modernization work. return a migration summary, affected apis or patterns, recommended actions, and risk notes.
---

# Salt Migration Helper

Identify the version boundaries and code scope before suggesting changes. Focus first on required migration work, then on optional cleanup. Do not suggest replacements without checking version boundaries first.

## Workflow

1. Confirm or infer the source version, target version, affected package scope, and whether the request is about required migration work or optional modernization.
2. Load `references/migration-workflow.md` and `references/common-migration-gotchas.md`.
3. Use Salt MCP selectively:
   - `compare_salt_versions` for upgrade impact, breaking changes, and deprecations.
   - `analyze_salt_code` for code-level deprecated usage and fix opportunities.
   - `get_salt_entity` for canonical replacement guidance.
   - `get_salt_examples` when a better replacement pattern or updated usage example is needed.
4. Write the response with `references/output-template.md`.

## Output

Return a migration summary, affected apis or patterns, recommended actions, and risk notes. Distinguish required migration work from optional cleanup when possible.
