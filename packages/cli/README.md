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

An adapter can expose the same Knowledge contract through another protocol,
but adapters are optional and the CLI remains the default supported journey.
No adapter setup or support claim is made by this package.

See the staged AI guide in the release artifact for full setup, CI, security,
limitations, and troubleshooting guidance. Until that artifact is released,
use the public Salt documentation.

For help, use [Salt support and contributions](https://www.saltdesignsystem.com/salt/support-and-contributions).

## License

Apache-2.0
