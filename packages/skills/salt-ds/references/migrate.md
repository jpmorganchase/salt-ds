# Salt Migrate

Use migrate for non-Salt UI code, foreign component libraries, or structured source outlines that should become Salt while preserving task flow and important states.

## Path

1. Load `core.md`.
2. Inspect the source task flow and host conventions, then call `migrate_to_salt` with `root_dir` and a concise migration-goal `query`; add source `code` and/or `source_outline` as evidence when available.
3. Follow the returned action. Workflow evidence already counts as grounding. Use `get_salt_reference` only under the conditions in `core.md`; do not insert an extra lookup merely because this is migration. `ask_user` stops.
4. Edit only with user authorization and all four create/migrate gates from `core.md`. Preserve the task flow, important actions, states, and hierarchy while translating toward canonical Salt rather than cloning foreign styling.
5. Apply the completion protocol in `core.md`, then rerun grounded failures and the relevant existing host checks.

## Rules

- Preserve the source task flow, critical actions, states, and hierarchy.
- Translate toward canonical Salt; do not clone foreign visual styling.
- Do not add dependencies, change project configuration, or replace existing validation tooling unless authorized.
