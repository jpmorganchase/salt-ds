# Upgrade Rules

Use this file only for `upgrade` work after project context is known.

## Priority Order

1. version boundary
2. required change
3. canonical replacement
4. validation of updated code
5. optional cleanup and modernization

## Critical Rules

- establish the current Salt version, target version, and packages in scope before suggesting changes
- treat breaking changes, deprecated usage, and behavior changes as required work before optional cleanup
- obtain canonical Salt guidance through MCP or CLI before proposing Salt-specific replacements
- keep canonical replacement guidance separate from repo-local conventions, shims, or wrappers
- when updated code is available, validate the changed result through the review workflow before treating the upgrade as complete
- treat custom CSS overrides, selector hacks, and compatibility wrappers as suspect until the target Salt API proves they are still needed
- do not mix unrelated redesign work into the mandatory upgrade path unless the user explicitly asks for modernization beyond the version move
- if the upgrade output is partial, noisy, or truncated, use `references/shared/degraded-tooling.md` and fail closed rather than guessing the replacement path

## Decision Rule

Separate findings into:

- required now
- safe optional cleanup
- validation still needed

Do not blur those categories in the final recommendation.
