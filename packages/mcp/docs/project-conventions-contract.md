# Project Pattern Overlay Contract

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
- Project conventions answer: "How should this repo apply Salt?"

The core Salt MCP should not ingest or hardcode project conventions. Agents should combine the two layers at runtime.

## Suggested Flow

1. Query the core Salt MCP for canonical Salt guidance.
2. If `project_conventions.check_recommended` is `true`, resolve repo-specific conventions through separate project conventions.
3. Produce the final recommendation with both sources in view.

## Contract Name

Use `project_conventions_v1` for payloads that follow the schema in `packages/mcp/schemas/project-conventions.schema.json`.

## Minimal Overlay Shape

Project conventions can stay small. The important part is that they are explicit and source-backed.

Recommended sections:

- `preferred_components`
- `approved_wrappers`
- `pattern_preferences`
- `banned_choices`
- `notes`

## Example Use Cases

- "Use `AppButton` instead of raw `Button` in product surfaces."
- "Prefer the repo's shell layout wrapper around canonical Salt page scaffolds."
- "Do not use `VerticalNavigation` in this app; the product uses a custom workspace rail built from approved Salt primitives."

## Provenance

When combining project conventions with core Salt guidance, keep the sources distinct:

- `canonical_salt`
- `project_conventions`

Do not present project-specific guidance as if it were part of the official Salt registry.
