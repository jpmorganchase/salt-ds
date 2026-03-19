# Salt Skills

This directory contains a collection of Salt-focused agent skills. Skills are packaged instructions and references for specific workflows, so an agent can load targeted guidance instead of carrying a large, general prompt.

These skills work especially well alongside the Salt MCP in `packages/mcp`, which provides canonical lookup, recommendation, examples, analysis, and migration tooling.

## Available skills

### `salt-ui-reviewer`

Review existing React UI that uses Salt Design System.

Use when:
- Reviewing, critiquing, fixing, simplifying, or modernizing Salt-based UI.
- Checking JSX, composition, styling, accessibility, or design-system alignment.
- Turning a code review or UI audit into a priority-ordered set of findings.

Covers:
- Component and pattern choice.
- Composition and hierarchy quality.
- Foundations, styling, accessibility, and maintainability checks.

### `salt-ui-builder`

Build Salt-first UI from product requirements, rough descriptions, screenshots, mockups, or partial code.

Use when:
- Creating a component, page, screen, layout, or scaffold with Salt.
- Translating a screenshot or mockup into a Salt-first structure.
- Refining partial Salt code into a cleaner implementation direction.

Covers:
- Requirement-to-structure workflow.
- Primitive, pattern, foundation, and token selection.
- Clarifying questions, assumptions, and starter output shape.

### `salt-migration-helper`

Upgrade Salt usage across versions and replace deprecated or outdated APIs and patterns.

Use when:
- Migrating Salt code between versions.
- Understanding upgrade impact or breaking changes.
- Replacing deprecated usage with current, canonical alternatives.

Covers:
- Version boundary analysis.
- Deprecated API and pattern review.
- Migration planning, action sequencing, and risk framing.

## Recommended companion tools

- Salt MCP in `packages/mcp` for canonical lookup, recommendation, examples, analysis, and migration guidance.
- `discover_salt` and `choose_salt_solution` for broad discovery and solution selection.
- `get_salt_entity` and `get_salt_examples` for canonical details and implementation examples.
- `analyze_salt_code` and `compare_salt_versions` for validation, deprecations, and migrations.

## Skill structure

- `SKILL.md`: concise trigger and workflow instructions for the skill.
- `references/`: detailed workflow guides, rubrics, gotchas, and output templates loaded as needed.
- `agents/openai.yaml`: agent-facing metadata such as display name, short description, and other interface hints for supported environments.

## Repository layout

```text
packages/skills/
├── AGENTS.md
├── CLAUDE.md
├── README.md
└── skills/
    ├── salt-ui-reviewer/
    ├── salt-ui-builder/
    └── salt-migration-helper/
```
