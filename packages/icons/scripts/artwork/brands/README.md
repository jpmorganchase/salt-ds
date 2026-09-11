# Brand artwork sources

`github.svg` is the unchanged `GitHub Logos/SVG/GitHub_Invertocat_Black.svg` from [GitHub's official logo archive](https://brand.github.com/GitHub_Logos.zip), retrieved on 11 September 2026. The GitHub Invertocat is a trademark of GitHub, Inc.

Follow the [GitHub logo guidance](https://brand.github.com/foundations/logo). `brands.mjs` uniformly fits the supplied 98×96 artwork into Salt's square canvas. Both export stages preserve its contours, and `generate:icons` also updates the site's `public/img/github_logo.svg`. Provide the required clear space in the surrounding layout.

Keep the downloaded source SVGs unchanged. The export recipe may fit the mark within its painted bounds when the supplied SVG contains a larger blank presentation artboard, then scale uniformly into the target canvas. This changes framing, not the supplied contours or proportions. Record the source viewBox and selected bounds in the recipe; supply the owner's required clear space in the surrounding layout.

## Figma

`figma.svg` and `figma-color.svg` are unchanged files from [Figma's official logo archive](https://static.figma.com/uploads/4fbf4d754dbbc027ba1530205f8747cd97d532e5), linked from [Using the Figma brand](https://www.figma.com/using-the-figma-brand/), retrieved on 11 September 2026:

- `figma.svg`: `Figma Brand Assets/Figma Icon (Mono-line)/Figma Icon (Mono-line black).svg`.
- `figma-color.svg`: `Figma Brand Assets/Figma Icon (Full-color)/Figma Icon (Full-color).svg`.

Both originals have a `0 0 1024 1280` presentation artboard. The package's `figma` icon and `icon-figma` alias use the supplied monoline filled path with its transparent counters. The site's `public/img/figma_logo.svg` uses the supplied full-color artwork and palette. Fit the visible mark uniformly without redrawing its geometry. Follow the [Figma Brand Book](https://static.figma.com/uploads/6645755656177435f83e10b48d9947645b55a033) when choosing the full-color or monoline variant for the surrounding background.

## Symphony

`symphony.svg` is the unchanged [official Symphony logo SVG](https://symphony.com/wp-content/uploads/2019/06/Symphony_logo-horisontal.svg), linked from the [current Symphony website](https://symphony.com/), retrieved on 11 September 2026. The source viewBox is `0 0 162 29` and both paths use the supplied monochrome gray `#BCBDC2`.

The first path is the wordmark; `brands.mjs` uses the second path, the company S mark, with painted bounds `0 0 20.1102 28.4893`. Preserve that path and fit it uniformly. The [2025 brand refresh](https://symphony.com/insights/blog/symphony-brand-refresh/) introduced separate platform identities, including Symphony Messaging. The package's existing `symphony` name retains the company S identity.

## LinkedIn

`linkedin.svg` preserves the inline SVG and `inbug-blue-14` symbol extracted from [LinkedIn's official downloads page](https://brand.linkedin.com/downloads#inbug-blue-14), retrieved on 11 September 2026. Its source viewBox is `0 0 14 14`. This source comes from the page markup; the downloadable logo ZIP contains PNG files only.

The recipe uses the supplied rounded-square [in] path unchanged. `LinkedinIcon` and `LinkedinSolidIcon` intentionally share this artwork to preserve both public exports without inventing a bare-letter variant. This documented compatibility pair is the exception to the requirement for distinct outline/solid artwork. Follow the [LinkedIn logo guidance](https://brand.linkedin.com/in-logo) for its presentation.

## Stack Overflow

`stackoverflow.svg` is the unchanged [symbol illustration SVG](https://stackoverflow.design/docs/public/brand/logo/symbol.svg) from [Stack Overflow's official logo guide](https://stackoverflow.design/brand/logo), retrieved on 11 September 2026. Its source viewBox is `0 0 966 500`. The recipe selects the supplied mark path and omits the orange presentation-background rectangle, then fits the mark uniformly while preserving its contours.

## Storybook

`storybook.svg` is the unchanged [default icon SVG](https://raw.githubusercontent.com/storybookjs/brand/main/icon/icon-storybook-default.svg) from [Storybook's official brand repository](https://github.com/storybookjs/brand), retrieved on 11 September 2026. Its source viewBox is `0 0 52 64`. The site's `public/img/storybook_logo.svg` uses this exact source, including its supplied pink, white details, and masking; it is a site asset rather than a package icon. The source repository's MIT license is retained in `STORYBOOK-LICENSE.txt`.
