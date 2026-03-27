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
- `lob-package.example.ts`
  - Example package export shape for a line-of-business conventions package referenced from `.salt/stack.json`.
- `conventions-pack.happy-path.md`
  - Short end-to-end beta example for local or package-backed layered policy with `salt-ds info --json`.
- `mergeGuidance.ts`
  - Thin re-export of the supported helper from `@salt-ds/project-conventions-runtime`.
- `merge-guidance.example.ts`
  - Tiny example entry point that re-exports the helper in example form.

Supported helper:

- `../../packages/project-conventions-runtime`
  - Supported consumer-side package that combines canonical Salt guidance with repo conventions without extending the core Salt MCP.

Suggested flow:

1. Call the core Salt MCP.
2. Check `guidance_boundary.project_conventions`.
3. If `check_recommended` is `true`, load `.salt/team.json` for the default path.
4. Only if the repo uses layering, load `.salt/stack.json` and resolve its extra layers.
5. Merge the two sources without rewriting the canonical Salt recommendation.

Shared conventions pack note:

- package-backed layers in `.salt/stack.json` are the current shared conventions pack path for teams testing shared project conventions on top of the default workflow product
- `salt-ds info --json` should show the shared pack in `policy.sharedConventions.packDetails`
- `salt-ds info --json` should show file-backed and package-backed layer resolution under `policy.stackLayers[*].resolution`

The important rule is provenance:

- canonical Salt guidance stays canonical
- repo conventions stay repo-specific
- the final recommendation shows both

The merge helper returns explicit provenance fields:

- `canonical_choice`
- `project_convention_applied`
- `final_choice`
- `merge_reason`

When wrapper rules win, the provenance can also carry real wrapper details such as:

- import path and exported name
- `use_when`
- `avoid_when`
- whether the wrapper is a temporary migration shim

Conflict order in the helper:

1. `banned_choices`
2. `preferred_components`
3. `approved_wrappers`
4. `pattern_preferences`
5. canonical Salt answer

Validation and debugging:

- `npx salt-project-conventions doctor <repo-root>`
  - validate `.salt/team.json`, `.salt/stack.json`, and any stack-referenced local layer files
- `npx salt-project-conventions validate path/to/file.json`
  - validate one explicit conventions or stack file without scanning unrelated repo JSON
