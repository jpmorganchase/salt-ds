---
name: salt-icons
description: Create, modify, and review Salt Design System SVG icons, including family styling, outline/solid pairs, search synonyms, category registration, generated exports, and release metadata. Use for Salt icon artwork or catalogue integration tasks in a Salt checkout.
---

# Salt icons

Create icons that belong to the existing Salt family and arrive fully integrated into its package and searchable catalogue.

## Start with the canonical site documentation

Work in the active Salt checkout. Locate its root by the presence of `site/docs/foundations/assets/icon-design.mdx` and `packages/icons/scripts/artwork/generate.mjs`; do not infer a new project or create a replacement library. Paths below are relative to that root. The helper script path is relative to this skill folder.

Read `site/docs/foundations/assets/icon-design.mdx` for the visual language and `site/docs/foundations/assets/creating-icons.mdx` for construction, export, registration and validation. These site pages are the source of truth; use the current icon catalogue and its related families as the design authority. Do not duplicate the site’s rules into this skill.

Determine whether the request is creation, modification, metadata maintenance or review. Review-only work stays read-only. For an existing icon, preserve its name and meaning unless the user requested a change. A metadata-only task does not require changing artwork.

## Construct from the closest family

- Inspect the actual SVGs and the effective recipes of the closest related icons. Resolve ambiguous meanings from their artwork and usage, not the filename alone.
- Reuse shared silhouettes and landmarks. Author changes in the owning recipe; the generator rejects duplicate recipe registrations. Keep outline/solid surfaces and retained line geometry consistent with the guide. Preserve the numeric SVG masters' 0.67-unit reference width and secondary ratios; generated React strokes use the configurable width defined in the canonical size foundation.
- Preserve the distinction between construction units, normalized reference geometry, fitted exports and rendered pixels. Follow the canonical contribution page's automatic viewBox fitting workflow; do not hand-pad recipes or force both axes to fill. The generator fits each outline and solid export independently while keeping exact aliases identical and retaining the documented brand and full-canvas surface exceptions.
- Construct contour-following cutouts from the actual foreground paint, including curved offsets and cap corners. Reference-space measurements precede export fitting: check the final scaled gaps at the configured stroke width. Choose local spacing from the family instead of inventing universal radius or gap tokens.
- Use existing vector primitives and letterforms. Raster generation is not the production path for these SVG icons.

## Complete identity and discovery

For a new icon or variant, follow the registration workflow in the Creating icons page. Check each of these surfaces; generation only covers some of them:

| Maintained source                                                           | Required decision                                                                                                                                                                   |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Effective recipe + `scripts/artwork/inventory.json` under the icons package | Register the exact name and requested variants. Keep the inventory sorted and existing aliases intact.                                                                              |
| `site/src/components/icon-preview/salt-icon-synonym.json`                   | Add or update the website search entry: base `iconName`, singular `synonym` array, and website `category`. One base entry covers outline and solid.                                 |
| `packages/icons/README.md` and affected documentation                       | Keep stated catalogue/pair counts and examples accurate when the inventory changes.                                                                                                 |
| `.changeset/*.md`                                                           | Document consumer-facing icon additions or changes following `CONTRIBUTING.md`. Use an appropriate package/release level; documentation-only work does not require an icon release. |

The website synonym catalogue is the maintained source of icon categories and search terms. The generator does not update this metadata. Missing website metadata can place a new icon in the deprecated group.

Choose useful alternative meanings and user vocabulary without diluting the icon's meaning. Keep new search terms lowercase. Check the actual search consumer: it removes whitespace from queries but not stored synonyms, so a spaced phrase alone may not match. Include effective individual terms or a compact alias where needed, and verify representative searches for both available variants. Preserve intentional legacy/deprecation metadata; do not repair unrelated catalogue gaps as a side effect. The historical `scripts/makeSynonym.mjs` overwrites the whole JSON from a separate workbook; do not use it for a targeted edit without that authoritative source.

Generate the SVGs, `scripts/artwork/view-box-transforms.json`, React components, component index, CSS mask classes, story inventory and website icon list through the full package scripts described in Creating icons. Artwork generation and validation require installed Chrome through the repository's Playwright dependency. Keep the generated fit manifest with the SVG outputs; never edit it by hand. Passing a single-file glob to `generateIcons.mjs` rewrites aggregate lists from that subset. Do not hand-edit generated surfaces as the durable source of a new icon. Renames and removals also affect public exports, aliases, usages and deprecation policy; generators do not automatically remove stale files. Keep such changes within the requested scope.

## Verify the result

For artwork or inventory changes, run the contribution page's generation and validation commands, then review the icons in the existing site and Storybook with the repository's Yarn setup. Metadata-only edits need the relevant integration/search checks. Use targeted component tests or type checking when integration code changes. Follow the contribution page's test scope: add behavioral coverage that QA stories do not already provide.

Run the bundled read-only integration checker for the affected base names, using this skill's actual directory:

```sh
node <skill-directory>/scripts/check-integration.mjs --repo <salt-repo-root> <basename> [more-basenames]
```

It checks the requested names' registration, website synonyms and category metadata, and generated surfaces. It does not judge synonym relevance, artwork quality or recipe geometry. Diagnose failures in scope; an intentionally deprecated legacy alias may need explanation rather than new metadata. The repository's artwork validator remains responsible for geometry and known regressions.

Use the site's Icons catalogue for synonym searches and variant filters, and the existing Storybook Icons/Icon and Icon QA stories, including Component Legibility and All Icon View Boxes (`AllIconViewBoxes`), for rendered review. The latter supports actual density-based sizing or fixed 12px/16px/32px/64px, density selection, light/dark backgrounds, stroke controls and name filtering. Storybook name search does not test website synonyms. Set the required display size through the existing controls or the size CSS variable, and confirm the rendered dimensions.

Inspect native 16px and 12px renders on light and dark backgrounds, plus an enlarged view. Compare generated components at their default and selected override widths with the numeric SVG reference, following the canonical contribution page's stroke and clearance guidance. Review both requested variants and affected siblings in components and CSS masks, which retain baked widths. Check meaningful features, transparent counters, final fitted gaps, proportional line weights, centered viewBox occupancy and painted bounds. The validator separately checks raw fitted output and reverses the fit for reference-geometry regressions; passing those checks alone does not establish visual quality. For component legibility corrections, follow the contribution page's before/after review in a real component context.

## Finish with cleanup

Track temporary files created during the task: probe scripts, contact sheets, intermediate renders, browser profiles, logs and test fixtures. Remove those intermediates after validation, or put explicitly requested final comparison previews in a durable output location before cleaning.

Resolve each deletion target and verify it lies within the known task scratch/build directory. Inspect contents before recursive removal and avoid following links into another directory. Do not use a broad Git clean or delete a shared output/cache tree just because it is untracked. Preserve source recipes, current catalogue artwork, generated package exports, final documentation, requested deliverables, user-provided assets and unrelated work.

Report the icon and metadata changes, generated outputs, searches and visual combinations actually inspected, check results, and cleanup performed. Identify any remaining limitation accurately. Creating a local icon does not itself request publishing, deployment, committing or pushing.
