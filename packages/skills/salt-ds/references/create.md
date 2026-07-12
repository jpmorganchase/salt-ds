# Salt Create

Use create for bounded new Salt UI: components, forms, panels, dialogs, dashboards, page sections, and small workflow surfaces.

## Path

1. Load `core.md`.
2. Inspect the requested surface and host conventions, then call `create_salt_ui` with `root_dir`.
3. Follow the returned action. Workflow evidence already counts as grounding. Use `get_salt_reference` only under the conditions in `core.md`. Dependency installation is a normal host/repo step outside the semantic workflow action contract. `ask_user` stops.
4. Edit only with user authorization and all four create/migrate gates from `core.md`. Keep the requested surface and returned starter guidance bounded.
5. Apply the completion protocol in `core.md`, then rerun grounded failures and the relevant existing host checks.

## Rules

- Keep the user's requested surface intact.
- Preserve unresolved requested nouns as blockers until workflow or exact-reference evidence covers them.
- Prefer stable Salt primitives and patterns first.
- Do not add dependencies, setup tooling, stories, or adjacent UI unless authorized.
