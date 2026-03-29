# Project Conventions Runtime

`@salt-ds/project-conventions-runtime` is an optional advanced helper for combining canonical Salt MCP guidance with one or more downstream project-convention layers.

It is a policy helper, not a repo-context detector. Use `salt-ds info --json` for detected context such as framework, workspace, imports, runtime targets, and repo instruction files.

Use this package in an application repo that consumes Salt when:

- a Salt MCP response includes `guidance_boundary.project_conventions`
- your organization has shared line-of-business conventions and team-level repo conventions
- your repo has approved wrappers, page patterns, navigation shells, local layouts, or migration shims
- you need a final recommendation with clear provenance instead of blending local conventions into canonical Salt guidance

Treat this package as the advanced path. It is most useful when you need deterministic merge behavior or layered `Salt -> LoB -> Team` composition.

For beta consumers, the product should still look like `salt-ds`. Teams should not need to think of this package as a second Salt product just to use the workflow model.

You do not need this package for a simple setup. A team can also:

1. keep `.salt/team.json` in the repo
2. load it directly in the agent workflow
3. apply the matching convention manually when the MCP says a project-conventions check is recommended

For teams using shared conventions packs, the preferred thing to publish is a shared conventions pack, for example `@acme/salt-conventions`, not this runtime package itself. This package is the merge and validation infrastructure behind the advanced path.

## Role In The Stack

- Salt MCP
  - answers the nearest correct Salt answer
- project conventions runtime
  - optionally refines that answer for one or more downstream convention layers
- Salt skills
  - orchestrate the workflow and tell the agent when to consult each layer

Keep the layers separate. Do not treat repo-specific wrappers or shells as if they were part of the Salt registry.

If a consumer repo still needs help creating or reviewing the conventions setup itself, use the `salt-project-conventions` skill from [`../skills`](../skills) and then apply this runtime package afterward.
For a simple bootstrap, have that skill generate `.salt/team.json` plus a small repo instruction snippet first. Keep this runtime package for the advanced layered path.

## Install

```sh
npm install @salt-ds/project-conventions-runtime
```

## Doctor And Validation

Use the bundled CLI to validate only Salt-owned conventions files:

```sh
npx salt-project-conventions doctor .
```

That checks:

- `.salt/team.json` if present
- `.salt/stack.json` if present
- any local file layers referenced from `.salt/stack.json`

To validate one explicit file without scanning anything else:

```sh
npx salt-project-conventions validate .salt/team.json
npx salt-project-conventions validate .salt/stack.json --kind stack
```

This CLI does not scan arbitrary JSON files in the repo.

## Editor Schema Support

The package ships these schemas:

- `node_modules/@salt-ds/project-conventions-runtime/schemas/project-conventions.schema.json`
- `node_modules/@salt-ds/project-conventions-runtime/schemas/project-conventions-stack.schema.json`

