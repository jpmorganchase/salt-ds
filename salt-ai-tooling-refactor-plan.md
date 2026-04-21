# Salt AI Tooling Refactor Plan

## Research Summary

### Landscape

**Salt-ds is the only design system with MCP/CLI AI tooling.** No one else — not MUI, not Carbon, not Polaris, not Atlassian — has a programmatic tool surface for component selection. Vercel v0 is the closest comparison, and it takes the opposite approach: zero classifier, pure LLM, shadcn registry injected as flat JSON context.

| Design System             | AI Tooling                                | Approach                                                      |
| ------------------------- | ----------------------------------------- | ------------------------------------------------------------- |
| **Vercel v0 + shadcn/ui** | Full code generation                      | LLM-driven. Registry JSON injected as context. No classifier. |
| **Figma AI**              | Component suggestion + generation         | Hybrid. LLM generates, validates against component schema.    |
| **Ant Design X**          | None (provides AI-oriented UI components) | Good docs, lets external LLMs work from them.                 |
| **MUI**                   | Docs chatbot only                         | Relies on LLM training data + doc quality.                    |
| **Atlassian**             | None public                               | Internal AI features, not DS-level.                           |
| **IBM Carbon**            | None shipped                              | Thorough docs as pre-built RAG material.                      |
| **Shopify Polaris**       | None                                      | Opinionated guidance docs and pattern recipes.                |
| **Radix / Chakra**        | None                                      | shadcn is the AI-facing layer for Radix.                      |

### LLM Tool Design Best Practices (Anthropic & OpenAI)

The consensus:

> **Build "dumb" tools with smart prompts.** Tools should be clean data accessors. The LLM handles intent parsing, disambiguation, and composition.

Key principles:

- Tools should be **simple and focused** — one clear action per tool
- Put intelligence in the **prompt/system message**, not in complex tool logic
- Prefer **multiple simple tools** over one complex tool with many modes
- Let the model handle **intent parsing** — don't pre-classify in the tool
- For multi-step workflows, prefer **chained tool calls** over single monolithic tools

Salt-ds does the opposite — `create` is a "smart" tool that tries to classify intent, score candidates, and compose results. This is where the brittleness lives.

## What Salt-ds Gets Right (Keep These)

1. **Structured match status** (`success`, `blocked`, `partial`, `misrouted`) — no one else has this. It tells the agent exactly what to do next.
2. **Composition contracts** with follow-through lists — unique to salt-ds, genuinely useful for multi-region work.
3. **Starter code generation** — validated snippets with correct imports.
4. **Project conventions** (`.salt/team.json`) — repo-aware decisions no one else supports.
5. **The registry itself** — rich component metadata (props, when_to_use, when_not_to_use, examples, composition, accessibility).

## What's Broken (Change These)

1. **Keyword routing** (`resolveSolutionType` in `createSaltUiHelpers.ts`) — a hand-tuned classifier that breaks on every new keyword collision (e.g., "grid" → foundation, "dialog" → both component and pattern, "color" → token).
2. **Fuzzy recommendation as the primary path** — `recommendComponent` tries to score natural language against component fields. The LLM is better at this.
3. **Single monolithic tool** — `create` does lookup + classify + recommend + compose + generate. Should be multiple focused tools.
4. **Prompt decomposition in the tool** — `create` tries to handle "dashboard with cards and data table" as one query. The LLM should decompose this into multiple tool calls.

## Proposed Architecture: Lookup + Catalog + Compose

### Three tool surfaces instead of one

| Tool                    | Purpose                                    | Input                                                                              | Output                                                                 | Complexity                                         |
| ----------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| `lookup_salt`           | Exact entity resolution by name/alias      | `{ name: "Dialog" }`                                                               | Full component/pattern record with props, starter code, composition    | **Dumb** — pure lookup                             |
| `discover_salt`         | Browse/search the catalog                  | `{ query?: string, category?: string, type?: "component"\|"pattern" }`             | Ranked list of entity summaries (name, category, summary, when_to_use) | **Thin** — light filtering, no heavy scoring       |
| `plan_salt_composition` | Composition contract for multi-entity work | `{ entities: ["Dialog", "Button", "Icon"], layout?: "page"\|"form"\|"dashboard" }` | Composition contract, slot structure, follow-through                   | **Structured** — deterministic from known entities |

