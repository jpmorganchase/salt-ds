# Future Package Architecture

This note captures the intended package split for Salt's canonical reasoning, local runtime evidence, and operator workflows.

It is meant to prevent architectural drift as the current `packages/mcp` implementation gets split into cleaner layers over time.

For the phased implementation sequence that gets from the current state to this target shape, see [`package-architecture-implementation-plan.md`](./package-architecture-implementation-plan.md).

## Publication Stance

Treat this split as internal package architecture first, not a commitment to publish every boundary as a public product.

Default stance:

- keep `packages/semantic-core` private
- keep `packages/runtime-inspector-core` private
- keep `packages/mcp-local-runtime` private unless a real client forces it into existence
- keep `packages/mcp` public
- only publish `packages/cli` if it becomes a real supported operator surface

The goal is cleaner ownership and dependency boundaries, not five separately versioned public packages.

This also gives Salt a usable surface in environments where MCP support is missing, immature, or unavailable.

- MCP remains the best agent interface where it exists
- the CLI becomes the fallback and operator surface where it does not

## Boundary Test

Use this rule first:

- if the output is a Salt judgment, it belongs to `semantic-core` and is exposed through the Salt MCP
- if the output is local evidence or artifacts, it belongs to `runtime-inspector-core` and is exposed through the Salt CLI

That rule should stay stable even if package names or specific commands change.

## Target Package Layout

### `packages/semantic-core`

Owns:

- docs-derived semantics
- registry loading and search
- recommendation and ranking
- translation and migration reasoning
- validation rules
- canonical result types and response schemas

Should export functions such as:

- `recommendComponent(intent, context)`
- `getComponentGuidance(componentName)`
- `validateUsage(sourceOrPlan)`
- `getMigrationAdvice(from, to)`
- `searchSaltConcepts(query)`

Should not own:

- browser automation
- local runtime inspection
- command-line parsing
- MCP server concerns

Publication:

- internal/private by default

### `packages/mcp`

Owns:

- MCP tool definitions
- MCP request and response shaping
- source attribution
- compacting agent-facing responses
- the stdio server entrypoint

Should mostly be a thin adapter over `semantic-core`.

Its root package export should stay curated:

- expose the supported MCP-facing API
- avoid re-exporting every helper from `semantic-core`
- keep helper-level semantic utilities internal to `semantic-core`
- enforce that root-only public surface with a package `exports` map once the supported API is clear

Publication:

- public and supported

### `packages/runtime-inspector-core`

Owns:

- browser or session handling
- URL loading
- screenshot capture
- console and runtime error collection
- accessibility tree or role extraction
- structure and landmark summaries
- artifact generation
- JSON schemas for local evidence

Should export functions such as:

- `runDoctor(options)`
- `inspectUrl(url, options)`
- later, `inspectStorybookStory(storyId, options)`

Should not own:

- canonical Salt judgments
- Salt component or pattern policy
- MCP tool definitions

Publication:

- internal/private by default

### `packages/cli`

Owns:

- command parsing
- human-readable terminal output
- JSON output flags
- exit codes
- local config discovery
- artifact path display
- support workflow UX

Initial commands:

- `salt doctor`
- `salt runtime inspect <url>`

Later, only if needed:

- `salt runtime storybook <story-id>`
- `salt lint`
- `salt codemod`
- `salt migrate`

In v1, keep the CLI strongly scoped to diagnostics and runtime evidence rather than mixing in every semantic operation immediately.

Publication:

- start as internal if needed
- publish later only if it becomes a supported operator-facing tool

### `packages/mcp-local-runtime`

Optional later.

Owns:

- a thin MCP wrapper around selected local runtime capabilities
- invoking `runtime-inspector-core` directly
- local safety gates or allowlists if needed

Should exist only if a real shell-less client needs those capabilities.

Publication:

- private unless proven necessary

## Dependency Direction

Use this dependency shape:

```text
semantic-core             standalone
runtime-inspector-core    standalone
mcp                       -> semantic-core
cli                       -> runtime-inspector-core
cli                       -> semantic-core (optional later)
mcp-local-runtime         -> runtime-inspector-core
```

Avoid:

- `semantic-core -> cli`
- `semantic-core -> runtime-inspector-core`
- `mcp -> cli`
- `runtime-inspector-core -> mcp`
- parsing CLI stdout inside MCP code

## Shared Schema Rule

The CLI and any future wrappers should share stable schemas from the owning core package.

Examples:

- semantic result schemas live with `semantic-core`
- doctor and runtime-inspection schemas live with `runtime-inspector-core`

