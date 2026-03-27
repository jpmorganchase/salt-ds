# Install Health Contract

This note describes the shared install-diagnostics contract used by `runtime-inspector-core`, the CLI, and the MCP project context.

## Intent

The install-health model should distinguish three different states:

- genuinely broken install state
  - this should surface as `health: fail`
- dependency drift or duplicate installs
  - this should surface as `health: warn`
- limited inspection
  - this should be explicit in `inspection`, but it should not become `fail` unless Salt has evidence that the install is actually broken

## Contract Rules

- `healthSummary`
  - is for install health, not every inspection limitation
- `inspection`
  - records how Salt inspected the install
  - must include:
    - `packageLayout`
    - `limitations`
    - `manifestOverrideFields`
- `versionHealth`
  - records the concrete declared, resolved, and installed drift facts
- `duplicatePackages`
  - records duplicate `@salt-ds/*` packages by name, version set, and path

## Edge-Case Rules

- Yarn PnP
  - package-manager inspection can succeed even when `require.resolve(.../package.json)` and `node_modules` scanning do not
  - unresolved package paths under PnP are a limitation, not automatic install failure
- Bun
  - Salt currently relies on `node_modules` scanning only
  - expose that as an inspection limitation
- manifest override fields
  - `overrides`, `resolutions`, and `pnpm.overrides` should be surfaced explicitly
  - they should create warning-level drift hints because declared ranges may not match the final installed graph

## Surface Rules

- `doctor`
  - should print the full install picture, including duplicate paths, override fields, and inspection limitations
- `info`
  - should stay concise, but still expose the structured contract in JSON
- MCP project context
  - should mirror the same structured fields in snake_case

## Regression Expectations

When changing install diagnostics, keep coverage for:

- duplicate installed Salt packages
- workspace-root drift
- Yarn PnP limited inspection
- Bun limited inspection
- manifest override field detection

Do not reintroduce transport drift between `doctor`, `info`, and MCP context.
