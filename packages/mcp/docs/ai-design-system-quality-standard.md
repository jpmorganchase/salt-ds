# AI Design System Quality Standard

Use this document to benchmark Salt against strong public design-system AI offerings without turning the repo into outside-product marketing.

This file is not a status tracker.

It is a reference for:

- product positioning
- docs and skill quality
- setup and packaging
- evaluation criteria

## Benchmark Archetypes

Use these archetypes as the comparison set.

### Skill-First Public DS Product

Why it matters:

- strongest public examples in this group are easy to understand quickly
- they show concrete asks users can copy immediately
- they feel tightly connected to project configuration and code generation

What Salt should learn:

- tighter trigger examples
- clearer first-run path
- stronger "what this helps with right now" framing

### AI-Ready Packaging Product

Why it matters:

- strongest public examples in this group package docs, skills, and AI access as one coherent product surface
- they present AI support as first-class product infrastructure rather than a side project

What Salt should learn:

- stronger packaging and setup coherence
- clearer statement of what the AI stack includes
- a more obvious freshness and canonical-source story

### Official MCP-Setup Product

Why it matters:

- strongest public examples in this group make MCP setup and host expectations clear
- they treat setup friction as a product concern, not just a documentation detail

What Salt should learn:

- better install verification
- clearer host integration guidance
- stronger visibility into whether the host is actually using Salt's specialist path

### DS-Intelligence Product

Why it matters:

- strongest public examples in this group make design-system-specific value visible
- they expose migration, tokens, patterns, or design judgment as official product capabilities

What Salt should learn:

- make design-system-specific intelligence more visible
- keep migration and design-token value obvious in the product story
- treat specialist setup as a polished workflow, not just a package reference

## Salt's Current Position

Salt is currently stronger than many public examples in these areas:

- workflow rigor
- separation of canonical guidance, repo context, project policy, and runtime evidence
- migration safety
- review discipline
- repo-aware orchestration

Salt is currently weaker than the strongest public examples in these areas:

- first-run discoverability
- consumer-facing packaging polish
- obvious common-surface guidance
- visible design-language guidance
- benchmark visibility

## Product Standard Salt Should Meet

To feel top-tier, Salt should be excellent at all of these:

1. First-run clarity
   - a user can understand what Salt is for quickly
2. Specialist trust
   - the agent feels grounded in Salt rather than generic frontend heuristics
3. Surface intelligence
   - the agent knows common product surfaces, not just low-level components
4. Design judgment
   - the agent can explain hierarchy, density, layout ownership, and bounded customization
5. Repo awareness
   - the agent starts from project context and policy instead of guessing
6. Packaging quality
   - docs, skill, CLI, and MCP tell one coherent story
7. Evaluation discipline
   - regressions are measurable

## Strategic Decisions From This Benchmark

These are the current strategic decisions Salt should follow.

### 1. Keep One Consumer Front Door

Use [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx) as the single consumer-facing AI page.

Do not split the consumer story across:

- separate host guides
- separate setup pages
- separate workflow pages

### 2. Keep One Public Skill

Keep `salt-ds` as the only public skill.

Do not fragment the product into separate public create, review, migrate, or conventions skills.

### 3. Add DS Judgment, Not Just Workflow Rules

Salt must expose compact shared intelligence for:

- common product surfaces
- design principles

This is one of the biggest differences between a strong workflow skill and a top-tier design-system product.

### 4. Lead With Value Before Transport

Consumer docs should explain:

- what Salt helps with
- what Salt knows
- why Salt is better than generic prompting

before they explain:

- MCP
- CLI fallback
- troubleshooting

### 5. Compete On Canonicality

Salt should differentiate itself by grounding more of the product in:

- canonical docs
- extracted semantics
- stable workflow outputs

not by adding more long skill prose.

### 6. Benchmark Against Real DS Tasks

Salt should be measured on tasks that matter to design-system consumers:

- dashboard or overview page
- table plus filters
- form workflow
- dialog workflow
- navigation shell
- supporting states
- migration from non-Salt UI
- upgrade from older Salt usage

## Benchmark Criteria

Use these criteria when scoring Salt against public benchmark archetypes or against generic prompting.

### Docs And Packaging

- Can a new user understand the product in under ten minutes?
- Is there one obvious install path?
- Is the setup verification clear?
- Do docs, skill, MCP, and CLI tell the same story?

### Skill Quality

- Are trigger examples obvious?
- Does the skill route correctly by job?
- Is project-context-first behavior explicit?
- Are negative triggers clear?

### Design-System Intelligence

- Does Salt reason about common surfaces well?
- Does Salt show design judgment, not only API recall?
- Does it preserve task flow and state structure during migration?

### Trust And Safety

- Does Salt avoid generic CSS/React fallback when Salt is required?
- Does it ask instead of guessing when the choice is structurally important?
- Does it keep runtime evidence in the right support role?

### Evaluation

- Are the strongest DS tasks covered by checked-in benchmark scenarios?
- Can maintainers compare generic prompting versus Salt-guided prompting?
- Are regressions visible in CI or curated eval runs?

## What This Benchmark Means For Current Work

The highest-value changes are:

1. strengthen the consumer AI page
2. strengthen the public skill front section
3. add compact shared references for surfaces and design principles
4. improve canonical docs where Salt still relies too heavily on hand-authored AI wording
5. add benchmark-driven evaluation for priority DS tasks

## Keep Watching

Revisit this benchmark when any of these change materially:

- Salt gets a stable public skill distribution path
- Salt expands visual-grounding support
- Salt adds richer docs-derived extraction
- leading public design-system AI products materially improve their setup, packaging, or DS-specific guidance
