# Agent docs

Generates Markdown documentation for coding agents from the Salt website source and writes it into each published package's `docs` folder. Consumers point their agent at `node_modules/@salt-ds/core/docs/index.md` (see the [core README](../../packages/core/README.md)). Because the docs ship inside each package, they always match the installed version.

```sh
yarn build:agent-docs            # write packages/*/docs (also run by yarn build)
yarn build:agent-docs --check    # validate without writing
yarn build:agent-docs --verbose  # list warnings and authoring suggestions
```

The generated folders are ignored by Git. `scripts/checkPackages.mjs` checks that each package listing `docs` in `files` contains `docs/index.md`.

## What it generates

- One page per component: the overview frontmatter and the usage, examples and accessibility tabs merged into one file. `PropsTable` becomes a props table (from `react-docgen-typescript`, as on the site), and each `LivePreview` becomes the example's source plus the local files it imports.
- One page per pattern, getting-started, foundations, themes and about page. A pattern's `LivePreview` names an export of `site/src/examples/patterns/<pattern>/index.tsx`; the page shows that module's source once for all of its examples.
- Reference lists: every design token (`@salt-ds/theme/docs/tokens.md`), icon (`@salt-ds/icons/docs/icons.md`) and country symbol (`@salt-ds/countries/docs/country-symbols.md`).
- An `index.md` per package listing every page with its summary and `alsoKnownAs` names, which agents use to find the right page. Summaries are shortened so the index fits in one read, and generation warns when an index grows past 20 KB.
- `@salt-ds/core/docs/agents-md.mjs`, copied from [`src/agents-md.mjs`](./src/agents-md.mjs). Consumers run it to add the Salt block to their `AGENTS.md` and import that from `CLAUDE.md`. Its block must match the one in the core README, which a test checks.

Links between pages in one package are relative. Links to another package use `@salt-ds/<package>/docs/...`, and links to pages that aren't shipped point to the website.

## Long pages

Many coding agents read a file in one call of limited size, so a page over 20 KB (`MAX_PAGE_BYTES` in [`src/config.mjs`](./src/config.mjs)) moves its largest examples to `<page>/examples/<example>.md` until it fits, keeping the first example on the page when it can. The page links to each moved example, and each moved example links back. Examples of one pattern module move together. Supporting files over 8 KB, usually example data, are always written once to `<page>/examples/files/` and linked, as are files that more than one moved example uses and the largest files of an example that is still too long.

## Where pages go

Component pages go to the package in their frontmatter (`data.package.name`). If that is missing, the package comes from `sourceCodeUrl` or the parent component. Other sections are assigned in `SECTION_RULES` in [`src/config.mjs`](./src/config.mjs): getting started, patterns and about pages go to `@salt-ds/core`, and foundations and themes pages go to `@salt-ds/theme`. A page in a new section fails generation until you add a rule.

## MDX components

Each MDX component used on the site needs a handler in [`src/mdx.mjs`](./src/mdx.mjs). Generation fails on a component without one, reporting the file and line. When you add a component to the site, add a handler that keeps the information it shows. Unwrap purely presentational wrappers, and link interactive galleries to a reference page.

Warnings (such as a `PropsTable` with no props) don't fail generation. Authoring suggestions, such as images without alt text or components without `alsoKnownAs`, point to gaps that make the docs less useful to agents and to screen reader users.
