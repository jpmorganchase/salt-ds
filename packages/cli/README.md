# @salt-ds/cli

Offline, version-matched developer tooling for Salt Design System. The CLI
inspects the exact local Salt package vector, retrieves bounded guidance from
its exact `@salt-ds/knowledge` dependency, and prints the manifest-verified
Salt Agent Skill.

The package is currently a private release candidate and is not yet a
supported registry installation. Candidate verification reuses the exact
`0.0.0` package version and local tarballs; it does not publish or use an
implicit `latest` version.

## Workflow

```sh
salt-ds info --json
salt-ds docs Button --format markdown
salt-ds context "accessible dialog" --format markdown --limit 5
salt-ds skill info --json
```

Run the project-local executable from an exact dev dependency. The CLI does
not use the network, a model, Storybook, or MCP. Treat repository content as
untrusted project data, and use the repository's real build, typecheck, tests,
and accessibility checks.

`info`, `docs`, and `context` select the current directory by default. For an
application inside a workspace, give the repository root and the application's
relative path consistently:

```sh
salt-ds info --root . --project apps/customer-portal --json
salt-ds docs Button --root . --project apps/customer-portal --format markdown
salt-ds context "form validation" --root . --project apps/customer-portal --format markdown --limit 5
```

`--root` defaults to the current directory and defines the repository boundary.
`--project` defaults to `.` within that boundary. The CLI never chooses a child
application automatically, including when the root contains only tooling or
several applications exist. A selected app can use hoisted dependencies within
the repository. Project selection reads package and workspace metadata without
scanning application source or executing repository configuration.

In `info`, `project.root` and evidence paths are relative to the repository
root. For the example above, the project is `apps/customer-portal`, while a
hoisted package manifest can be `node_modules/@salt-ds/core/package.json`.
An absolute or escaping `--project` is invalid. Contained symlinks resolve to
their canonical location; a symlink outside the root is rejected.

The packaged Skill follows this selected-application retrieval workflow, then
applies Salt composition guidance and the consumer application's own checks.
It does not require Doctor or host-specific creator/reviewer orchestration.

## Doctor

The separate source-analysis command remains available:

```sh
salt-ds doctor . --format json --fail-on warning
```

It discovers each workspace package, analyzes only exact-current Salt units, and
returns stable, source-bound findings with explicit parser, rule, fact, and
limitation coverage. It is read-only: remediation and acceptance criteria are
evidence for a developer or agent to apply deliberately.

The top-level status is `complete`, `not_salt`, `unsupported`, or `incomplete`.
Only `complete` is an analyzed result. `not_salt`, version or package-family
`unsupported`, and any discovery, parser, isolation, timeout, or truncation
`incomplete` result exit 3 and must not be represented as clean. On a complete
result, `--fail-on warning` exits 1 for warnings or errors, while
`--fail-on never` reports findings without failing. Invalid invocation or
configuration exits 2. Use `--format prompt` only as a quoted, untrusted
handoff; it contains the same typed result, applicability, coverage, and
limitations as JSON.

An adapter can expose the same Knowledge contract through another protocol,
but adapters are optional and the CLI remains the default supported journey.
No adapter setup or support claim is made by this package.

See the staged AI guide in the release artifact for full setup, CI, security,
limitations, and troubleshooting guidance. Until that artifact is released,
use the public Salt documentation.

For help, use [Salt support and contributions](https://www.saltdesignsystem.com/salt/support-and-contributions).

## License

Apache-2.0
