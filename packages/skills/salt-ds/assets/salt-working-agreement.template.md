# Salt Working Agreement

Use this file only for durable repo-local decisions that repeatedly change Salt guidance.
Do not duplicate canonical Salt docs here.

## Purpose

- what this repo is optimizing for
- where Salt guidance should stay canonical
- which recurring local decisions should stop being re-litigated

## Durable Repo Decisions

### Approved wrappers
- wrapper name
- what canonical Salt primitive it wraps
- when to use it
- when not to use it
- source docs or code links

### Accepted deviations
- what differs from canonical Salt guidance
- why it is intentional
- when to revisit it

### Host and tooling constraints
- MCP availability
- CLI quirks
- runtime validation constraints
- IDE-specific limitations

### Validation defaults
- when to run review after create
- when runtime evidence is required
- what counts as enough validation for this repo

### Known migration debt
- temporary shims or compatibility decisions that are already understood
- what is mandatory now vs later

## Non-goals
- things intentionally out of scope for now

## Revisit triggers
- version upgrade
- platform migration
- new product surface
- repeated agent confusion
