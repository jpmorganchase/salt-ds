# Agent docs

Generates Markdown documentation for coding agents from the Salt website source and writes it into each published package's `docs` folder. Consumers point their agent at `node_modules/@salt-ds/core/docs/index.md` (see the [core README](../../packages/core/README.md)). Because the docs ship inside each package, they always match the installed version.

```sh
yarn build:agent-docs            # write packages/*/docs (also run by yarn build)
yarn build:agent-docs --check    # validate without writing
yarn build:agent-docs --verbose  # list warnings and authoring suggestions
```

The generated folders are ignored by Git. Generation replaces a `docs` folder only when its `index.md` carries the generated marker or the folder holds no files, and otherwise fails without writing anything. `scripts/checkPackages.mjs` validates each documentation manifest's schema, package name and version, and checks that its index and every listed page exist. It also checks that Core includes the setup script.

## What it generates

- One page per component: the overview frontmatter and the usage, accessibility and examples tabs merged into one file, in that order so that accessibility guidance comes before the long examples. `PropsTable` becomes a props table (from `react-docgen-typescript`, as on the site), and each `LivePreview` becomes the example's source plus the local files it imports.
- One page per pattern, getting-started, foundations, themes and about page. Pattern examples are one file per example, `site/src/examples/patterns/<pattern>/<Example>.tsx`, as component examples are. Generation fails for a pattern example that the pattern's `index.ts` exports but no page shows.
- Reference lists: every design token (`@salt-ds/theme/docs/tokens.md`), icon (`@salt-ds/icons/docs/icons.md`) and country symbol (`@salt-ds/countries/docs/country-symbols.md`). The token list is too long to read in one go, so `tokens.md` links to a file per tier, or per group for long tiers, split into parts where a group is still too long.
- An `index.md` per package listing every page with its summary and `alsoKnownAs` names, which agents use to find the right page. Agents read these as other names for the same component, so a name that is another page's title, such as `Overlay` for Dialog, is left out with an authoring suggestion, as are repeated spellings. Summaries are shortened so the index fits in one read, and generation warns when an index grows past 20 KB.
- A `manifest.json` per package with `schemaVersion: 1`, package name and version, and the same pages with their `alsoKnownAs` names, for `agents-md.mjs`.
- `@salt-ds/core/docs/agents-md.mjs`, copied from [`src/agents-md.mjs`](./src/agents-md.mjs). Consumers run it to add the Salt block to their `AGENTS.md` and import that from `CLAUDE.md`. The block holds instructions and a compressed index of the docs resolved from the target application: one line per docs folder, with other names in brackets and explicit package versions. `--project` selects the application independently of `--dir`, which selects the instruction-file folder. Setup validates manifests and indexed pages before editing instructions. Clients that load these instructions can discover relevant pages without a separate search, following the approach in [Vercel's agent evaluation](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals). Generation reports the block's size with every package installed and warns past 8 KB (`MAX_AGENTS_BLOCK_BYTES`). The site's [AI coding agents](../../site/docs/getting-started/ai-coding-agents.mdx) page documents client support and setup for consumers.

Props generation uses the repository's TypeScript configuration so cross-package inherited types resolve from source in a clean checkout. Like the website, the tables omit inherited React/native props; the generated instructions direct agents to installed declarations for the complete API.

Token availability follows the imports from `theme.css`, `theme-next.css` and `experimental/salt-interim.css`. A shared source directory does not imply availability in every theme. Tokens outside those import graphs are marked as unavailable from the supported entrypoints; an unresolved import fails generation.

Deprecated tokens show an alias only when every declaration directly references the same characteristic or foundation token. Conflicting references, literal values, calculations and fallbacks suppress the suggestion; the token remains listed as deprecated. The referenced token can still adapt its own values to the selected configuration. Other semantic replacements require migration guidance rather than inference from CSS values.

Links between pages in one package are relative. Links to another package use `@salt-ds/<package>/docs/...`, and links to pages that aren't shipped point to the website. Generation fails for a link to a generated file or heading that doesn't exist; a `Disclosure`'s `id` is kept as an HTML anchor so links to it still work. Headings are slugged with `github-slugger`, as on the site, and a link to a heading in one of a component's tabs points to the same heading in the merged page, even when an earlier tab repeats the heading.

## Long pages

Coding agents read a file from the top a couple of hundred lines at a time and often stop after the first read, and some read a file in one call of limited size. So a page over 200 lines (`MAX_PAGE_LINES` in [`src/config.mjs`](./src/config.mjs)) or 20 KB (`MAX_PAGE_BYTES`) keeps its guidance and moves example source out until it fits:

1. The supporting files of its examples, such as styles and data, are written to `<page>/examples/files/` and linked.
2. Its largest examples move to `<page>/examples/<example>.md`. A component page's examples come after its usage and accessibility guidance, and the first usually shows the basic composition, so it stays on the page if it is at most 100 lines (half of `MAX_PAGE_LINES`), unless the page is still over 20 KB. Other pages, such as patterns, can show an example before their guidance, so all of their examples move.

The page links to each moved example, and each moved example links back. An example shown twice on a page is written once. Supporting files over 8 KB, usually example data, are always written once to `<page>/examples/files/` and linked, as are files that more than one moved example uses and the largest files of an example that is still too long.

Generation warns about a page that is still over 20 KB with its examples moved out, and lists a page still over 200 lines as an authoring suggestion, because only shortening its site pages can fix them.

## Where pages go

Component pages go to the package in their frontmatter (`data.package.name`). If that is missing, the package comes from `sourceCodeUrl` or the parent component. A component page is a `components/**/index.mdx` page that uses the `DetailComponent` layout or declares `data.package`, so technical pages that declare a package go to it. Other sections are assigned in `SECTION_RULES` in [`src/config.mjs`](./src/config.mjs): getting started, patterns and about pages go to `@salt-ds/core`, and foundations and themes pages go to `@salt-ds/theme`. A page in a new section fails generation until you add a rule.

## MDX components

Each MDX component used on the site needs a handler in [`src/mdx.mjs`](./src/mdx.mjs). Generation fails on a component without one, reporting the file and line. When you add a component to the site, add a handler that keeps the information it shows. Unwrap purely presentational wrappers, and link interactive galleries to a reference page.

JavaScript expressions are dropped with a warning, except string literals, literal `QuickLinks` arrays, and the `meta.data.items` list that a section's overview page uses to list the pages below it, which becomes a list of links to those pages. Unsupported dynamic `QuickLinks` data fails generation rather than silently losing navigation. An overview page titled "Overview" is indexed under its sidebar group, such as "Layouts overview".

CI runs `yarn build:agent-docs --check` in the Lint job, so docs changes that would fail generation fail there first.

Warnings (such as a `PropsTable` whose component has no generated props) don't fail generation. A component whose props are all inherited React or native props gets a sentence saying so in place of its table. Authoring suggestions, such as images without alt text or components without `alsoKnownAs`, point to gaps that make the docs less useful to agents and to screen reader users.
