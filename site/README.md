# Salt documentation site

The site uses Mosaic's content pipeline and Next.js App Router. Salt supplies
the layouts, navigation, search UI, MDX component registry and live examples.
The public Salt packages retain their existing React support; React 19 is the
documentation application's runtime.

## Mosaic integration snapshot

The documentation site pins Mosaic to `0.0.0-snapshot-20261109102658`, published
from commit `d2b7ced5fe82323b892b0dccf0fad3201cfe4d43`.
[Mosaic #893](https://github.com/jpmorganchase/mosaic/pull/893),
[snapshot release run](https://github.com/jpmorganchase/mosaic/actions/runs/42600848142).

For testing future local candidates in a separate verification branch, use the
tarballs produced by the Mosaic snapshot workflow:

```sh
node site/scripts/use-local-mosaic.mjs /path/to/mosaic-snapshot-packages <full-source-commit> <full-snapshot-commit>
yarn install
```

The script pins every Mosaic package to the same candidate, adds temporary file
resolutions for its transitive dependencies and records the version, source
commit, generated snapshot commit and archive SHA-256 hashes in
`site/mosaic-snapshot-manifest.json`.

## Local authoring

From the repository root, install dependencies with `yarn`, then run:

```sh
yarn workspace @salt-ds/site gen:snapshot
yarn workspace @salt-ds/site serve
```

Open <http://localhost:3000/salt/index>. The first command generates the
component API data, CSS data and initial content snapshot. `serve` starts the
Next.js application and Mosaic content server together. Changes to `site/docs`
refresh the current page while keeping the header and reader's theme mounted.

The committed `.env.development` sets the content server to port 8080 and the
site to port 3000. If you change these ports, set `MOSAIC_ACTIVE_MODE_URL` and
`MOSAIC_REVALIDATE_URL` together in an untracked `site/.env.local`. The
`MOSAIC_REVALIDATE_SECRET` must match on the two local servers. The revalidation
and live-refresh endpoints are disabled in production.

The configured sources are the local documentation and the public GitHub
release feed. They do not require a personal access token.

## Preview a content snapshot

```sh
yarn workspace @salt-ds/site gen:snapshot
yarn workspace @salt-ds/site serve:snapshot:file
```

This reads `site/snapshots/latest` without starting the Mosaic content server.
Regenerate the snapshot to include documentation changes.

## Production build

```sh
yarn workspace @salt-ds/site gen:snapshot
yarn workspace @salt-ds/site build
yarn workspace @salt-ds/site start
```

`.env.production` selects the file snapshot. Next.js prerenders the document
routes from Mosaic's sitemap and includes the snapshot in its server file
trace. Existing `/components`, `/getting-started` and
`/support-and-contributions` aliases continue to resolve to the Salt namespace.

## Integration boundaries

- `src/lib/content.ts` calls Mosaic's shared route resolver. Aliases use the
  backing document's configuration and public canonical URL.
- `src/app/[namespace]/[...route]/page.tsx` compiles MDX on the server and emits
  document metadata.
- `src/Body/Body.tsx` renders the compiled content with Salt's existing component
  registry. Live examples and their raw source remain client components.
- `src/app/[namespace]/NamespaceFrame.tsx` keeps Salt's header mounted during
  navigation. Each document has a separate page store so metadata does not leak
  between pages.
- `tsconfig.json` retains the repository source aliases and selects React 19
  types for the site, including imported Salt sources. The repository's library
  checks continue to use their own React type versions.

After generating the component and CSS data, run the site's type check with
`yarn workspace @salt-ds/site typecheck`.