Do not invent separate versions of the same schema in CLI, MCP wrappers, or skills.

## Current State

Today, `packages/mcp` still mixes three concerns:

- canonical Salt reasoning
- MCP server and tool adapter code
- a small stdio CLI used to launch the MCP server

The current file at `packages/mcp/src/cli.ts` is the MCP server launcher, not the future user-facing `salt` CLI.

## Current-To-Future Mapping

### Move First Into `semantic-core`

These areas now belong in `semantic-core` and are the model for any future canonical reasoning work:

- registry build and extraction:
  - `packages/semantic-core/src/build/*`
- registry loading and cache helpers:
  - `packages/semantic-core/src/registry/*`
- search utilities:
  - `packages/semantic-core/src/search/*`
- canonical lookup, recommendation, translation, migration, and validation logic:
  - `packages/semantic-core/src/tools/*`
  - `packages/semantic-core/src/tools/translation/*`
  - `packages/semantic-core/src/tools/validation/*`

New canonical Salt reasoning should land there by default instead of being added to `packages/mcp`.

### Keep In `packages/mcp`

These are MCP-surface concerns and should stay in the package even after `semantic-core` exists:

- MCP server wiring:
  - `packages/mcp/src/server/*`
- MCP tool registration metadata:
  - `packages/mcp/src/server/toolDefinitions.ts`
- MCP-specific response shaping and attribution:
  - `packages/mcp/src/server/sourceAttribution.ts`
  - `packages/mcp/src/server/registerTools.ts`
- MCP launcher:
  - `packages/mcp/src/cli.ts`

### Split Carefully

These files likely need to be split or reduced rather than moved whole:

- `packages/mcp/src/index.ts`
  - re-export semantic-core APIs from the new package
  - keep MCP server exports in `packages/mcp`
- `packages/mcp/src/types.ts`
  - move domain and registry types into `semantic-core`
  - keep server-only or MCP-only types in `packages/mcp`
- `packages/mcp/src/server/index.ts`
  - keep the MCP-only server-facing entrypoints explicit

## Phased Extraction Plan

### Phase 0. Freeze The Boundaries In Docs

Deliverables:

- this note
- links from the maintainer guide and roadmap
- no code movement yet

Exit criteria:

- the desired split is documented before more package-level drift happens

### Phase 1. Extract `semantic-core`

Deliverables:

- create `packages/semantic-core`
- move pure registry, search, and canonical reasoning modules there
- keep `packages/mcp` re-exporting the moved functions to avoid breaking current consumers

Recommended first exports:

- registry build and load
- search and lookup
- recommendation
- validation
- migration advice
- translation planning

Exit criteria:

- canonical Salt reasoning can be imported without depending on MCP server code

### Phase 2. Thin Down `packages/mcp`

Deliverables:

- reduce MCP tools to thin adapters over `semantic-core`
- keep response shaping, attribution, truncation, and tool naming local to `packages/mcp`
- leave the current stdio server launcher in place

Exit criteria:

- `packages/mcp` owns agent transport and response shaping, not the design-system brain

### Phase 3. Add `runtime-inspector-core`

Deliverables:

- create a new package for browser/runtime evidence
- define stable doctor and inspection schemas
- keep it free of canonical Salt policy

Initial outputs:

- JSON reports
- screenshots
- console and runtime errors
- accessibility and structure summaries
- support bundle metadata

Exit criteria:

- local runtime evidence can be produced without going through MCP

### Phase 4. Add `packages/cli`

Deliverables:

- create the user-facing `salt` CLI
- ship `salt doctor`
- ship `salt runtime inspect <url>`
- support human output and `--json`

Exit criteria:

- local operator workflows exist without coupling them to the MCP server

### Phase 5. Optional Runtime MCP Bridge

Deliverables:

- only if needed, create `packages/mcp-local-runtime`
- expose a very small subset of local runtime capabilities over MCP
- consume `runtime-inspector-core` directly

Exit criteria:

- shell-less clients can access a small local runtime surface without turning the CLI into the main design center

## What Not To Do

- do not make `semantic-core` depend on browser tooling
- do not make MCP wrap CLI text for canonical Salt reasoning
- do not let runtime evidence become canonical Salt policy
- do not block the CLI work on a full semantic-core extraction first

## Practical Rule

If a team needs an immediate implementation heuristic while this split is in progress:

- canonical Salt answer -> put it in `semantic-core` and expose it through MCP
- local evidence or support diagnostics -> put it in runtime-inspector-core and expose it through CLI
