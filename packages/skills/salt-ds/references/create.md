# Salt Create

Use create for bounded new Salt UI: components, forms, panels, dialogs, dashboards, page sections, and small workflow surfaces.

## Required Path

1. Load `core.md`.
2. Call `get_salt_project_context` when repo shape matters.
3. Call `create_salt_ui`.
4. If the workflow asks for entity or example evidence, call `get_salt_reference` with the returned args.
5. Rerun `create_salt_ui` after required follow-up evidence or installs.
6. Edit only when the Hard Gate in `core.md` is satisfied.
7. Run `review_salt_ui` after edits.

## Rules

- Keep the user's requested surface intact.
- Do not broaden a concrete ask into generic taxonomy prose.
- Preserve unresolved requested nouns as blockers until MCP evidence covers them.
- Prefer stable Salt primitives and patterns first.
- Do not use any second transport, repo setup, version-upgrade, runtime inspection, or artifact persistence path as public v1 behavior.
