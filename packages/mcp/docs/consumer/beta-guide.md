# Salt Beta Notes

The AI tooling is experimental. This file is only for program-specific beta notes.

For normal setup and workflow guidance, start with:

- [`site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)

Most teams should be able to stay on that page for normal use.

## Beta Scope

- this beta uses a branch-snapshot skill install source
- `salt-ds` is still the product teams use
- MCP is the preferred transport underneath
- the CLI is the published fallback and support path when MCP is blocked

Do not treat this beta as two separate consumer workflows.

## When To Open Other Docs

Only leave the main AI page when you need:

- troubleshooting
  - [`troubleshooting.md`](./troubleshooting.md)
- advanced project conventions
  - [`consuming-project-conventions.md`](./consuming-project-conventions.md)
- support or runtime debugging
  - [`consumer-repo-setup.md`](./consumer-repo-setup.md)

## Selected-Team Shared Conventions Packs

Only selected teams need this path.

If your organization is testing shared conventions packs during beta, use:

- [`consuming-project-conventions.md`](./consuming-project-conventions.md)

The default model still stays:

- `salt-ds`
- `.salt/team.json`
- MCP when available
- CLI only as fallback/support

## First Debug Move

If something feels off, start with:

```sh
salt-ds info . --json
```

Then use:

- `salt-ds doctor`
- `salt-ds review`
- `salt-ds review --url <url>`

only as needed.

## Feedback To Capture

Please note:

- where setup was confusing
- when MCP-blocked usage felt meaningfully different
- whether `.salt/team.json` was enough for normal repo policy
- whether shared conventions packs materially improved review, migration, or upgrade work
