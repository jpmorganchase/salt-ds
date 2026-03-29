# Layered Project Conventions

This document describes the recommended design for supporting layered conventions such as:

- Salt
- line of business
- team

without pushing repo-specific knowledge into the core Salt MCP.

## Why This Exists

The current project conventions model works well for one downstream conventions layer:

- canonical Salt guidance from the MCP
- one effective project conventions object applied afterward

That is good for a single app repo, but it is not a great fit for:

- shared line-of-business conventions
- team-level overrides on top of those conventions
- different teams reusing the same LoB base with local refinements

## Keep The MCP Unchanged

The MCP should stay exactly where it is in the stack:

- canonical Salt only
- no LoB conventions
- no team conventions
- no inheritance logic

The layered model belongs entirely in the consumer/runtime layer.

## Target Model

Keep the layers explicit:

1. Salt MCP
   - canonical Salt answer
2. line-of-business conventions
   - shared business-unit defaults and bans
3. team conventions
   - repo-specific wrappers, patterns, and overrides
4. final merged recommendation

So the runtime story becomes:

```text
canonical Salt -> LoB conventions -> Team conventions -> final project answer
```

## Recommended File Ownership

### LoB Conventions

Treat LoB conventions as shared artifacts, not MCP data.

Good options:

- a shared package that exports a `project_conventions_v1` object
- a shared JSON file in a central internal repo
- a centrally managed config file copied into app repos

Example names:

- `.salt/lob.local.json`
- `@your-org/lob-salt-conventions`

### Team Conventions

Keep team conventions in the consuming repo under:

```text
.salt/team.json
```

That keeps the actual rules local while leaving room for a shared stack manifest.

### Stack Manifest

Keep layer order in one manifest:

```text
.salt/stack.json
```

That gives agents one obvious discovery point and keeps merge order out of the convention payloads themselves.

## Contract Strategy

Do not change the base conventions contract just to support layering.

Each layer should still use the same existing contract:

- `project_conventions_v1`

That keeps:

- schema validation simple
- authoring skills simple
- existing consumers compatible

Layer composition belongs in a separate stack manifest contract:

- `project_conventions_stack_v1`

That manifest only describes:

- which layers exist
- where they come from
- the order they should be applied in

## Runtime API

The runtime supports layered helpers and a stack-manifest model:

### Stack Manifest Types

```ts
type ProjectConventionsStack = {
  contract: "project_conventions_stack_v1";
  layers: ProjectConventionsStackLayerDefinition[];
};

type ProjectConventionsStackLayerDefinition = {
  id: string;
  scope: "line_of_business" | "team" | "repo" | "other";
  source:
    | { type: "file"; path: string }
    | { type: "package"; specifier: string; export?: string };
};
```

### Helpers

```ts
resolveProjectConventionStackLayers(stack, resolveLayer);
composeProjectConventionStack(stack, resolveLayer);
mergeCanonicalAndProjectConventionStack(canonical, stack, resolveLayer);
```

Returns:

- ordered runtime layers resolved from the stack manifest
- one effective `ProjectConventions` object when composed
- the same canonical/project/final shape as today when merged
- which layer supplied the winning rule

## Layer Merge Rules

Keep two kinds of precedence separate:

### 1. Rule-Type Precedence

This stays the same as today:

1. `banned_choices`
2. `preferred_components`
3. `approved_wrappers`
4. `pattern_preferences`
5. canonical Salt

### 2. Layer Precedence

Apply layers from broadest to most specific, using the `layers` array order in `.salt/stack.json`.

Within the same rule type, the more specific layer wins.

## Conflict Semantics

Within a single rule type:

- later layers override earlier layers for the same target
- different targets remain additive

Suggested identity keys:

- `banned_choices`
  - key by `name`
- `preferred_components`
  - key by `salt_name`
- `approved_wrappers`
  - key by `wraps`
- `pattern_preferences`
  - key by `canonical_salt_start` when present, otherwise `intent`

Examples:

- LoB says `Button -> LobButton`
- Team says `Button -> TeamButton`
- effective preferred component is `TeamButton`

But:

- LoB bans `UNSTABLE_SaltProviderNext`
- Team adds a wrapper for `Button`
- both survive because they target different rule spaces

## Provenance

Layering should preserve provenance, not hide it.

The effective merge result should be able to say:

- canonical Salt answer: `Button`
- LoB convention applied: `LobButton`
- Team override applied: `TeamButton`
- final answer: `TeamButton`

The runtime result now adds:

- `project_convention_layer_applied`
- `project_conventions.layers_consulted`
- `project_conventions.effective_conventions`

This should remain additive. Do not remove:

- `canonical_choice`
- `project_convention_applied`
- `final_choice`
- `merge_reason`

## Consumer Loading Model

The runtime should not guess where LoB conventions live, but it can work from one explicit stack manifest.

Recommended repo layout:

```text
.salt/
├── team.json
├── stack.json
└── lob.local.json
```

The consumer repo or its agent loads `.salt/stack.json`, then resolves each layer explicitly, for example:

```ts
const merged = await mergeCanonicalAndProjectConventionStack(
  canonical,
  stack,
  async (layer) => {
    if (layer.source.type === "file") {
      return readLocalConvention(layer.source.path);
    }

    if (layer.source.type === "package") {
      return readPackageConvention(layer.source.specifier, layer.source.export);
    }

    return null;
  },
);
```

This keeps discovery and auth concerns outside the runtime package.

## Skill Implications

The `salt-project-conventions` skill should support the layered model by:

- asking whether the user is editing a shared LoB layer or a team layer
- treating `.salt/stack.json` as the main discovery point
- treating `.salt/team.json` as the default file when layering is not needed
- encouraging team files to avoid duplicating broader LoB defaults
- clarifying whether a rule belongs at LoB scope or team scope

But the actual layer payloads still use the same `project_conventions_v1` format.

## What Not To Do

- do not move LoB or team conventions into the MCP
- do not introduce Salt-specific inheritance rules into the schema
- do not hide merge order inside the convention payload itself
- do not hide which layer changed the final answer

## Working Rule

Keep the architecture stable:

- Salt MCP answers:
  - what is the nearest correct Salt answer
- LoB conventions answer:
  - what this business area standardizes on
- Team conventions answer:
  - what this team or repo changes locally
- runtime layering answer:
  - how those convention layers combine on top of Salt
