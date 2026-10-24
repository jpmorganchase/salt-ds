# Agent docs

Generates Markdown documentation for coding agents from the Salt website source and writes it into each published package's `docs` folder. Consumers point their agent at `node_modules/@salt-ds/core/docs/index.md` (see the [core README](../../packages/core/README.md)). Because the docs ship inside each package, they always match the installed version.

```sh
yarn build:agent-docs            # write packages/*/docs (also run by yarn build)
yarn build:agent-docs --check    # validate without writing
yarn build:agent-docs --verbose  # list warnings and authoring suggestions
```

The generated folders are ignored by Git. Generation replaces a `docs` folder only when its `index.md` carries the generated marker or the folder holds no files, and otherwise fails without writing anything. `scripts/checkPackages.mjs` validates the schema, package name and version of each package's documentation manifest and `salt-check.json`, and checks that its index and every listed page exist.

## What it generates

- One page per component: the overview frontmatter and the usage, accessibility and examples tabs merged into one file, in that order so that accessibility guidance comes before the long examples. `PropsTable` becomes a props table (from `react-docgen-typescript`, as on the site), and each `LivePreview` becomes the example's source plus the local files it imports.
- One page per pattern, getting-started, foundations, themes and about page. Pattern examples are one file per example, `site/src/examples/patterns/<pattern>/<Example>.tsx`, as component examples are. Generation fails for a pattern example that the pattern's `index.ts` exports but no page shows.
- Reference lists: every design token (`@salt-ds/theme/docs/tokens.md`), icon (`@salt-ds/icons/docs/icons.md`) and country symbol (`@salt-ds/countries/docs/country-symbols.md`). The token list is too long to read in one go, so `tokens.md` links to a file per tier, or per group for long tiers, split into parts where a group is still too long.
- An `index.md` per package listing every page with its summary and `alsoKnownAs` names, which agents use to find the right page. Agents read these as other names for the same component, so a name that is another page's title, such as `Overlay` for Dialog, is left out with an authoring suggestion, as are repeated spellings. Summaries are shortened so the index fits in one read, and generation warns when an index grows past 20 KB.
- A `manifest.json` per package with `schemaVersion: 1`, package name and version, and the same pages with their `alsoKnownAs` names, for `salt-ds init`.
- A `salt-check.json` per package with the data `salt-ds check` reads; see [salt-check](#salt-check).

Consumers run `salt-ds init`, from [`@salt-ds/cli`](../../packages/cli) ([`lib/agents-md.mjs`](../../packages/cli/lib/agents-md.mjs)), to add a Salt block built from the manifests to their `AGENTS.md` and import that from `CLAUDE.md`. With `--copilot`, it also adds the block to `.github/copilot-instructions.md` in the Git repository holding `--dir` (or in `--dir` outside a repository), with index paths relative to the repository root, because Copilot reads that file from the root and may not tell the model where it is. The block holds instructions and a compressed index of the docs resolved from the target application: one line per docs folder, with other names in brackets. It leaves out package versions, so that the block, which projects commit, changes only when the installed packages' pages do; each page states its package version. `--project` selects the application independently of `--dir`, which selects the instruction-file folder. Setup validates manifests and indexed pages before editing instructions. Clients that load these instructions can discover relevant pages without a separate search, following the approach in [Vercel's agent evaluation](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals). Generation reports the block's size with every package installed and warns past 8 KB (`MAX_AGENTS_BLOCK_BYTES`). The site's [AI coding agents](../../site/docs/getting-started/ai-coding-agents.mdx) page documents client support and setup for consumers.

Props generation uses the repository's TypeScript configuration so cross-package inherited types resolve from source in a clean checkout. Like the website, the tables omit inherited React/native props; the generated instructions direct agents to installed declarations for the complete API.

Token availability follows the imports from `theme.css`, `theme-next.css` and `experimental/salt-interim.css`. A shared source directory does not imply availability in every theme. Tokens outside those import graphs are marked as unavailable from the supported entrypoints; an unresolved import fails generation.

A deprecated token shows the token to use instead, from the first of these that names one: a comment after its declaration in the theme CSS, such as `/* Use --salt-container-bold-borderColor */`; the newest table in the theme changelog whose second column is a replacement, where a cell of tokens joined by "or" lists alternatives; or an alias, when every declaration directly references the same token. A replacement that is itself deprecated is followed to a current token, and only characteristic and foundation tokens are shown. Generation warns about a theme CSS comment that names something else, or different tokens in different themes; the changelog records past releases, so it can't be corrected and isn't reported. Literal values, calculations and fallbacks don't count as aliases. Other semantic replacements require migration guidance rather than inference from CSS values.

Palette tokens are listed as not for direct use, except in a palette group that no characteristic token references, such as the corner tokens that Salt's components use for border radius, which is marked.

Links between pages in one package are relative. Links to another package use `@salt-ds/<package>/docs/...`, and links to pages that aren't shipped point to the website. Generation fails for a link to a generated file or heading that doesn't exist; a `Disclosure`'s `id` is kept as an HTML anchor so links to it still work. Headings are slugged with `github-slugger`, as on the site, and a link to a heading in one of a component's tabs points to the same heading in the merged page, even when an earlier tab repeats the heading.

## salt-check

`salt-ds check`, from [`@salt-ds/cli`](../../packages/cli) ([`lib/salt-check.mjs`](../../packages/cli/lib/salt-check.mjs)), checks an application's Salt usage against the docs of its installed packages. The `AGENTS.md` block tells agents to run it before they finish, as `npx @salt-ds/cli check --changed`, when Core ships check data; otherwise the block tells them to check props and tokens by hand. Each documented package ships the data it reads as `docs/salt-check.json`, so the results match the installed versions whichever CLI version runs. The data has a `schemaVersion`, and a CLI that reads an older schema skips that package with a notice to upgrade:

- `@salt-ds/theme`: every token, whether it's current, deprecated in every theme that declares it (with its replacements) or a palette token that characteristics use, and the token reference page that lists it.
- Component packages: each component's docs page, its deprecated props with their deprecation text (from every component the props parser finds), and its required parts.

It reports, as `file:line:col: severity rule: message. See <page>`:

- Errors: deprecated tokens, with their replacements; names that aren't tokens, with the token they spell in kebab case or a current token one segment away; and deprecated props.
- Warnings: palette tokens outside the groups no characteristic references, and a component used without a required part, when its children in that file are all known (no variables or components other than Salt's that could hold the part).

Required parts are reviewed by hand in `REQUIRED_PARTS` in [`src/config.mjs`](./src/config.mjs), from the candidates [`src/parts.mjs`](./src/parts.mjs) finds: parts that every site example of a component nests inside it. Candidates that are optional or parents go in `OPTIONAL_PARTS`; generation lists any new candidate as an authoring suggestion.

Token declarations (an application's own overrides), comments and names built at runtime (`` `--salt-palette-${hue}` ``) aren't reported. Props and parts need the application's `typescript` package to parse JSX; without it, those checks are skipped with a notice. It exits with 1 for errors, and 2 when it can't run or finds no files to check. `--json` prints the results as JSON.

`salt-ds init --script <name>` also makes a `package.json` script end by running `salt-ds check`, so the check runs in CI and for agents that run the project's scripts without loading `AGENTS.md`.

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
