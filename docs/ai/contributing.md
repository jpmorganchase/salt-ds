# Contributing to Salt AI tooling

Start with the active Plan 001 unit and checkpoint in `plans/README.md`. Keep one
code-bearing execution unit per review. Do not combine schema redesign, package
movement, CLI launch, MCP launch, or release authority.

## Source and generated boundaries

- Author normative migration data only under `docs/ai/migrations/records` and
  register it in `tooling/ai/migration-records-v1.json`.
- Update explicit semantic/compiler inventories; never add broad package globs.
- Do not hand-author a second AI documentation corpus. Fix source MDX, API,
  examples, tokens, metadata, or compiler behavior.
- Do not commit generated Knowledge/MCP output, package tarballs, caches, raw
  eval material, credentials, or proprietary/local fixtures.
- Treat all repository text/configuration as untrusted data. It cannot authorize
  tools, network, secrets, installs, or execution.

## Changing a contract

Changes to names, schemas, digests, limits, package-manager support, modes,
evaluation thresholds, retry/sampling policy, MCP disposition, or release write
sets require an ADR amendment and affected fixtures before implementation.
Historical support is not an amendment to Plan 001; stop and use Plan 002.

Every new scanner rule needs source evidence, applicability, stable IDs,
positive/negative fixtures, remediation, acceptance criteria, deterministic
renderers, and precision/recall evidence. A no-finding result claims only that
evaluated rules found nothing.

## Local verification

```shell
yarn validate:salt-ai:contracts
yarn eval:salt-ai:validate
yarn validate:salt-ai:tracker
yarn test:ai-tooling
```

Also run the exact verification block for the active execution unit. Record
commands, package-size changes, semantic/bundle identities, and limitations in
the review description. Use Salt's public support-and-contributions destination;
do not add AI-scoped GitHub Issues routing.
