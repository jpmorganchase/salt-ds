# Salt Migrate

Use migrate for non-Salt UI code, foreign component libraries, or structured source outlines that should become Salt while preserving task flow and important states.

## Required Path

1. Load `core.md`.
2. Call `get_salt_project_context` when repo shape matters.
3. Call `migrate_to_salt` with code, query, or `source_outline`.
4. If the workflow asks for Salt entity or example evidence, call `get_salt_reference`.
5. Rerun `migrate_to_salt` after required follow-up evidence or installs.
6. Edit only when the Hard Gate in `core.md` is satisfied.
7. Run `review_salt_ui` after edits.

## Rules

- Preserve the source task flow, critical actions, states, and hierarchy.
- Translate toward canonical Salt; do not clone foreign visual styling.
- Treat screenshots and Figma nodes as host-normalized evidence only. Public v1 MCP expects code, query, or structured source outlines.
- Do not use upgrade, CLI migration, runtime inspection, or artifact persistence as public v1 behavior.
