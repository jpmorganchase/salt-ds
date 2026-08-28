# Salt Vite starter

A small, standalone Vite application using Salt's current theme and provider.
It includes responsive navigation, a form, density and color-mode controls, a
dialog, and success feedback.

```sh
npm install
npm run dev
```

Run `npm run typecheck` and `npm run build` before shipping. This application
uses only published package entry points; it does not depend on Storybook,
repository aliases, MCP, or a network connection at runtime.

Repository maintainers validate the complete release-candidate package cohort
from local package archives with:

```sh
yarn build
yarn check:salt-sample-apps -- --app vite-starter
```

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
the production build, interaction tests, authored keyboard checks, or axe. The
starter intentionally requires neither Storybook nor MCP.

To inspect the official agent guidance before manually registering it with a
host, run `npx --no-install salt-ds skill print --kind skill`. The companion
managed block is available with `--kind agents`; review it before copying it
into an `AGENTS.md`. Neither command edits the consumer repository.
