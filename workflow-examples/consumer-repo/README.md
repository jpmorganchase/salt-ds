# Consumer package/release fixture

This directory is an external-consumer fixture for Salt package and release
verification. It is intentionally small and policy-heavy; it is not a public
starter application. Use the runnable applications under `examples/apps/` and
the [Developing with Salt](../../site/docs/getting-started/developing.mdx) guide
for consumer setup.

Node 22 or newer and Corepack are required. From a standalone copy, run:

```sh
corepack yarn install --immutable
corepack yarn ui:verify
```

The fixture pins public registry versions and carries its own lockfile and
TypeScript configuration. Salt's release smoke test copies it to an isolated
directory and may substitute an exact locally packed pre-release artifact for
internal verification. That substitution is not a supported installation path.

## Contents

- `package.json` and `yarn.lock` define the standalone consumer dependency tree.
- `src/theme/ConsumerBrandProvider.tsx` deliberately exercises the legacy
  provider exported by this fixture's pinned, already released package cohort.
  New applications should use the current provider shown in the public guide.
- `src/components/AppButton.tsx` is a transparent wrapper used only to compile
  a consumer-owned public-API composition. It adds no analytics or defaults.
- `.salt/team.json` contains optional repository conventions whose claims must
  match checked-in implementations.
- `AGENTS.md` is a repository-owned workflow note, not package documentation.
- `mcp.config.example.json` is retained solely as an unreleased package-test
  fixture. Consumers must not copy it or install the named pre-release package.

## Boundaries

- Use only released Salt packages and public entry points in application code.
- Keep canonical Salt guidance separate from optional repository policy.
- Do not claim wrapper behavior that the wrapper and its tests do not implement.
- Do not treat this fixture as an AI tooling, starter-app or support guide.
- Use the public [support and contributions](../../site/docs/support-and-contributions/index.mdx)
  page for feedback or help.
