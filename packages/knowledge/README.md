# @salt-ds/knowledge

Version-matched, offline Salt Design System knowledge for developer tooling.
This package contains the signed-off manifest, normalized records, Markdown,
examples, compatibility data, and the manifest-selected Salt Agent Skill used
by `@salt-ds/cli`.

The package is currently a private release candidate. It is packed and tested
at the exact version in its manifest; it is not yet a supported registry
installation. When released, the CLI-first path is to install an exact
`@salt-ds/cli` version and let its exact dependency select the matching
Knowledge bundle.

## Runtime boundary

- Reads are local and deterministic. The package does not use the network, a
  model, Storybook, or MCP.
- `manifest.json` is the authority for bundle identity, compatibility,
  artifacts, and applicability.
- Consumers must respect partial coverage and incompatibility results rather
  than treating the corpus as universally applicable.
- The CLI is the default interface. Protocol adapters are optional,
  separately evaluated extensions and do not change the Knowledge contract.

See the staged AI guide in the release artifact for `info`, retrieval, build,
CI, security, limitations, and troubleshooting workflows. Until that
artifact is released, use the public Salt component and pattern documentation.

For help, use [Salt support and contributions](https://www.saltdesignsystem.com/salt/support-and-contributions).

## License

Apache-2.0