For VS Code, map them in `.vscode/settings.json`:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["/.salt/team.json", "/.salt/lob.local.json"],
      "url": "./node_modules/@salt-ds/project-conventions-runtime/schemas/project-conventions.schema.json"
    },
    {
      "fileMatch": ["/.salt/stack.json"],
      "url": "./node_modules/@salt-ds/project-conventions-runtime/schemas/project-conventions-stack.schema.json"
    }
  ]
}
```

Use plain JSON for now. JSONC is intentionally not supported yet.

## Main Entry Points

Use:

- `composeProjectConventionLayers`
  - to combine LoB, team, or repo layers into one effective conventions object with provenance
- `mergeCanonicalAndProjectConventionLayers`
  - to merge canonical Salt guidance directly with multiple convention layers
- `resolveProjectConventionStackLayers`
  - to resolve a `.salt/stack.json` manifest into ordered runtime layers
- `composeProjectConventionStack`
  - to compose a stack manifest and resolver into one effective conventions object
- `mergeCanonicalAndProjectConventionStack`
  - to merge canonical Salt guidance directly with a stack manifest and resolver

Typical flow:

1. Resolve the canonical Salt answer from the MCP.
2. Check whether `guidance_boundary.project_conventions.check_recommended` is `true`.
3. If it is, load `.salt/team.json` for a simple repo, or `.salt/stack.json` when the repo truly uses layering.
4. If a stack exists, resolve the convention layers listed in the stack, for example line of business first and team second.
5. Compose or merge those layers.
6. Return both the canonical choice and the project-specific final choice.

If you already have one effective conventions object and do not want a stack manifest, pass it as a single-element layer to `mergeCanonicalAndProjectConventionLayers(...)`.

## Default Vs Advanced

Default consumer path:

```text
.salt/
└── team.json
```

Advanced layered path:

```text
.salt/
├── team.json
├── stack.json
└── lob.local.json
```

Use the advanced layered path only when you actually need shared upstream conventions or explicit layer ordering.

## Enterprise Preview Track

Package-backed stack layers are the current shared conventions-pack path for organizations that want to test shared project conventions during beta.

That means:

- keep the default consumer path on `.salt/team.json`
- use `.salt/stack.json` only for selected teams that need shared line-of-business layers
- keep the preview limited to conventions, wrappers, internal examples, and migration rules layered on top of core Salt

This is an optional preview path, not a second default setup model.

The intended beta model is:

- teams install and use `salt-ds`
- organizations may publish shared conventions packs referenced from `.salt/stack.json`
- this runtime package remains an implementation helper for advanced layered policy handling

For beta debugging, start from `salt-ds info --json`:

- `policy.stackLayers[*].resolution`
  - shows whether each local or package-backed layer resolved
- `policy.sharedConventions.packDetails`
  - shows the shared pack name, export, version, status, and resolved path

## Recommended Layered Repo Layout

When you need layering, use one hidden folder as the discovery point:

```text
.salt/
├── team.json
├── stack.json
└── lob.local.json
```

The `stack.json` manifest defines merge order and layer sources. The conventions payloads themselves stay as normal `project_conventions_v1` files.

Typical stack manifest:

```json
{
  "contract": "project_conventions_stack_v1",
  "layers": [
    {
      "id": "lob-defaults",
      "scope": "line_of_business",
      "source": {
        "type": "package",
        "specifier": "@example/lob-salt-conventions",
        "export": "markets"
      }
    },
    {
      "id": "team-checkout",
      "scope": "team",
      "source": {
        "type": "file",
        "path": "./team.json"
      }
    }
  ]
}
```

The `layers` array order is the merge order. Broader defaults go first, more specific layers go later.

## Package-Backed LoB Example

If your organization publishes LoB conventions as a package, the exported object can look like:

- [`../../workflow-examples/project-conventions/lob-package.example.ts`](../../workflow-examples/project-conventions/lob-package.example.ts)

And the matching stack manifest can look like:

- [`../../workflow-examples/project-conventions/project-conventions.stack.example.json`](../../workflow-examples/project-conventions/project-conventions.stack.example.json)

## What The Runtime Returns

The merge result keeps provenance visible, including:

- `canonical_choice`
- `project_convention_applied`
- `project_convention_layer_applied`
- `final_choice`
- `merge_reason`
- `why_changed`

When an approved wrapper wins, the merge result can also keep wrapper provenance such as:

- `project_convention_applied.import`
- `project_convention_applied.use_when`
- `project_convention_applied.avoid_when`
- `project_convention_applied.migration_shim`
- `final_choice.import`

That makes it possible to say:

- canonical Salt answer: `Button`
- line-of-business default: `LobButton`
- team final answer: `TeamButton` from `@/components/TeamButton`

without pretending either convention layer is part of Salt itself.

## Related Docs

- [`../mcp/docs/consumer/project-conventions-contract.md`](../mcp/docs/consumer/project-conventions-contract.md)
- [`../mcp/docs/consumer/consuming-project-conventions.md`](../mcp/docs/consumer/consuming-project-conventions.md)
- [`../mcp/docs/consumer/consumer-repo-setup.md`](../mcp/docs/consumer/consumer-repo-setup.md)
- [`./LAYERED-CONVENTIONS.md`](./LAYERED-CONVENTIONS.md)
- [`../../workflow-examples/consumer-repo/README.md`](../../workflow-examples/consumer-repo/README.md)
