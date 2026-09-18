# Salt Next App Router starter

A standalone Next App Router application using `SaltProviderNext` and the
current Salt theme. The provider and interactive request dialog are narrow
client boundaries; the page content remains a Server Component.

```sh
npm install
npm run dev
```

Validate with `npm run typecheck` and `npm run build`. The source imports only
public package entry points and does not require Storybook, repository aliases,
MCP, or a network connection at runtime.

Repository maintainers validate the complete release-candidate package cohort
from local package archives with:

```sh
yarn build
yarn check:salt-sample-apps -- --app next-app-router
```

The gate runs a production build and server, verifies the initial server HTML,
then exercises hydration, light/dark and density behavior, the request dialog,
keyboard focus, responsive navigation, and axe with post-install networking
blocked.

For an ordinary consumer, install the exact `@salt-ds/cli` version named by the
matching Salt release receipt, then keep the workflow project-local and
offline:

```sh
npx --no-install salt-ds info --json
npx --no-install salt-ds docs button --json
npx --no-install salt-ds context button --json
npx --no-install salt-ds scan . --format pretty --fail-on warning
```

The scanner covers its declared static-analysis surface; it does not replace
the production build, server-render and hydration checks, interaction tests,
authored keyboard checks, or axe. The starter intentionally requires neither
Storybook nor MCP.

To inspect the official agent guidance before manually registering it with a
host, run `npx --no-install salt-ds skill print --kind skill`. The companion
managed block is available with `--kind agents`; review it before copying it
into an `AGENTS.md`. Neither command edits the consumer repository.