### What changes

- The **LLM** handles intent parsing: "confirmation dialog with warning icon" → the agent calls `lookup_salt({ name: "Dialog" })`, not a fuzzy recommender.
- The **LLM** handles decomposition: "dashboard with cards and data table" → the agent calls `lookup_salt` 3× (Card, Data grid, GridLayout), then `plan_salt_composition` to get the assembly contract.
- The **skill guidance** tells the agent how to decompose and which tool to use when.
- `discover_salt` exists for genuine exploration ("I need something for notifications — what does Salt have?") — this is where the registry metadata is useful, but as a browsable catalog, not a classifier.

### What stays

- The registry and all its metadata
- Starter code generation (attached to `lookup_salt` results)
- Composition contracts (refactored into `plan_salt_composition`)
- Match status and follow-through
- Project conventions

### What goes

- `PATTERN_KEYWORDS`, `FOUNDATION_KEYWORDS`, `TOKEN_KEYWORDS` — the LLM classifies intent
- `resolveSolutionType` — the LLM picks the right tool
- `scoreQueryFields` as the primary path — becomes optional re-ranking for `discover_salt` only
- Single `create_salt_ui` function doing everything

### Key architectural principle

> The tools are **data accessors**. The LLM is the **router and composer**.
>
> `lookup_salt` answers "tell me about Dialog."
> `discover_salt` answers "what does Salt have for notifications?"
> `plan_salt_composition` answers "how do these 4 entities fit together?"
>
> The LLM answers "the user wants a confirmation dialog with a warning icon" → call `lookup_salt("Dialog")`.

## Existing Infrastructure

The MCP codebase already has `get_salt_entity`, `get_salt_examples`, and `discover_salt` defined but **filtered out** of the 6-tool surface in `toolDefinitions.ts`. The infrastructure for the "dumb tools" architecture is partially built — it just isn't exposed or prioritized.

## Migration Path

| Phase          | Change                                                                                                                     | Risk   | Notes                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| **Phase 0** ✅ | Strengthen skill guidance for agent-side decomposition. Keep current tools.                                                | Zero   | Already done — added prompt decomposition guidance to SKILL.md |
| **Phase 1**    | Add `lookup_salt` as a thin exact-match tool alongside `create`. Update skills to prefer `lookup_salt` for known entities. | Low    | Additive — doesn't break existing `create`                     |
| **Phase 2**    | Expose `discover_salt` as a catalog browser. Move fuzzy search there.                                                      | Low    | Additive — the tool already exists in MCP                      |
| **Phase 3**    | Refactor `plan_salt_composition` from existing composition contract logic.                                                 | Medium | Extract from `compositionContract.ts`                          |
| **Phase 4**    | Deprecate `create` as the primary path. Skills route through lookup → discover → compose.                                  | Medium | Skill rewrite needed                                           |
| **Phase 5**    | Remove keyword classifier and heavy scoring from the primary path. Keep as optional re-ranker in `discover_salt`.          | Low    | Dead code removal                                              |

## Evidence From Probing

During development of this plan, we ran 71 agent-style probe tests against the current tooling. Key findings:

- **33/33 focused queries** (single component/pattern names) resolve correctly
- **19/19 natural language synonyms** resolve to acceptable components
- **7/10 complex multi-entity prompts** resolve to the correct primary pattern
- **3/10 complex prompts** had issues:
  - "confirmation dialog with warning icon" → Icon (should be Dialog) — keyword scoring can't distinguish primary vs modifier nouns
  - "user profile with tabs and avatar" → App header (debatable)
  - "file manager with breadcrumbs and table" → File upload (debatable)

The failure mode is always the same: **the keyword scorer can't parse compositional intent**. The LLM can.

## Date

Plan created: April 20, 2026
