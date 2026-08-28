# Salt operations dashboard

A realistic responsive operations workflow built with public Salt packages. It
demonstrates dashboard navigation, operational metrics, filtering, a data
table, density and light/dark controls, an incident form in a dialog, and
success feedback.

```sh
npm install
npm run dev
```

Use `npm run typecheck` and `npm run build` for local validation. The dashboard
uses the exact Core, Theme, Icons, and Lab candidate versions through public
package entry points. No source file depends on Storybook, repository-only
aliases, MCP, or a network connection at runtime.

Repository maintainers validate the complete release-candidate package cohort
from local package archives with:

```sh
yarn build
yarn check:salt-sample-apps -- --app operations-dashboard
yarn check:salt-sample-apps
```

The gate exercises filtering, light/dark and density behavior, the incident
dialog, keyboard focus, responsive navigation, axe, and the packed scanner with
post-install networking blocked.

For an ordinary consumer, install the exact `@salt-ds/cli` version named by the
matching Salt release receipt, then keep the workflow project-local and
offline:

```sh
npx --no-install salt-ds info --json
npx --no-install salt-ds docs table --json
npx --no-install salt-ds context operations --json
npx --no-install salt-ds scan . --format pretty --fail-on warning
```

The scanner covers its declared static-analysis surface; it does not replace
the production build, interaction tests, authored keyboard checks, or axe. The
dashboard intentionally requires neither Storybook nor MCP.

To inspect the official agent guidance before manually registering it with a
host, run `npx --no-install salt-ds skill print --kind skill`. The companion
managed block is available with `--kind agents`; review it before copying it
into an `AGENTS.md`. Neither command edits the consumer repository.
