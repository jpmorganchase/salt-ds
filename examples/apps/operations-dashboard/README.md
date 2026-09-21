# Salt operations dashboard

A complete local service-operations journey built with public Salt packages:
navigate between services and incidents, filter the service table, inspect an
incident, and create or edit its record. The dashboard includes light/dark and
density controls, keyboard navigation, and a narrow layout with a contained
horizontal table region.

All data is an in-memory fixture. Loading, refresh failures and save failures
are deliberate local simulations; the application makes no runtime network
requests, persists no data, and sends no notifications.

```sh
npm install
npm run dev
```

Use `npm run typecheck` and `npm run build` for local validation. This example
uses the exact Core, Theme, Icons and Lab versions in its package manifest.
It has no Storybook, repository-only source alias or MCP prerequisite.

## Try the journey

1. Filter services with `Risk`, then try a term with no matches. Clearing the
   filter restores the full service list.
2. Inspect a service or select an incident from the incident worklist. Edit its
   title or affected service/process. Close and reopen the same record to see
   the retained draft.
3. Submit an invalid title to inspect validation and focus movement. A valid
   first save waits 1.5 seconds and fails once per app session; retry saves the
   record without losing its values. Pending saves prevent duplicate submission
   and dialog closure.
4. Create another incident. Each created record has its own identity and can be
   selected independently. A successful create starts a fresh draft for the
   next record; closing preserves an unfinished draft.
5. Refresh the worklist. The first refresh fails while the existing data remains
   available; retry restores the ready state. Use the labelled local demo
   controls to inspect the distinct empty-data state.

## Adapt the reusable pieces

`src/workflows/service-worklist/recipe.json` declares the complete application
files and canonical guidance. Its runnable entry is `src/main.tsx`.
`IncidentWorklist`, `IncidentInspector`, their types and imported
`ServiceWorklist.css`, and `RecordForm` with its stylesheet are reusable. Keep
those styles with the components when adapting them; they include the narrow
table's contained scrolling. The two local adapters contain the fixture data
and failure simulation.

`OperationsDashboard` owns the service/incident collections, query, selected
incident ID and asynchronous state. It keeps an unfinished create draft and a
separate edit draft for each incident. Selection uses the incident ID so changing
an affected service does not lose the selected record. Closing the editor or
changing the selection keeps these drafts in memory; a successful save clears
the corresponding draft. Reloading the demo or unmounting the dashboard clears
all drafts.

`RecordForm` accepts `draft`, `onChange`, `onSubmit`, `onCancel`, and a submission
state of `idle`, `pending`, or `failed` with a message. The `onCancel` callback
handles the draft-preserving Close action in this example. The host owns the `Dialog`
and header; the form supplies its content and actions. `formLabel` and
`submitLabel` distinguish creating from editing.

Replace the local adapters with the application's existing data services. Keep
its provider, routing and state conventions; wire the component callbacks to
those existing seams. The worklist's loading/ready/refreshing/error state is
separate from form submission. No-data and no-match views derive from records
and the query. The host supplies empty-data simulation controls through the
optional `localDemoControls` slot; omit it for an ordinary application.
The example does not establish support for concurrent editing,
persistence, authorization, localization or production-scale datasets.

## Retrieve the same material

The AI packages are an unpublished local candidate. In an authorized preview
with the matching CLI and Knowledge packages already installed, use the
project-local executable:

```sh
npx --no-install salt-ds info --json
npx --no-install salt-ds context "service worklist with filtering and failure recovery" --format markdown --limit 5
npx --no-install salt-ds docs record:guide:operations-dashboard.service-worklist --format markdown
npx --no-install salt-ds docs record:guide:guide.button.loading --format markdown
```

For an app inside a workspace, use `--root <repo>` and
`--project <relative-app-path>` consistently. Omit both when the current
directory is the application. Follow returned section and file references for
the specific change; the recipe contains the complete reconstruction inventory.
The local website preview is on `/salt/patterns/analytical-dashboard` and offers
the same guidance, recipe, source files and copyable context.

To inspect the bundled agent instructions, run
`npx --no-install salt-ds skill print --kind skill`. Review those instructions
before manually registering them with an agent host. The companion `AGENTS.md`
block is available with `--kind agents`; neither command edits the repository.

## Maintainer verification

The owner named in the recipe reviews affected behavior when dependencies,
public APIs, tokens, interaction states or accessibility behavior change.
Use focused checks for routine edits and the installed-package gate below at
integration checkpoints or when package/setup contracts change.

```sh
yarn build:ai-tooling
yarn check:salt-sample-apps -- --app operations-dashboard
```

The sample-app gate reconstructs the application from the locally packed
recipe, installs the exact candidate cohort in its temporary fixture, and runs
type/build and browser checks with post-install networking blocked. Its shared
assertions reject deliberate removal of form validation and worklist failure
recovery. The complete authoring/build path is in
[the contributor guide](../../../docs/ai/contributing.md).

Readiness remains **runnable**. Automated acceptance supports the stated local
scope; independent maintainer, owner/design and manual accessibility reviews
remain required before workflow promotion.
