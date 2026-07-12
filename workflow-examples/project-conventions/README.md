# Project Conventions Workflow Examples

These workflow examples show how to keep the core Salt MCP canonical while still applying repo-specific conventions.

Files:

- `project-conventions.example.json`
  - Example repo conventions payload that follows `project_conventions_v1`.
- `project-conventions.wrapper-heavy.example.json`
  - Wrapper-heavy example for repos that standardize analytics or product defaults through approved Salt wrappers.
- `project-conventions.pattern-heavy.example.json`
  - Pattern-heavy example for repos that standardize shells, dashboard regions, or other page-level Salt compositions.
- `project-conventions.stack.example.json`
  - Layered stack example for repos that need `.salt/stack.json` on top of the default `.salt/team.json` flow.
- `lob-policy.example.json`
  - Inert JSON example for a shared line-of-business policy copied into the repo and referenced from `.salt/stack.json`.
- `conventions-pack.happy-path.md`
  - Short end-to-end example for data-only layered policy through repo-aware Salt MCP workflows.
- `custom-host-merge.example.ts`
  - Advanced custom-host example for teams that intentionally need to mirror Salt's merge behavior outside the normal repo-aware MCP path.

Boundary note:

- Salt uses a private policy engine internally.
- This example intentionally does not import that code, so a consumer repo can mirror the merge contract without depending on Salt workspace internals.
- Most consumers should not copy this helper. Start from the checked-in `.salt/team.json` example, adapt it deliberately, and let repo-aware Salt MCP workflows apply the declared policy.
- The helper is deliberately narrow: normalize the Salt response to `{ name, why, check_recommended }`, then pass in loaded `.salt/team.json` and `.salt/stack.json` rule layers.
- If you copy this example into another repo, keep the merge order and provenance fields, and keep config loading and validation separate.

Suggested flow:

1. Call the core Salt MCP.
2. Check `guidance_boundary.project_conventions`.
3. If `check_recommended` is `true`, load `.salt/team.json` for the default path.
4. Only if the repo uses layering, load `.salt/stack.json` and resolve its extra layers.
5. Merge the two sources without rewriting the canonical Salt recommendation.

Shared conventions note:

- every `.salt/stack.json` layer is a repo-local JSON file; Salt MCP never imports or requires executable policy modules
- organizations can distribute reviewed JSON policy, but consumer repos must check it in or otherwise materialize it beneath the repo root before referencing it
- repo-aware `create_salt_ui`, `review_salt_ui`, and `migrate_to_salt` calls load declared policy from the supplied `root_dir`
- inspect `workflow.project_conventions_check` and `artifacts.project_policy` for declared-policy status, loaded layers, and warnings

The important rule is provenance:

- canonical Salt guidance stays canonical
- repo conventions stay repo-specific
- the final recommendation shows both

The merge helper returns explicit provenance fields:

- `canonical_choice`
- `project_convention_applied`
- `final_choice`
- `merge_reason`

Conflict order in the helper:

1. `banned_choices`
2. `preferred_components`
3. `approved_wrappers`
4. `pattern_preferences`
5. canonical Salt answer

Validation and debugging:

- Call `get_salt_project_context` with the disputed `root_dir` when root or policy detection is unclear.
- Rerun the relevant repo-aware workflow and inspect `artifacts.project_policy.warnings` when a team or stack layer does not load.
- Salt MCP is read-only: edit or validate `.salt/team.json`, `.salt/stack.json`, and referenced layers through the repo's own file and schema tooling.
