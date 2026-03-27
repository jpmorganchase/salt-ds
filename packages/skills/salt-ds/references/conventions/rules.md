# project conventions

Use this only when a consumer application repo has wrappers, page patterns, shells, or migration conventions that may change the final answer.

## Rules

- Treat the core Salt MCP as canonical Salt guidance only.
- If a Salt workflow result says project conventions matter, make sure declared repo policy exists and let the repo-aware Salt workflow apply it before finalizing the answer.
- The default consumer setup is `.salt/team.json`.
- For a simple bootstrap with no existing repo-local instruction file, pair `.salt/team.json` with `AGENTS.md` by default.
- If the repo already uses `CLAUDE.md` or another repo-local instruction file, update that existing file instead of creating a second one.
- Add `.salt/stack.json` only when the consumer wants layered conventions such as `Salt -> LoB -> Team`.
- Do not require consumers to implement deterministic layered merge in normal repos; repo-aware Salt workflows should own it.
- Do not require a standalone `salt-project-conventions doctor` command in consumer repos today.
- Validate the conventions shape from the contract and file contents directly until a consumer-facing conventions check returns through the main `salt-ds` CLI or another clearly published surface.
- Use the `topics` field to narrow what to look for:
  - `wrappers`
  - `page-patterns`
  - `navigation-shell`
  - `local-layout`
  - `migration-shims`
- If project conventions are unavailable, say the answer is a canonical Salt starter direction that still needs consumer-repo alignment.
- Do not present repo conventions as if they were part of the official Salt registry.
