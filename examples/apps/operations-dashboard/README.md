# Salt operations dashboard

A realistic responsive operations workflow built with public Salt packages. It
demonstrates dashboard navigation, operational metrics, filtering, a data
table, density and light/dark controls, and a validated incident record form in
a dialog.

The record form keeps its draft in the dashboard host. Cancel closes the dialog
without discarding that draft, so reopening restores it. Submission is a local
demo: every save is delayed for 1.5 seconds, and the first save in an app
session fails once to show the retained-input retry path. It does not contact a
backend or notify responders.

The reusable form accepts a `RecordDraft` with `title` and `service`, plus
`draft`, `onChange`, `onSubmit`, `onCancel`, and a submission state of `idle`,
`pending`, or `failed` with a message. The host owns the draft and submission
state, starts and catches its asynchronous work behind a duplicate-submit ref,
and keeps the draft on cancel. The host also owns the `Dialog` and its header;
the form supplies the dialog content and actions. Replace the local adapter
with the application's service, state, or routing layer when adapting this
form to a real workflow.

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

The gate exercises filtering, light/dark and density behavior, record-form
validation, pending and retry behavior, keyboard focus, responsive navigation,
axe, and the packed application with post-install networking blocked.

For an ordinary consumer, install the exact `@salt-ds/cli` version named by the
matching Salt release receipt, then keep the workflow project-local and
offline:

```sh
npx --no-install salt-ds info --json
npx --no-install salt-ds docs button --format json
npx --no-install salt-ds context operations --format json --limit 5
```

The selection flags are optional: `--root <repo>` selects a repository
authority and `--project <relative-workspace>` selects one application within
it. Omit both when the current directory is the intended application.

The dashboard intentionally requires neither Storybook nor MCP. To inspect the
official agent guidance before manually registering it with a host, run
`npx --no-install salt-ds skill print --kind skill`. The companion managed block
is available with `--kind agents`; review it before copying it into an
`AGENTS.md`. Neither command edits the consumer repository.
