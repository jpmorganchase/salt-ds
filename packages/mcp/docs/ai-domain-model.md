# AI Domain Model

This file defines the conceptual model the Salt AI tooling should reason over.

Use it to answer:

- what Salt concepts should exist as first-class data
- what belongs in canonical core Salt versus extension layers
- which workflows should consume which entity types
- where a new gap should be fixed when AI behavior is incomplete

This is not a public product document. It is a maintainer-facing model for keeping the MCP, semantic core, CLI, skills, docs extraction, and extension layers aligned.

For the concrete implementation checklist behind shared extension packs and layered policy, see [`./extension-productionization-checklist.md`](./extension-productionization-checklist.md).

## Why This Exists

The theme gap exposed a modeling problem:

- `Themes` existed in docs
- `Tokens` existed in the registry
- but the default code mapping for JPM Brand was not first-class structured knowledge

The purpose of this model is to stop that class of gap from recurring.

If a concept matters to `create`, `review`, `migrate`, `upgrade`, or `info`, it should not exist only as prose if the workflow needs a stable machine-readable answer.

## Core Rule

Critical workflow facts should exist as structured data.

Docs should explain them.

The registry should model them.

Workflow tools should consume them.

Do not rely on search and prose alone for:

- default code mappings
- migration-critical replacements
- stable policy facts
- workflow decisions that should not drift across transports

## Canonical Core Entities

These belong in core Salt and should be modeled inside the canonical registry.

### Theme Presets

Theme presets are not the same thing as raw tokens.

They answer:

- which provider to use
- which CSS imports to include
- which default props to apply
- which font setup is required

Examples:

- `jpm-brand`
- `legacy`

### Tokens

Tokens answer:

- semantic styling roles
- theme and density applicability
- whether direct use is encouraged or discouraged
- migration and validation guidance

Tokens should stay separate from theme presets.

### Components

Components answer:

- what to import
- when to use and not use them
- prop surface and examples
- related tokens and patterns
- related changes and deprecations

### Patterns

Patterns answer:

- how multiple components work together
- what composition shape is correct
- when a pattern is preferable to raw component assembly

### Assets

Assets cover:

- icons
- country symbols

They should remain first-class because they have their own lookup and code-generation needs.

### Docs

Docs split into:

- pages
- guides

Docs remain the canonical narrative explanation layer, but they should not be the only place a critical workflow fact lives.

### Examples

Examples should stay first-class.

They are not just a field on components or patterns. They are important retrieval objects for:

- starter code
- migration familiarity
- recommendation support
- grounding answers with concrete code

### Packages

Packages should stay first-class because install, import, and migration reasoning depend on them.

### Changes And Deprecations

These should stay first-class for:

- upgrade
- migrate
- review
- replacement suggestions

They are operational Salt knowledge, not only release notes.

## Extension And Runtime Entities

These should not be merged into canonical core Salt facts.

### Business Patterns

Business patterns are external to this repo.

They should be modeled as extension-layer entities that:

- reference canonical Salt patterns and components
- add domain-specific workflow or composition guidance
- do not redefine canonical Salt component facts

### Project Conventions

Project conventions are repo or organization-specific policy layers such as:

- `.salt/team.json`
- `.salt/stack.json`
- package-backed conventions packs

They refine canonical Salt guidance after the core answer is produced.

### Runtime Evidence

Runtime evidence is workflow input, not canonical Salt knowledge.

Examples:

- live app capture
- Storybook inspection
- structured source outline
- future screenshot or design-adapter evidence

Runtime evidence should influence confidence and verification, not replace canonical Salt facts.

## Required Relationships

The model is only useful if the relationships are explicit.

### Theme Preset Relationships

- theme preset -> provider
- theme preset -> CSS imports
- theme preset -> default provider props
- theme preset -> required font setup
- theme preset -> supporting docs
- theme preset -> relevant token families

### Component Relationships

- component -> package
- component -> examples
- component -> related patterns
- component -> related guides
- component -> related tokens
- component -> changes
- component -> deprecations

### Pattern Relationships

- pattern -> composed components
- pattern -> examples
- pattern -> related patterns
- pattern -> related guides

### Business Pattern Relationships

- business pattern -> canonical patterns
- business pattern -> canonical components
- business pattern -> local conventions

Business patterns should be additive overlays, not parallel canonical systems.

## Workflow Read Matrix

This is the practical reason the model exists.

### `info`

Should read:

- packages
- project conventions
- docs/guides
- runtime target hints

### `create`

Should read:

- theme presets
- components
- patterns
- examples
- docs/guides
- project conventions

### `review`

Should read:

- theme presets
- tokens
- components
- patterns
- docs/guides
- project conventions
- runtime evidence when needed

### `migrate`

Should read:

- theme presets
- components
- patterns
- examples
- changes
- deprecations
- docs/guides
- project conventions
- runtime evidence

### `upgrade`

Should read:

- packages
- changes
- deprecations
- docs/guides
- project conventions when relevant

## Modeling Rules

When adding or changing Salt AI behavior:

1. Decide which entity type owns the fact.
2. Decide whether it is canonical core, extension, or runtime input.
3. Add structured fields before adding MCP heuristics.
4. Keep workflow tools consuming the modeled entity, not scraping prose ad hoc.

## Current Implications

Based on the current repo shape, these are the important maintainership rules:

- `Themes` should be split conceptually into:
  - theme presets
  - tokens
- `Examples` should remain first-class
- `Packages` should remain first-class
- `Changes` and `deprecations` should remain first-class
- `Business patterns` should stay outside canonical core Salt and enter through extension layers

## Decision Test

Before adding a new AI behavior, ask:

1. What entity type is this behavior actually about?
2. Is that entity already modeled as structured data?
3. If not, should it be modeled before changing workflow logic?
4. Is this canonical Salt, extension policy, or runtime evidence?

If those answers are unclear, the model is incomplete and should be fixed first.
