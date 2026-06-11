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
