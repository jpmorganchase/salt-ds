# Project Conventions Contract

The core Salt MCP in `packages/mcp` only serves canonical Salt guidance from official Salt sources.

Use separate project conventions when a repo needs to carry local knowledge such as:

- approved wrapper components
- repo-specific page or workflow patterns
- local "prefer X over canonical Y" conventions
- allowed or banned abstractions
- migration constraints that are specific to one product codebase

## Boundary

Keep the boundary explicit:

- Core Salt MCP answers: "What is the nearest correct Salt answer?"
- Detected context answer: "What does this repo look like right now?"
- Project conventions answer: "How should this repo apply Salt?"

The core Salt MCP should not ingest or hardcode project conventions. Agents should combine the two layers at runtime.

## Suggested Flow

1. Read detected context from the repo or from `salt-ds info --json`.
2. If the repo still needs the default local policy files, bootstrap them with `salt-ds init` before editing conventions manually.
3. Query the core Salt MCP for canonical Salt guidance.
4. If `project_conventions.check_recommended` is `true`, resolve repo-specific conventions through separate project conventions.
   Use `project_conventions.topics` to narrow the kind of repo guidance you need to inspect.
5. Produce the final recommendation with both sources in view.

## Contract Name

Use `project_conventions_v1` for payloads that follow the schema in `packages/mcp/schemas/project-conventions.schema.json`.

Use plain JSON for now. JSONC is intentionally not supported yet.

If consumers want editor autocomplete or validation, point the editor at the bundled runtime schemas in:

- `node_modules/@salt-ds/project-conventions-runtime/schemas/project-conventions.schema.json`
- `node_modules/@salt-ds/project-conventions-runtime/schemas/project-conventions-stack.schema.json`

## Minimal Conventions Shape

Project conventions can stay small. The important part is that they are explicit and source-backed.

Recommended sections:

- `preferred_components`
- `approved_wrappers`
- `pattern_preferences`
- `banned_choices`
- `notes`

## Missing Or Partial Conventions

- Missing project conventions should never erase the canonical Salt answer.
- Partial project conventions should only refine the parts they actually cover.
- If no project-convention rule matches the canonical answer, keep the canonical Salt recommendation unchanged.

## Conflict Resolution Order

When multiple project-convention rules match the same canonical answer, apply them in this order:

1. `banned_choices`
2. `preferred_components`
3. `approved_wrappers`
4. `pattern_preferences`
5. canonical Salt answer

This keeps hard bans and explicit replacements ahead of wrappers and broader pattern guidance.

## Narrowing Vs Replacing

- A project convention should narrow, wrap, or sequence the canonical Salt answer.
- It should not pretend that repo-specific components are part of the official Salt registry.
- Keep the canonical Salt rationale visible even when the final repo recommendation changes.

## Richer Wrapper Provenance

When `approved_wrappers` are used, capture enough detail for an agent to produce a real project recommendation instead of a name-only substitution.

Useful wrapper fields include:

- `import`
  - the real module path and exported wrapper name
- `use_when`
  - situations where the wrapper should win
- `avoid_when`
  - situations where the wrapper should not be used
- `migration_shim`
  - whether the wrapper is temporary migration compatibility code rather than a durable product abstraction

This metadata stays repo-local. It does not change the canonical Salt rationale. It makes the downstream project answer more precise.

## Example Use Cases

- "Use `AppButton` instead of raw `Button` in product surfaces."
- "Prefer the repo's shell layout wrapper around canonical Salt page scaffolds."
- "Do not use `VerticalNavigation` in this app; the product uses a custom workspace rail built from approved Salt primitives."

## Provenance

When combining project conventions with core Salt guidance, keep the sources distinct:

- `canonical_salt`
- `project_conventions`

Do not present project-specific guidance as if it were part of the official Salt registry.
