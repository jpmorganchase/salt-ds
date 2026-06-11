# `salt-ds review` in CI

`salt-ds review` is a primitive. It does one thing: it reviews a list of paths
against Salt DS guidance and exits non-zero when it finds something blocking.
That includes:

- accessibility, composition, or registry validation findings the source review
  pipeline already surfaces, and
- `require_human_review_for` matches from `.salt/team.json` — each surfaces as
  an ordinary error finding with `rule_id: policy.require_human_review_for.<kind>`
  (or `.unspecified` when the rule does not declare a `kind`).

Exit codes follow the standard Salt workflow contract: `0` clean, `10` partial,
`20` blocked, `30` failed / error. CI just needs to fail the job on non-zero.

## Composing the CLI into a required check

The CLI does not run `git diff`, does not know which files changed in a PR, and
does not know your bypass model. Your CI does. Pipe the diff into the CLI:

### GitHub Actions

```yaml
name: Salt Review
on:
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  salt-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run salt-ds review on changed files
        env:
          BASE_SHA: ${{ github.event.pull_request.base.sha }}
        run: |
          git diff --name-only --diff-filter=ACMR "$BASE_SHA" -- \
            '*.ts' '*.tsx' '*.js' '*.jsx' '*.mdx' |
            xargs -r npx --yes salt-ds review --json
```

Mark the job as required in **Settings → Branches → Branch protection** to make
it block merges.

### GitLab CI

```yaml
salt-review:
  stage: test
  image: node:lts
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  script:
    - |
      git diff --name-only --diff-filter=ACMR "$CI_MERGE_REQUEST_DIFF_BASE_SHA" -- \
        '*.ts' '*.tsx' '*.js' '*.jsx' '*.mdx' |
        xargs -r npx --yes salt-ds review --json
```

Mark the job as a required pipeline check in **Settings → Merge requests** or
**Settings → Repository → Push Rules** to make it block merges.

## Bypass

If your org needs a manual override (e.g. "this change has been signed off and
should not be blocked by the Salt review job"), gate the job in your CI config
using whatever your repo already does — PR labels, CODEOWNERS approval,
branch-protection bypass rules, `if:` conditions in the workflow file, manual
job approval in GitLab, and so on. The CLI deliberately has no opinion on
labels, env vars, or vendor-specific bypass mechanisms; that responsibility
stays in your CI configuration where the rest of your release policy lives.

## Provenance attestations

`salt-ds review --hook --emit-attestation` emits a `SaltAttestationV1` payload
(salt-ds.dev/schemas/attestation/v1) as one NDJSON line on stdout after a clean
PostToolUse review. The payload captures the registry identity, the per-file
SHA-256 content hash, the review verdict, an opaque trace id, and a UTC
timestamp.

`salt-ds review --verify-attestations` reads payloads back from stdin (one per
line), validates each against the published Zod schema, re-hashes the
`files_touched` entries, and exits non-zero on drift. Use it standalone or from
a Stop hook.

Salt owns the **payload**. Consumers own the audit store, the storage format,
the retention policy, the GC story, and the bypass model. The CLI does not pick
a hashing algorithm in the contract — each payload carries `hash_alg` so
consumers can upgrade independently.

### Compose attestations into your audit store

Whatever store you already operate, the pattern is the same: pipe the emit
output in, pipe the same lines back into verify.

```yaml
# Sketch — adapt to whatever runner / vendor / store your repo uses
- name: Emit attestations during the agent loop
  run: |
    # Your agent / hook runner pipes stdout from the PostToolUse hook to
    # wherever you already store audit lines (git notes, signed commits,
    # check-API payloads, SIEM, internal audit log, a plain file).

- name: Verify attestations against current file state
  run: |
    # Whatever produced the lines pipes them back into verify.
    cat /path/to/your/store | npx --yes salt-ds review --verify-attestations
```

`salt-ds review --verify-attestations <path>` is a convenience for the
`workflow-examples/consumer-repo` demo and is equivalent to
`< <path>`; in production composition, prefer the stdin pipe so the CLI never
needs to know your store layout.
