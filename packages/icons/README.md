# Icons

The catalogue contains 548 SVGs on a 16×16 canvas, including 183 distinct outline/solid pairs and one LinkedIn compatibility pair. Salt symbols use fixed 0.67-unit primary strokes and proportional secondary details. Brand logos preserve their owners' supplied geometry; both LinkedIn exports use the same official square mark.

## Maintain the artwork

Edit the owning recipe in `scripts/artwork`. The alphabetical batches and shared family modules are combined with duplicate-registration checks; aliases are assigned separately. Keep the official sources and licenses in `scripts/artwork/brands` and the shared Open Sans letterforms and license alongside the recipes.

Run from the repository root:

```sh
yarn workspace @salt-ds/icons generate:icons
yarn workspace @salt-ds/icons validate:icons
yarn node packages/icons/skills/salt-icons/scripts/check-integration.mjs --repo . new-name
```

Generation updates the tracked SVGs, React components, CSS masks, icon lists and site logo assets. Keep those generated outputs with their source changes. Direct edits to `src/SVG` are overwritten by `generate:icons`; use the owning recipe for changes that must survive regeneration. The existing `build:icons` command rebuilds components and masks from the current SVGs only.

Validation checks inventory, rendering, painted bounds, line weights and known geometry regressions. Review changed artwork in the site catalogue and Storybook at 12px and 16px on light and dark backgrounds, plus an enlarged view. Automated checks do not establish meaning or visual quality.

## Documentation

The Salt site is the source of truth for [using icons](../../site/docs/foundations/assets/index.mdx), [icon design](../../site/docs/foundations/assets/icon-design.mdx), and [creating and integrating icons](../../site/docs/foundations/assets/creating-icons.mdx). The contribution guide covers recipe ownership, registration, search metadata, generation, tests and visual review.

Use the [Salt Icons skill](skills/salt-icons/SKILL.md) to apply that workflow to repository work. The [brand source notes](scripts/artwork/brands/README.md) record official artwork provenance and export choices.
