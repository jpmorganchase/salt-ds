# TypeScript TurboSnap graph

This internal Vite plugin supplies Storybook's `--stats-json` output with source
dependencies for Chromatic TurboSnap. It follows imports and re-exports using one
TypeScript program, instead of finding references to every variable declaration.

## What the graph tracks

- Runtime imports, including functions, classes, aliases, CSS, dynamic imports,
  and sources outside `tsconfig.include`, such as Storybook's preview.
- Type-only imports, JavaScript JSDoc imports, and inherited types that can affect
  generated docgen metadata even when the bundler removes them.
- The selected export through a barrel, retaining each barrel on the route as an
  input. Unrelated exports remain separate only when the barrel contains only
  import and export statements and its package declares JavaScript
  side-effect-free code.
- Namespace imports, unknown side-effect contracts, and mixed implementation
  modules conservatively include their dependencies.
- Module augmentations, global declarations (including ambient `.d.cts` files),
  and TypeScript configuration files. Global inputs connect to real runtime
  modules through one shared node; connecting that node to Storybook's virtual
  app would interfere with Chromatic's story discovery.

Package manifests are deliberately not graph inputs. Storybook's preview imports
from `@salt-ds/core`, so a manifest node would make every version-only release
bump trace to the preview and force a full rebuild. Chromatic handles dependency
changes through the lockfile. A change to a package's `sideEffects` field alters
which barrel exports are treated as separate, so add the `no turbosnap` label to
pull requests that change it.

The graph uses the existing Storybook stats format: a dependency's `reasons`
identify its importers. It keeps the existing plugin name and
`storybookGetStats()` hook. The plugin does not transform the built JavaScript or
replace Storybook's docgen configuration.

## Project scope and assets

The root TypeScript config excludes generated package output from its initial
roots. Imported files still resolve normally, including files under `__tests__`;
filtering them by directory can hide real preview or story dependencies.

Vite's module hooks do not expose every nested CSS import or referenced font.
The Chromatic workflow therefore guards theme files, AG Grid's `src/css` and
`src/fonts`, and `docs/public` using `externals`. Changes there request a full
visual pass. Extend those guards if new CSS or static dependencies live outside
the protected directories. Ordinary component styles use the dependency graph.

## Validation

Run the focused regression suite with:

```sh
yarn test run tooling/typescript-turbosnap
```

The suite also runs with the repository's unit tests. It uses temporary source
projects and real Vite/docgen builds to check selective barrels, namespace and
cyclic exports, module augmentations, erased types, global inputs, and runtime
fallbacks. Fixture expectations come from their imports and generated metadata,
not from the previous analyzer's output.

For an integration check, run `yarn build-storybook` and inspect the resulting
`storybook-static/preview-stats.json` with Chromatic's tracing tools. A successful
local build and dependency trace do not replace the first remote visual run.
