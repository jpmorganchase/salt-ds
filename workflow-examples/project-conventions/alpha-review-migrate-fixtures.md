# Alpha Review And Migrate Fixtures

These are the smallest checked-in extension-aware alpha scenarios beyond the
`create` coverage.

Use them when checking whether project conventions materially improve
repo-aware Salt workflows without changing the canonical Salt core.

## Review: Wrapper Conflict With Declared Team Policy

Goal:

- confirm `salt-ds review` keeps canonical validation primary
- confirm the workflow also shows that declared repo policy still matters

Fixture shape:

- `.salt/team.json` declares an approved wrapper such as `TrackedButton`
- source code contains a pass-through wrapper over a Salt primitive

Expected signals:

- `review-conventions-conflict` appears in `ruleIds`
- `projectConventionsCheck.checkRecommended` is `true`
- `projectConventionsCheck.topics` includes `wrappers`
- notes make the declared `.salt/team.json` policy visible

## Migrate: Shared Conventions Pack With Shell Guidance

Goal:

- confirm `salt-ds migrate` stays canonical-first
- confirm the workflow shows when shared conventions packs should still be
  checked before wrapper or shell choices are finalized

Fixture shape:

- `.salt/stack.json` references a package-backed line-of-business conventions
  pack
- the pack declares approved wrappers or pattern preferences for an app shell
- the migration query resolves to a canonical Salt starter that may still need
  repo-local wrapper or shell confirmation

Expected signals:

- `migrate-apply-conventions-after-canonical` appears in `ruleIds`
- `projectConventionsCheck.checkRecommended` is `true`
- `projectConventionsCheck.sharedPacks` lists the resolved pack
- post-migration verification tells the user to confirm wrappers, shells, or
  migration shims from project conventions before finalizing the migrated code
