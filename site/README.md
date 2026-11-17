# Salt documentation site

The site uses Mosaic's content pipeline and Next.js App Router. Salt supplies
the layouts, navigation, search UI, MDX component registry and live examples.
The public Salt packages retain their existing React support; React 19 is the
documentation application's runtime.

## Mosaic App Router integration

The documentation site pins Mosaic to the published `1.0.0-beta.99` release,
which includes the App Router integration merged in
[Mosaic #931](https://github.com/jpmorganchase/mosaic/pull/931).

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

Use Node.js 24 or newer, as required by the Mosaic CLI. From the repository
root, install dependencies with `yarn`, then run:

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

Mosaic keys its persistent loader cache by snapshot directory and generation.
Regenerating the content writes a new `mosaic-snapshot.json` identity, so Next's
data cache can survive builds without reusing an older document or shared
configuration. Keep the identity file with the snapshot; the existing server
file trace includes it.

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

## Search

Mosaic generates `search-records.json`, which is copied into `public/`. Salt
downloads it when search first receives focus and uses Mosaic's browser search
engine with the existing ComboBox UI. Search records are independent of page
stores and are not serialized into each page's payload. The release feed is
excluded during record generation.

Salt groups component tabs into one result, prefers the component's overview,
and supports the `colour`/`color` synonym. Matching sections link directly to
their heading. Live authoring refreshes an already loaded index when content
changes.

## Markdown documentation

The same content pipeline produces `/llms.txt` (an index), `/llms-full.txt`
(all documentation) and a Markdown version of each page. Append `.md` to a
documentation URL, for example `/salt/components/button/examples.md`. Legacy
documentation paths such as `/components/button/examples.md` work too.
Ordinary documentation URLs always serve HTML, including when a request sends
`Accept: text/markdown`; distinct Markdown URLs preserve Next's HTML and RSC
cache behavior.

`src/mosaic-plugins/markdownComponents.mjs` includes the actual TSX source for
each `LivePreview` and the generated component props for each `PropsTable`.
Examples link to their source folder for supporting styles and modules. Run
`gen:props` before generating the content; `gen:snapshot` already does this.
The Markdown describes the examples rather than running them, and custom
visual components without a converter retain only their text children.

The handler reads Mosaic's generated files from the current snapshot or the
local content server. No separate copies of Markdown files are kept in
`public/`. The internal release feed is excluded from these documentation
exports, as it is from the public sitemap and search.

`gen:snapshot` verifies that every public sitemap route has generated Markdown
and that both LLM files exist. This check fails the command if a Mosaic plugin
leaves partial output, even when the content CLI itself exits successfully.
