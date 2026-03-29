# Salt Skills

This collection supports Salt Design System workflows.

Prefer Salt primitives, patterns, foundations, and tokens over ad hoc UI composition. Before proposing custom UI, check Salt primitives, patterns, and foundations first. For token decisions, validate the token family and direct-use guidance against canonical Salt docs or the Salt MCP in `packages/mcp` when it is available. Treat the core Salt MCP as canonical Salt guidance only; repo-specific wrappers or local patterns should come from separate project conventions or explicit repo guidance.

Available skills:

- `salt-ds`: the primary public Salt workflow skill for build, review, migrate, upgrade, and conventions work in consumer repos.
- `salt-ui-reviewer`: internal workflow module for reviewing Salt-based React UI.
- `salt-ui-builder`: internal workflow module for building or translating UI into Salt.
- `salt-migration-helper`: internal workflow module for version upgrades and deprecation cleanup.
- `salt-project-conventions`: internal workflow module for `.salt/team.json` creation and maintenance.
