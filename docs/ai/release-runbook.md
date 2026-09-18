# Salt AI release runbook

This is a Plan 003 safety contract, not permission to publish. Plan 001 ends at
the locally verified Unit 07 release-candidate boundary and never activates
this runbook. Until Plan 003 is explicitly activated, every AI package remains
private and the embargo must reject Changesets, versioning, publication, and
deployment.

## Before any release

1. Acquire tracker-bound landed receipts; never accept an untracked local path.
2. Verify the exact selected graph, package versions, tarball/unpacked digests,
   bundle identities, public docs seal, sample cohort, and web bytes.
3. Require a clean protected-branch-reachable commit or immutable approved tag.
4. Select exactly one closed mode and acquire the repository-wide lock.
5. Verify the mode-specific target allowlist and reject cross-mode receipts.
6. Run dry-run pack/install, provenance, readback, rollback drill, and CAS
   preconditions before exposing credentials.

## Closed modes

- `ORDINARY_RELEASE`: non-AI package partition only.
- `SALT_AI_RELEASE`: exact Knowledge/CLI cohort, MCP only on final `ship`, and
  matching AI web.
- `SALT_DOCS_RELEASE`: receipt-selected full-site deployment for the two closed
  discovery operations; it cannot mutate npm, TUF, immutable AI/history bytes,
  or AI pointers.

All use one journal/state machine/global lock. Credentials are mode-scoped.
Version PRs, snapshot jobs, issue comments, and PR-head code have no publish,
deploy, registry, OIDC, or environment authority.

## Rollback and unresolved web boundary

Rollback is a forward, receipt-parented CAS transition. It may change a pointer
or dist-tag only if the observed generation/value equals the receipt's expected
precondition. A stale rollback must fail rather than overwrite a newer value.
Released immutable bytes are never rewritten.

The repository currently has no approved immutable AI storage identifier,
upload command/identity, live readback endpoint, pointer CAS primitive, or
rollback command. Web beta/GA is blocked until the site owner ratifies all five
in an ADR amendment and a protected rehearsal proves stale rollback rejection.
Knowledge/CLI installed bytes must remain fully useful while web is unavailable.

Exact package-version pinning is mandatory. `latest`, nearest, stage-only, or
multiple-active selectors are forbidden.
