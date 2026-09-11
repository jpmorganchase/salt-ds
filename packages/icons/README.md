# Icons

The catalogue contains 548 SVGs on a 16×16 canvas, including 183 distinct outline/solid pairs and one LinkedIn compatibility pair. Salt SVG masters use fixed 0.67-unit primary reference strokes and proportional secondary details. The theme gives generated React icons a 1.5-unit primary stroke in high and medium densities and 1 unit in low, touch and mobile densities, configurable through `--salt-size-icon-strokeWidth` or the per-icon `--saltIcon-strokeWidth` override. The component falls back to 1 only when neither variable is defined. Brand logos preserve their owners' supplied geometry; both LinkedIn exports use the same official square mark.

Each ordinary export defaults to a centered 15.5-unit longest painted dimension at primary stroke 1.5, leaving 0.25 units at each end of that axis. Reviewed entries in `scripts/artwork/optical-fits.mjs` can use a smaller span or an optical center offset, with a recorded reason and the same clipping checks. The generator preserves aspect ratios and numeric stroke widths and fits outline and solid exports independently. Exact aliases remain identical. The seven official brand exports and the three full-canvas solid checkmark surface exports retain their existing 16-unit framing.

## Maintain the artwork

Edit the owning recipe in `scripts/artwork`. The alphabetical batches and shared family modules are combined with duplicate-registration checks; aliases are assigned separately. Keep the official sources and licenses in `scripts/artwork/brands` and the shared Open Sans letterforms and license alongside the recipes.

Artwork generation and validation measure painted bounds in installed Google Chrome using the repository's Playwright dependency. Run from the repository root:

```sh
yarn workspace @salt-ds/icons generate:icons
yarn workspace @salt-ds/icons validate:icons
yarn node packages/icons/skills/salt-icons/scripts/check-integration.mjs --repo . new-name
```

Generation updates the tracked SVGs, `scripts/artwork/view-box-transforms.json`, React components, CSS masks, icon lists and site logo assets. Keep those generated outputs with their source changes. Direct edits to `src/SVG` are overwritten by `generate:icons`; use the owning recipe for changes that must survive regeneration. The existing `build:icons` command rebuilds components and masks from the current SVGs only. Final viewBox framing belongs to the generator; do not hand-pad recipes or edit the generated fit manifest.

Validation checks inventory, rendering, fitted occupancy and the selected default or optical center, painted bounds, line weights and exact aliases. It uses the fit manifest to reverse export framing for existing recipe-geometry regressions and checks the final fitted exports separately. Review changed artwork in the site catalogue and Storybook at 12px and 16px on light and dark backgrounds, plus an enlarged view. Use the existing Icons/Icon stories for catalogue and name-search review, Icon QA for size and CSS-mask coverage, and the relevant component examples for legibility in context. The Storybook toolbar selects density and light/dark mode. Check final gaps at the configured width; automated checks do not establish meaning or visual quality.

## Documentation

The Salt site is the source of truth for [using icons](../../site/docs/foundations/assets/index.mdx), [icon design](../../site/docs/foundations/assets/icon-design.mdx), and [creating and integrating icons](../../site/docs/foundations/assets/creating-icons.mdx). The contribution guide covers recipe ownership, registration, search metadata, generation, tests and visual review.

Use the [Salt Icons skill](skills/salt-icons/SKILL.md) to apply that workflow to repository work. The [brand source notes](scripts/artwork/brands/README.md) record official artwork provenance and export choices.
