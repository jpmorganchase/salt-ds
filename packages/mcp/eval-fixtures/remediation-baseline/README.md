# AI/MCP remediation baseline

This fixture set preserves the reviewed pre-redesign surface at
`f0f6d86db9a5f7b6db434e2b0be4e6d3f57f4f4b`.

`scenarios.json` is the preregistered deterministic capture matrix. It distinguishes:

- transport success;
- schema/envelope success;
- whether the intended reproduction was observed;
- semantic task success.

A reproduction can pass while semantic task success is false. Create and migration
captures that do not produce and verify a real consumer artifact are explicitly
`not_evaluated`; they are not product successes.

This directory is immutable historical evidence, not an executable compatibility
harness. The Phase 0 replay script was retired in Phase 2 so the repository no
longer carries executable SDK-v1 or private-workflow code. A current static
integrity test verifies the committed scenario matrix, package, lockfile,
historical offline guard, and all 15 capture hashes and byte counts without
loading the retired protocol.

Dependency download can use the npm registry or a populated npm cache, but package
versions and integrity values are fixed by `artifacts/replay-package-lock.json`. The exact
tarball is committed at
`artifacts/salt-ds-mcp-f0f6d86.tgz` and is bound to SHA-256
`dd3b3bd1af3ccc55a21afbcd1e844cc1d4ee31b80bce5b2caa900329ddbb8f59`.
The historical offline guard is also committed because its ESM bypass is one of the
negative baseline cases; it is fixture data, not a current security control.

The original captures include exact protocol frames and bounded measurements.
Ephemeral temporary-root paths are normalized to `<TEMP_ROOT>` in those committed
files; the manifest records that transformation.

Source recapture is intentionally unavailable from the redesigned checkout.
Reproducing the retired runtime behavior requires a separately isolated archival
worktree at the reviewed commit; it must not restore SDK-v1 or workflow code to
the current package.

Agent edits and user corrections are recorded as unavailable unless they came from a
real host task. Synthetic scorer results are not promoted into this baseline.

The scoring rubric and exact human-readable measurements are recorded in
`plans/AI_MCP_PHASE0_BASELINE.md`. A passed reproduction assertion means the reviewed
behavior was observed; it does not turn a semantic failure into a success.
