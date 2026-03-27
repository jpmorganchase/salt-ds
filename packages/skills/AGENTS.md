# Salt Skills

This collection supports Salt Design System workflows.

Prefer Salt primitives, patterns, foundations, and tokens over ad hoc UI composition. Before proposing custom UI, check Salt primitives, patterns, and foundations first. For token decisions, validate the token family and direct-use guidance against canonical Salt docs or the Salt MCP in `packages/mcp` when it is available. Treat the core Salt MCP as canonical Salt guidance only; repo-specific wrappers or local patterns should come from declared repo policy and repo-aware workflow artifacts, not from the core Salt registry.

Available skills:

- `salt-ds`: the primary public Salt workflow skill for build, review, migrate, upgrade, and conventions work in consumer repos.
