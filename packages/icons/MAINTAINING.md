# Maintaining Salt icons

This repository guide is for contributors implementing and validating SVG artwork. Start with [Icon design](../../site/docs/foundations/assets/icon-design.mdx) for the design standard and [Creating icons](../../site/docs/foundations/assets/creating-icons.mdx) for the design workflow. The public design standard takes precedence over historical examples and review records.

Use this reference for recipe ownership, construction helpers, export framing, metadata, generation and evidence requirements. It describes tooling coverage separately from visual approval; a passing validator does not certify recognition or every corner in the catalogue.

## Contents

- [Construct the artwork](#construct-the-artwork)
- [Fit exports and preserve shared landmarks](#fit-every-export-to-the-viewbox)
- [Construct transparent cutouts](#construct-transparent-cutouts)
- [Find the effective recipe](#find-the-effective-recipe-before-editing)
- [Register artwork and search metadata](#add-and-integrate-a-new-icon)
- [Run checks and record review coverage](#commands-and-acceptance)

## Preserve official brand artwork

For brand logos, follow the [brand-logo exception](../../site/docs/foundations/assets/icon-design.mdx#brand-logos). Start from the owner's current official artwork and preserve its contours and aspect ratio. Use uniform scaling to fit the export canvas; do not apply Salt restyling or strokes, substitute Salt lettering, or create variants the owner has not supplied. The existing LinkedIn outline described below is a specific Salt presentation exception.

Keep the downloaded source SVG unchanged. When it includes a larger blank presentation artboard, the export recipe may fit the visible mark within its painted bounds before scaling uniformly into the target canvas. This adjusts framing while preserving the supplied geometry. Record the source viewBox and selected bounds in the recipe, and provide the owner's required clear space in the surrounding layout.

Record the official source beside the owning recipe so future updates can be checked against it. For GitHub, use the [official logo files and guidance](https://brand.github.com/foundations/logo), with black or white as the default and grey or green only in the owner's specified cases. Provide the required clear space—25% of the logo's width on each side—in the interface layout, rather than treating it as mandatory padding inside every SVG viewBox.

The GitHub implementation keeps the [official source SVG](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/brands/github.svg) unchanged. [brands.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/brands.mjs) fits it uniformly, and both generation stages preserve its contours. Running `yarn workspace @salt-ds/icons generate:icons` also synchronizes [the site's GitHub asset](https://github.com/jpmorganchase/salt-ds/blob/main/site/public/img/github_logo.svg), using the same 16-unit path at a 14px display size.

Figma's [official brand assets](https://www.figma.com/using-the-figma-brand/) supply both full-color and monoline icons. The package's `figma` and `icon-figma` exports use the supplied monoline filled path, including its transparent counters; the site's `figma_logo.svg` uses the supplied full-color artwork and palette. Both source SVGs have a `0 0 1024 1280` presentation artboard, so fit the visible mark without changing its contours. Follow the [Figma Brand Book](https://static.figma.com/uploads/6645755656177435f83e10b48d9947645b55a033) when selecting a variant for its background.

Symphony's [official monochrome logo](https://symphony.com/wp-content/uploads/2019/06/Symphony_logo-horisontal.svg) contains a wordmark and a separate company S path. The `symphony` export uses that S path unchanged, fitted uniformly within the icon canvas. Preserve the company identity: the [2025 refresh](https://symphony.com/insights/blog/symphony-brand-refresh/) introduced a distinct Symphony Messaging product mark.

LinkedIn's source is the inline `inbug-blue-14` symbol on its [official downloads page](https://brand.linkedin.com/downloads#inbug-blue-14), rather than a file from the PNG-only logo ZIP. `LinkedinSolidIcon` retains the supplied rounded-square [in] mark. `LinkedinIcon` is a custom Salt presentation of its original “in” letter contours without the square. Preserve their size and position in the shared 16-unit frame and keep the source SVG unchanged. This bare-letter treatment is a specific Salt exception, not an owner-supplied variant.

Stack Overflow's [official symbol illustration](https://stackoverflow.design/docs/public/brand/logo/symbol.svg) contains the mark path on an orange presentation rectangle. The recipe uses that path unchanged, omits the presentation background, and fits the mark uniformly within the icon canvas.

The site's `storybook_logo.svg` uses the exact default SVG from [Storybook's official brand repository](https://github.com/storybookjs/brand), preserving the supplied colors, white details, and masking. Keep it as a site asset. The [brand source notes](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/brands/README.md) record the downloaded files, source links, and retained license.

## Construct the artwork

Follow the public [stroke hierarchy](../../site/docs/foundations/assets/icon-design.mdx#stroke-weight): adjust spacing, placement or nonessential detail before thinning an identifying mark. Dashboard's ticks retain primary weight and match the inverse needle counter; detachment from the rim does not make them secondary. For simulated text, follow [painted bars and inverse slots](../../site/docs/foundations/assets/icon-design.mdx#text-lines-and-inverse-openings). These are painted-boundary decisions, not exceptions based on an icon's name.

Start from the intended meaning and the nearest visual family. Use supplied references to identify proportions, terminals, connected forms and negative space, then construct editable vector artwork for the system size. Preserve useful source geometry without copying incidental detail. Larger exploratory artwork, including generated concepts, is a design hypothesis; it must be resolved into a 12–16px vector prototype before it establishes a production rule.

Salt icons use a 16×16 viewBox. Numeric SVG masters retain a fixed primary reference stroke of 0.67 units. The recipes in the icons package use a 24-unit construction canvas. The exporter first scales coordinates and numeric widths by 16/24, then multiplies the normalized widths by 0.67 to establish the reference artwork. A separate framing stage fits each export while keeping those numeric stroke widths unchanged.

A primary construction stroke of 1.5 therefore exports as `1.5 × (16 / 24) × 0.67 = 0.67`. Use the normal stroke helper for primary lines; setting its construction width to 0.67 would make the exported stroke too thin. An unscaled secondary width of 1.08 exports as approximately 0.4824 units, retaining a 0.72 proportion of the primary stroke. Local construction scaling also affects these widths.

Generated React icons map these reference widths to the configured primary width **W** while retaining each stroke's ratio to 0.67. The theme defaults to **W = 1.333333 (approximately 4/3) in high and medium densities** and **W = 1 in low, touch and mobile densities**; the component's fallback is **1** when no stroke variable is defined. At a rendered size of `P` pixels, the primary stroke occupies `W × P / 16` pixels. A default 12px high/medium density icon therefore has an **approximately 1px** primary stroke; an explicit `W = 1` at 12px gives 0.75px, and the 0.67 reference gives 0.5025px. The `schedule-time` hands retain their lighter 0.72 proportion. Resizing scales the artwork and its strokes together.

Construction groups may translate, rotate or scale reusable geometry. Bake every transform into the exported coordinates and widths. When adapting geometry already drawn on a 16-unit canvas, lift it consistently to the construction canvas before export; avoid applying normalization twice.

Use shared primitives and the Roboto vector letterforms for repeated geometry, labels and numerals. The glyph data uses a seven-unit capital-height metric, proportional lining numerals, natural advances and explicit tracking. Let the helper calculate visible bounds instead of centering by character count. Preserve the font attribution and license. Labels load no font at runtime. If a needed character is absent, extend the shared glyph data consistently instead of silently substituting a different character.

`generate-letterforms.py` reproduces the regular 400 and bold 700 outlines from the SHA-256-pinned Roboto v3.015 variable font at width 100. For this occasional authoring operation, use Python with `fonttools==4.61.1` and `skia-pathops==0.9.2`, then pass the downloaded source font path shown in that script. Normal icon generation consumes the checked-in vector data and does not need Python or a font download. Regeneration unions overlapping variable-font contours before SVG filling or stroking, and applies the font's `pnum` substitutions to glyphs and advances. It also derives the positive/inverse caption C and its disabled slash clearance from the same font. `letterTracking` is emitted with the glyph data and used by both the label helper and the caption generator: CC uses the font advance plus tracking, then centers the complete label, rather than using independent fixed letter anchors. Preserve `ROBOTO-LICENSE.txt`. The conventional barred italic I remains a purpose-drawn command symbol.

Review the whole lettering family after extending or replacing glyphs: timers, file labels, sort controls, string labels, captions and text commands. Inspect contours as well as spacing; an overlapping font contour can become an unintended hole under even-odd fill. Keep timer labels at a common capital height, center their visible bounds and inspect clear space to the arrow at both themed widths.

Regular vector lettering combines a filled core with a small proportional stroke. The bold control uses a filled bold glyph, and the italic control uses the family’s barred I.

Share the same stroked paths and authored widths for open contours, frames, handles, stems and action lines in outline and solid recipes. Add the filled surface separately so the pair retains its defining features and complete outer contour. Filling only to a former stroke centerline removes half the rim and shrinks the object; keep that rim unless it would repaint a cutout, in which case subtract the opening from the complete silhouette. The default independent fits must still preserve retained landmarks in the final exports; use a reviewed shared frame when necessary, as described below. Intrinsic filled silhouettes and inverse details remain filled geometry, and fitting preserves every stroke's reference width.

The existing Import and Export `Solid` exports are compatibility aliases for their open-line drawings. They have no enclosed surface that can fill without changing the established arrow style or bracket weight. `line-only-variants.mjs` records these two exceptions, and the generator rejects an unexpected identical pair or a distinct drawing for a recorded alias. Do not create a new arrowhead treatment just to distinguish a variant.

The following example shows how an outline and solid can share line geometry on the 24-unit construction canvas. Its dimensions illustrate composition; use the related family to determine a new icon's proportions.

```js
import { circularCrossJunction } from "./junctions.mjs";
import { box, F, S } from "./primitives.mjs";

const frame = S(box(3, 3, 18, 18));
const divider =
  S("M3 9h18") +
  circularCrossJunction(3, 9, 1.8, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  circularCrossJunction(21, 9, 1.8, undefined, [
    [-1, -1],
    [-1, 1],
  ]);
const detail = S("M8 15h8");
const outline = frame + divider + detail;
const solid = F(box(3, 3, 18, 6)) + frame + divider + detail;
const pair = [outline, solid];
```

### Reuse the interior contour profile

Classify the finished painted boundary using the design guide's [geometry rule](../../site/docs/foundations/assets/icon-design.mdx#geometry) before selecting a helper. Enclosure is not the test: an exposed concave recess can belong to an outer contour. Calibrate the visible result using [the welding guidance](../../site/docs/foundations/assets/icon-design.mdx#calibrate-the-amount-of-welding), including a subtler transition where short members need it; neither a helper default nor a clear detector report establishes appropriate strength.

Use `softenedStroke`, `softenedFrame`, `softenedRect` and `softenedFill` from `scripts/artwork/contour-profiles.mjs` in the owning recipe. The line helpers retain the original path and add tangent inner paint. They handle straight turns at every angle, exact curve-to-line tangents and actual straight contacts across subpaths. A move alone never creates a connection. `softenedFill` classifies negative sectors of even-odd contours; it does not round outward polygon vertices.

The circular construction radius starts at 1.5 construction units for primary linework, the local width for secondary linework, and 0.5 for filled negative corners. These are starting profiles, not universal final-pixel radii. Straight fillets use at most half each adjoining run so neighboring curves cannot overlap. Curved joins use a bounded tangent solver. Insufficient runs, failed tangent solutions, contacts between separate elements and compound clearances still require review: a skipped or hidden construction is not an approved sharp corner. `keep` and `at` are construction controls, not exceptions.

The circular action family uses `circular-arrow.mjs` above the local tangent helper. Its 24-unit construction has circle centre [12, 12], radius 9, equal 3.75-unit head arms and a head 5.25 units above the centre. Full loop exports fit to centre [8, 8], radius 7 and 35/12-unit head arms. Numbered timers translate the complete construction together to retain their existing reference-space numeral anchor; this does not change the final frame. History shares the counterclockwise loop and centres shorter clock hands within it. Sync uses two opposing half arcs. Undo and Redo end at the bottom and inherit Refresh's fitting transform, so their asymmetric painted bounds do not recenter the circle. Their optical-fit centres describe those painted bounds, not the circle centre.

`checkCircularArrowProportions` in `arrow-alignment.mjs` recovers circle geometry, arm lengths, head positions and tail endpoints from the final paths. It checks all registered circular family exports alongside the tangent check and fails normal artwork validation on drift. Review spacing, head clarity and any proposed different arc opening at native sizes before changing this family contract. Keep new family members in the shared construction and export membership list; do not add a separate detector for each icon.

Use shared owners for recurring frames, controls and marks. Keep compound geometry together where it is genuinely connected; preserve distinct objects and their clearances. Do not weld separate objects merely to satisfy the detector. Check the finished paint at all supported widths: neighboring curves can intersect and create a new cusp even when each individual curve is valid.

Run `yarn workspace @salt-ds/icons audit:corners` after generation. It renders every export at reference, light, standard and heavy weights and writes `dist/icon-corner-consistency/index.html` plus `paint-report.json`. The detector examines the final union of filled and stroked shapes, including negative-space and curve-to-line corners. Cache identity includes normalized source and the Chrome version/platform. Approval identity uses normalized SVG, the explicit analysis version and measured observations; line-ending changes and identical recomputed evidence preserve approval. Bump the returned analysis version when changing detector semantics. A malformed generated cache is discarded and recomputed. It reports inner, outward and uncertain locations. Its finite sampling can miss tiny features or flag raster artifacts; zero findings never establishes approval. Source intersection traces remain useful diagnostics, but they are not the primary completeness measure.

For reproducible contact sheets, `yarn node packages/icons/scripts/artwork/render-corner-evidence.mjs` renders the saved `comparisonBaseline` against current exports at both native sizes, four weights and both backgrounds. The baseline is a dated comparison, not an approval list.

For an individual decision, run `yarn workspace @salt-ds/icons audit:corners --template battery.svg`. Copy the generated entry from `dist/icon-corner-consistency/review-template.json` into `scripts/artwork/corner-reviews.json`, then fill in the actual review. The template starts unresolved. Review the complete unmarked drawing, both native sizes, all four weights, light/dark and generated components/CSS masks. Account for every inner or uncertain observation. A `retained-sharp` decision requires before/after comparison files at both 12px and 16px; a detector disagreement needs detail evidence. Evidence paths are repository-relative and must exist.

`yarn workspace @salt-ds/icons check:corner-reviews` is the strict completion gate. It fails for pending decisions, missing coverage, unresolved findings, missing evidence and changed artwork or detector fingerprints. Existing approvals from the source intersection map do not automatically satisfy this newer contract. New additions must satisfy this contract during `validate:icons`; existing recorded corner decisions are also checked for staleness. The catalogue migration remains open until these decisions are recorded; numerical validation and a rendered contact sheet alone do not certify every corner.

### Record modifier decisions

For a new or revised compound icon, follow [Action and state modifiers](../../site/docs/foundations/assets/icon-design.mdx#action-and-state-modifiers). Record the intended action or state, chosen mark, nearest base object and action siblings, and whether placement is internal, adjacent or overlapping. Explain any family exception. An export's name alone is not a sufficient brief.

Record the spatial relationship separately from the modifier's own junction treatment. An arrow crossing a cloud boundary needs clearance from the cloud; a separate plus can still have welded internal corners. Follow [Junctions within a modifier](../../site/docs/foundations/assets/icon-design.mdx#junctions-within-a-modifier). If a crisp crossing is proposed as a small-size simplification, retain the welded comparison and document the native-size evidence before accepting that exception.

Calibrate a revised junction against [the calibration guidance](../../site/docs/foundations/assets/icon-design.mdx#calibrate-the-amount-of-welding) and [reference measurements](scripts/artwork/REFERENCE-CALIBRATION.md). Record local painted width, visible radius or runout, remaining straight member length, and neighboring clearance in the **final fitted export**. A centerline reach is not a painted radius. The existing `crossJunction` helper draws quadratic transitions; `circularCrossJunction` draws circular concave transitions whose visible radius, at an exposed equal-width perpendicular crossing, is final reach minus half the painted width. Do not swap them across the catalogue without a family comparison. For a fixed compact plus, use `weldedPlusContour` from `additions-marks.mjs`: its radius describes the visible contour directly. The [reference calibration notes](scripts/artwork/REFERENCE-CALIBRATION.md) record the reviewed dimensions for each addition mark. Do not substitute a stroked centerline bridge into an inverse counter and assume the painted shapes will match.

For connected structures, choose geometry that follows the actual members: `circularCrossJunction` for perpendicular lines, `angledJunction` for angled lines, `radialCircleJunction` for a circle with an outward member, or `circleOnBaseJunction` for a round handle resting on a base. The last three are in [structural-junctions.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/structural-junctions.mjs). Select only exposed sectors where members really meet. These helpers fill the interior between the arc and the original members before stroking the arc; a stroked bridge alone can enclose a tiny pinhole at thin widths. Preserve that filled interior when reusing the construction, without filling the object's intentional counter. Inspect both the 0.67 reference and the heavy reviewed width: a sound join must not open a pinhole when thin or lose its curved transition when thick.

Reuse the base object's geometry and remove dispensable interior detail before adding a modifier. If the mark fits in a clear interior field, keep the outer contour intact. If overlap is necessary, derive transparent clearance from the foreground paint and retain the object's identifying landmarks. Compare the final fitted base and action together; fitting must not make the common object grow, shrink or move. Keep the modifier's position and gesture stable across outline and solid, including an inverse counter where appropriate.

Capture the starting artwork and check the complete affected action family at 12px and 16px, both themes, reference width 0.67, theme widths 1 and 4/3, and review width 1.5. Record any deliberate semantic or placement exception beside the owning recipe. Add focused landmark or clearance regression coverage when the corrected relationship is sensitive; do not treat a passing geometry check as proof that the action is understood.

### Share symbols on the final canvas

Repeated status symbols use closed filled contours authored directly on the final 16-unit canvas in [enclosed-marks.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/enclosed-marks.mjs). Positive marks and transparent inverse marks use the exact same contours and placement within each pair. Keep the shared gesture, then review the primary mark's size, stem length, dot spacing and placement for its container. Error's octagon and Warning's triangle need not use identical exclamation dimensions. Record those optical choices in the owning shared construction instead of changing each export independently. The shared ticks retain identical anchors across their family; compact ellipsis dots and facial details retain their separately reviewed dimensions. These filled symbols keep their geometry and weight when a consumer changes the surrounding outline's stroke width.

Use `withSharedMark(body, path, inverse = false)` from [mark-composition.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/mark-composition.mjs). Author `body` on the normal 24-unit construction canvas and pass the shared final-canvas path separately. Generation normalizes and fits the container first, then adds the mark without scaling or translating it. A positive mark is a filled path; an inverse mark is appended as a transparent counter to one unstroked even-odd container path.

Locked and Unlocked use the same mechanism with [lock-marks.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/lock-marks.mjs). Their head-and-stem keyhole retains one final size and position across both states and both polarities, independently of the fitted body and shackle.

Use the final-canvas descriptor for primary status marks and compact addition marks that need fixed positive/inverse geometry. Schedule, Add document and Add to grid compose their plus after fitting the base. Add user’s adjacent plus participates in its full composition bounds, so its fixed contour is authored in construction space with the reviewed fit compensation; preserve its final 4/3-unit band and original person framing. Keep both approaches behind shared contour construction and verify the final export, rather than copying path strings. Standalone Add remains configurable because it is a primary operator with longer arms.

[cross-marks.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/cross-marks.mjs) supplies configurable `weldedCross` for the X family and fixed `weldedXContour` for ProgressCancelled's positive/inverse status mark. Preserve the owning recipe's endpoints, proportions and role-specific weight. A shared corner treatment does not make every X an interchangeable action or give every X the same dimensions.

Other compact modifiers can share a stroked construction with the surrounding object, as CloudSuccess and NotificationRead do in [action-marks.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/action-marks.mjs). Their ticks use the same flat terminals and 45-degree, 2:1 arm gesture at a local scale; their widths follow the configured primary stroke. Preserve the same linework in both variants and build the solid cutout around that compact mark. Review the base object's recognition and each pair's final placement before accepting the composition.

```js
import { enclosedTick } from "./enclosed-marks.mjs";
import { standaloneMark, withSharedMark } from "./mark-composition.mjs";
import { C, circ, F } from "./primitives.mjs";

const outline = withSharedMark(C(12, 12, 9), enclosedTick);
const solid = withSharedMark(F(circ(12, 12, 9)), enclosedTick, true);
const standalone = standaloneMark(enclosedTick);
```

`standaloneMark(path)` keeps the same final contour without a container. Checkmark and its aliases use the corresponding optical target described below. Reuse the shared tick for Checkmark, SuccessCircle, StepSuccess and ProgressComplete. Use the reviewed primary status punctuation for its intended role, and the compact dot construction for ellipses and facial details; do not resize all dot roles as a side effect of improving one status icon. Review all affected siblings when changing a shared contour.

MedicalKit and Hospital use the same welded-cross contour helper with their own stronger medical proportions. Woodland shares a fixed branch contour between paint and counter while keeping its exposed canopy/trunk strokes configurable. These are local semantic marks, not a license to convert ordinary linework to fixed fills. Verify frame overrides and fixed mark weight independently.

Lightbulb similarly shares one fixed Y filament contour between paint and counter. Its positive stem attaches to the baseline; its inverse stem needs an opening through that baseline. Compare the actual exits in both variants rather than repainting a complete rim over the counter.

### Share facial details

[face-marks.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/face-marks.mjs) supplies the five `semantic-*` face pairs registered in `c.mjs`. Compose these final-canvas filled contours with `withSharedMark` after each circle is fitted. Open eyes reuse `enclosedDot` for 2-unit pupils; keep the angry face's pupils distinct from its brows. Line-like mouths have a fixed thickness of 1.5 units, independent of the configurable circle stroke.

Each pair shares its eye placement and mouth geometry. VerySatisfied deliberately retains a mouth ring in the outline and a full mouth opening in the solid, with identical closed eyes and outer lip. Preserve this surface distinction when comparing positive and inverse contours. Review all five expressions together at native size, including the pupils, brow clearance and mouth weight.

## Fit every export to the viewBox

After construction normalization, [view-box.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/view-box.mjs) measures each export's actual painted bounds in installed Chrome through the repository's Playwright dependency. By default, it uniformly scales and centers the geometry to target a **15.5-unit longest painted dimension at primary width 1.5**, with **0.25-unit margins** along that axis. The fit includes caps and joins and preserves the original aspect ratio. A narrower second axis retains its empty space. For a shared symbol, this step fits its container; the final-canvas mark is composed afterward.

Fit outline and solid exports independently by default, then compare the final retained features. Different transforms are acceptable only when they preserve those features' apparent size, anchors and intended relationships. When they do not, a reviewed shared frame takes precedence over filling each variant's bounds independently. Exact aliases use the same fit and remain identical to their supported export. Legacy compact names such as `close_small` require a documented optical target to reserve extra internal padding.

Equal bounds do not establish equal apparent size or optical balance. Choose the nearest reviewed family frame before accepting the default fit; maximum occupancy is not a requirement. Keep the canvas available for fuller objects and status containers rather than applying a global inset. If a whole-icon correction improves the native-size comparison, add a canonical export entry to [optical-fits.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/optical-fits.mjs) with its `targetSpan`, `center: [x, y]` and a concrete `reason`. Values are final 16-unit coordinates measured at primary width 1.5. The span must be positive and no larger than 15.5; offsets must leave all paint inside the viewBox. The current exceptions temper the filled Play silhouette and shift both Play variants slightly toward the point. Favorite keeps its outline and solid on the same frame to preserve the star contour. Both Stop variants use the same centered 14.5-unit target, keeping one square boundary while balancing the pair beside Play and Pause. Standalone Checkmark uses a span of `9 + √2` (approximately 10.414214) and center `[8, 7.75 + √2 / 4]` (approximately `[8, 8.103553]`) to preserve the exact tick used by its enclosed and inverse companions. These are local decisions, not universal shape sizes. VolumeDown and VolumeOff use reviewed targets that retain VolumeUp's speaker size and anchor as the waves or mute cross change. Close and CloseSmall use centered 12.5- and 10.5-unit spans to restore the original dismissal scale while retaining primary stroke width. Exponentiation uses an 8-unit span centered at `[8, 4.25]`, preserving its compact, raised mathematical role instead of filling and centering it like a navigation chevron.

For a repeated object across states, compare its final bounds and anchors before and after fitting. Choose one reviewed family baseline, then use per-state targets or a shared frame to retain that object while allowing the modifier its own extent. Music uses the disabled composition’s frame so adding a slash does not shrink the note. Filter reserves the clear mark’s space across its four states and fills the same funnel contour without enlarging it. Filled Flag, Copy, ChatGroup, FolderOpen, Laptop, GuideClosed, BuildReport, Signpost, School and Receipt retain their outlines’ pole, rear frame, support or interior landmarks. Microphone states share their support frame. Add a final-export feature check for the shared landmark; whole-icon occupancy cannot detect internal size drift.

Minimize uses an 11-unit span centered at `[8, 12.5]` to retain its compact lower window edge. GreaterThan and LessThan share one comparison gesture with their equality-bar companions, using compact optical targets that leave room for the bar. First and Last share a compact 10.8125-unit span, a 90-degree chevron gesture and a separate boundary bar. Their near-square proportions approach the original 8px footprint at a 12px display size. KeyControl uses a 9.125-unit span centered at [8, 4.1] to retain its small raised keyboard position. The four directional triangles share a 40/3-unit span and 2:1 proportions; TriangleRightDown uses 28/3 units. These local decisions restore compact control families and do not change Warning or Play. Corrections preserve configured stroke widths; review softened joins again after reduction.

CloudSuccessSolid uses the reviewed `frameSource: "cloud-success.svg"` exception to inherit its outline's scale and translation. Its solid body is one filled silhouette with the tick clearance subtracted, so no separate cloud border can create a step or intrude into the opening. The shared frame preserves the compact tick's exact size and position. A frame source must be a registered canonical export with an independent fit. The dependent export inherits only its scale and translation; declare that export’s own measured painted span and center, which can differ when a border or modifier is absent. It still passes its own painted-bounds and clipping checks. Frame-source chains and cycles are rejected.

Cloud, CloudUpload, CloudDownload, CloudSync and CloudDisabled solid variants also inherit their corresponding outline frame. Their fixed filled silhouettes include the complete cloud rim at the 1.5 fit weight, then subtract action clearance; do not overlay a partial stroked border at the opening. Their outer edges differ slightly from configurable outlines at lighter weights, so inspect that bounded difference as well as exact action anchors. Upload, Download and Sync use 0.75 final units of clearance from the actual painted action at the theme midpoint (7/6); Disabled retains its distinct 1.3-unit slash clearance. These are cloud-family decisions, not universal gap tokens.

The generator applies these targets during fitting, preserves stroke widths and records the center and reason in the generated manifest. Exact aliases inherit their canonical target. Brand and full-canvas surface exemptions do not accept optical overrides. The validator rejects unknown entries or inconsistent manifest targets and checks the actual exported paint against the selected span and center, including clipping.

Do not translate or uniformly scale an entire recipe to make a framing correction: ordinary fitting will cancel that change. Interior placement belongs in the owning geometry. For shared symbols such as the SuccessCircle tick, update the common final-canvas contour in `enclosed-marks.mjs` and review every affected companion. Compare before and after at 12px and 16px, in both modes, with siblings and text before retaining an exception.

The seven brand exports—`figma.svg`, `github.svg`, `icon-figma.svg`, `linkedin.svg`, `linkedin_solid.svg`, `stackoverflow.svg` and `symphony.svg`—retain their existing 16-unit framing. This includes the custom LinkedIn outline, whose letters remain aligned with those in the official solid mark. The full control surfaces in `checkmark_solid.svg`, `success_solid.svg` and `success_small_solid.svg` also remain edge-to-edge. Their standalone counterparts inherit Checkmark's documented optical target.

The framing transform moves and scales the container's paths, counters and cutouts together while preserving the **0.67-unit primary reference stroke** and every secondary ratio. Shared final-canvas marks are composed after this transform and retain their authored contours. Generated React components use the density's themed primary width: **1.333333 for high/medium** and **1 for low/touch/mobile**, with a fallback of **1** when neither stroke variable is defined. Thinner strokes occupy slightly less of the frame than the 1.5-width fitting target; inspect acute joins at the actual interface width.

Generation writes [view-box-transforms.json](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/view-box-transforms.json) beside the artwork scripts. Keep this generated manifest with the exported SVGs. The validator uses it to reverse only the framing transform for existing recipe-geometry regression checks, and separately checks the actual fitted exports for painted occupancy, centering and clipping. Make framing changes in the generator; do not hand-pad individual recipes or edit the manifest.

## Check final pixel alignment

Follow the [design guidance for pixel alignment](../../site/docs/foundations/assets/icon-design.mdx#align-important-edges-to-the-pixel-grid). At 12px with a 4/3-unit primary stroke, horizontal and vertical stroke centers on the 16-unit master land on `2/3 + 4n/3`; their painted edges then align at an integer CSS origin. Filled boundaries use a different phase. This is a review target for important straight runs, not a snapping rule for every coordinate or a promise at fractional layout positions.

Run `yarn workspace @salt-ds/icons audit:pixel-grid`. The report in `dist/icon-pixel-grid/report.json` covers every export at 12px/W4/3, 16px/W1 and 16px/W4/3. It samples whether long straight candidate boundaries remain exposed in the union of the final SVG paint, then measures their distance from the pixel grid. The review queue excludes brand artwork. Short details, curves and diagonals need visual judgment; a low score or an empty result is not visual approval. The score assumes 100% zoom, DPR 1 and an integer CSS origin. Review light/dark, higher pixel densities and fractional placement separately.

Use the owning recipe for structural changes and `optical-fits.mjs` for reviewed whole-icon span or placement changes. Preserve one frame for pairs with retained landmarks. Printer's 13.5-unit painted span keeps its authored grid at scale 1; enlarging it to 15.5 would undo the alignment. The pixel-grid tests protect the reviewed printer and primary-control edges against that regression. The catalogue audit remains advisory because many valid drawings trade alignment against geometry and recognition.

## Construct transparent cutouts

Follow the visual separation described in [Icon design](../../site/docs/foundations/assets/icon-design.mdx#transparency-and-cutouts). Calculate clearances from the actual configured stroke widths, then inspect the resulting geometry at native size.

### Calculate local painted gaps

The following equations describe local parallel edges in the **16-unit reference geometry before export fitting**. Let **W** be the primary width, `r` a proportional stroke factor and `g` the remaining painted gap. The example measurements below describe that reference geometry; they are not measurements of the final fitted exports.

| Construction                                                                | Painted gap                      |
| --------------------------------------------------------------------------- | -------------------------------- |
| A fixed filled boundary at distance `E` from a foreground stroke centerline | `g = E − rW / 2`                 |
| Two stroked paths with centerline separation `D` and factors `r1` and `r2`  | `g = D − (r1 + r2)W / 2`         |
| Two fixed filled contours                                                   | Their geometric edge separation. |

Use **W = 1.333333** for the high/medium density theme default, **W = 1** for the low/touch/mobile default or an explicit 1-unit comparison, and the selected value for any override. Use **W = 0.67** for the numeric SVG reference. If both neighboring edges carry strokes, include both half-widths.

Choose a useful local gap by comparing the related family and its native rendering. Before fitting, a chosen gap `g_min` between parallel strokes requires `D ≥ g_min + (r1 + r2) × W / 2`. The devices phone header has a reference centerline separation of 2 units; its two primary strokes leave a reference-space gap of `2 − W`: **approximately 0.667 units at the high/medium default W = 1.333333**, 0.5 units at the fitting width W = 1.5, 1 unit at W = 1, or 1.33 units at the 0.67 reference width. These values precede export fitting; calculate the final gap from the fitted distance.

| Reference construction                                                              | Painted gap at reference W = 0.67 |
| ----------------------------------------------------------------------------------- | --------------------------------- |
| Devices: straight cutout edge 1.25 units from the phone's primary stroke centerline | 0.915                             |
| Boolean: track radius 2.75 and filled thumb radius 1.25                             | 1.165                             |

These reference measurements describe particular constructions, not universal minimums or spacing tokens. For an export fit scale `s`, geometric distances become `sE` and `sD` while stroke widths stay unchanged. The fitted gaps are therefore `sE − rW / 2` and `sD − (r1 + r2)W / 2`; a gap between two filled contours scales by `s`. Use the actual export's fit and the configured **W**, including the high/medium default **1.333333**, the low/touch/mobile default **1**, and any selected override.

For a fixed opening around a configurable flat-capped stroke, the side clearance is `E − W / 2`, but the terminal plane does not move along the line direction. Calibrating the opening from the painted mark at **W = 7/6**, midway between the defaults, divides the side/end difference evenly: **1/12 final unit** at both W = 1 and W = 4/3. This is a construction aid, not a new theme token or universal gap. Include cap corners and convex tips when offsetting the painted contour; the background relief can curve while the foreground keeps its flat caps and sharp joins.

Curved border caps and mitered foreground tips have different width responses. Balance their complete painted footprints across both defaults, preserve the original curves and mark placement, and record any small remaining optical compromise. CloudSync's retained lobe beside an arrow miter is one such case: a fixed curve stop cannot track the growing tip exactly. Inspect reference 0.67 and maximum 1.5 as well, and confirm openings remain useful.

For shared marks composed after fitting, measure from the fitted container to the mark's final contour directly; do not apply the container's fit scale to that contour.

At 12px, multiply the resulting fitted-coordinate gap by `12 / 16`. Inspect the final export in the existing icon stories and relevant component examples: a reference-space regression check or mathematical separation alone does not establish useful native-size openings. Filled boundaries stay fixed when a consumer changes stroke width, so verify the selected width does not collapse a gap.

### Follow curved contours

For a smooth foreground curve `p(t)`, a constant normal offset follows `p(t) + E·n(t)`, where `n(t)` is the unit normal on the cutout side.

A circle can use an offset radius. A general Bézier curve usually needs a fitted or sampled offset construction. Scaling the whole curve, expanding its bounding box or moving each control point horizontally by the same amount will usually produce uneven separation. The Devices phone has sharp exterior corners. Its background relief follows the painted miter corner with a circular offset calibrated at the midpoint of the two theme widths; the foreground corner stays sharp. Inspect its bounded spacing change at the reference and supported widths.

Inspect curved apexes, shoulders and the transitions between straight and curved segments. Keep the foreground shape unchanged when correcting only its background clearance.

### Check diagonals, terminals and corners

Measure diagonal gaps perpendicular to the edge. For parallel lines `y = mx + b`, a vertical displacement `Δb` produces normal separation `d = |Δb| / √(1 + m²)`. Use that normal distance in the painted-gap calculation. This distinction matters at the sloping edges of the graduation cap in `school`.

At a terminal or sharp corner, include the complete painted footprint at the configured stroke width. Butt caps stop along the line direction, but their outer corners still affect nearby diagonal clearance. A rectangular notch can leave plenty of space at the sides of a mark and too little at its cap corner.

For equal-distance clearance, offset the painted foreground by the intended gap and join the cutout boundary appropriately. The empty buffer can curve around the outer cap corners while the foreground mark itself remains square-ended. Check both sides of a mark and inspect the whole boundary, including acute joins and adjoining cutouts.

For a filled body with a modifier, construct its complete outer silhouette before subtracting the modifier clearance. Do not redraw an independently clipped border over that subtraction: its terminals can create steps where the opening meets the silhouette. For a retained line entering a filled surface, keep its endpoint inside the painted surface or preserve their common perimeter, as in the Headphones cups. Keep genuinely exposed lines configurable.

SendSolid uses the outline’s complete painted contour at the midpoint of the two themed widths, with its established tapered seam subtracted afterward. Its shared frame preserves the plane’s proportions and the final seam coordinates. A fixed filled contour has small optical edge differences as the outline width changes; keep those bounded at both defaults instead of introducing stroke-cap steps at the seam mouth.

Use a connected subpath for a retained corner instead of making two butt caps meet there. For an aperture open to the exterior, use a single notched contour; coincident edges of an even-odd hole and an outer fill can leave raster seams. Review this topology at all supported weights as well as checking distances around the foreground. Include fractional pixel positions when checking an open aperture: coincident fill edges can leave a line at one raster phase while appearing clear at another. Printer's output-paper regression samples the complete image at four vertical phases as well as checking both housing rims. The open-aperture regression also compares fresh ordinary and readback canvas renderers for the people and clipboard openings; an optimized readback renderer alone can conceal a coincident-edge seam. When repairing this class of defect, inspect other open-aperture constructions in the affected family before closing the review.

Add a focused final-render regression for a repaired edge: sample the complete SVG, including overlaid strokes, at reference **0.67**, theme **1** and **1.333333**, and maximum fit width **1.5**. The cutout contour checks cover the bell and cloud-sync openings, music beam, and headphone joins without reversing the export fit. The final cutout-spacing checks compare side, terminal, corner and curve-end gaps across all four widths; they complement the contour checks, which catch steps and overpaint. Keep expected spacing independent of the cutout path being tested. Verify the regression fails on the previous drawing, then inspect native and enlarged renders.

## Export and consumer contract

Use the current family's compact output vocabulary: `svg`, `g`, and `path`.
Export `width="16"`, `height="16"` and `viewBox="0 0 16 16"`. Keep path geometry explicit; use `fill="none"` for open lines, `currentColor` for paint, and `evenodd` for compound fills where needed. Primary lines use `stroke-linecap="butt"` and `stroke-linejoin="miter"`; construct selective curved junctions in the path. Do not use a non-scaling stroke.
The exporter writes fixed numeric stroke widths and bakes both construction transforms and the per-export framing transform into the path coordinates.
Validation rejects `<text>`, `<mask>`, `<clipPath>`, `<image>`, `<script>`, and invalid values such as `NaN` or `undefined`.

There is no comprehensive SVG allowlist schema.
[svgAttributeMap.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/svgAttributeMap.mjs) maps SVG names to React attribute names; it is not a list of approved drawing features.
Stay within the established geometry profile when adding artwork.

[Component generation](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/generateIcons.mjs) preserves `fill="none"`, makes filled shapes inherit the icon theme, and maps currentColor strokes to the same theme token.
Generated React strokes use `--saltIcon-strokeWidth`, falling back to the [size foundation](https://www.saltdesignsystem.com/salt/foundations/size#stroke-width) `--salt-size-icon-strokeWidth` and then `1`. The foundation supplies **1.333333** in high/medium density and **1** in low/touch/mobile density; the final `1` is the unthemed fallback. A reference width `w` retains its proportion `w / 0.67` of that configured width. This changes stroke paint, preserving filled contours and official brand shapes.
Numeric SVG masters, standalone SVG images and the data-URL masks in `saltIcons.css` retain their baked widths. Host CSS variables do not cross into an image or mask document.
The [size CSS](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/src/icon/Icon.css) uses Salt's density-based icon size with a 12px minimum and a size multiplier.

## Find the effective recipe before editing

Base artwork recipes live alphabetically in [a.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/a.mjs), [b.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/b.mjs), [c.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/c.mjs), and [d.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/d.mjs).
The exporter combines the alphabetical batches with these shared constructions in [generate.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/generate.mjs):

| Effective owner                                                                                                                    | Current responsibility                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [architecture.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/architecture.mjs)             | Bank architecture.                                                      |
| [reference-symbols.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/reference-symbols.mjs)   | Globe, heart/like, currency, exchange, light, laptop, display, browser. |
| [reference-frames.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/reference-frames.mjs)     | Calendar, mobile, schedule, schedule-time, all panel orientations.      |
| [reference-controls.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/reference-controls.mjs) | Bank-check, boolean, devices.                                           |
| [bookmarks.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/bookmarks.mjs)                   | Bookmark and its removal action.                                        |
| [cloud-actions.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/cloud-actions.mjs)           | Cloud and its action/disabled states.                                   |
| [file-formats.mjs](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/file-formats.mjs)             | CSV, PDF, XLS, ZIP.                                                     |

Edit the effective owner and reuse its shared geometry when extending an existing family.
Each meaning has one owning recipe. The generator rejects duplicate registrations, including names reserved for aliases.
[Primitives](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/primitives.mjs), [letterforms](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/letterforms.mjs), [numbered timers](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/numbered-timer.mjs), [enclosed marks](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/enclosed-marks.mjs), and [facial details](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/face-marks.mjs) also serve multiple icons; review affected siblings when changing them.

Aliases are assigned after shared constructions: `bar-chart→chart-bar`, `pie-chart→chart-pie`, `line-chart→chart-line`, `error-execute→not-allowed`, `help→help-circle`, `icon-figma→figma`, and `success`, `success-tick`, `success_small→checkmark`.
Preserve their existing filenames and exports.
The deprecated `step-success` keeps its historic filled badge and is not an artwork alias to its replacement.

## Add and integrate a new icon

1. Define its meaning, nearest siblings, useful states, and whether it needs a solid variant. For a compound icon, record the modifier meaning and placement using the action/state decision rules. Distinguish an object, action, state, file type and official brand mark before drawing. Follow the nearest naming family: `remove-bookmark` means removing an item from bookmarks, consistent with `remove-document` and `remove-user`; it is distinct from disk saving or a bookmark's unselected state. Reuse the bookmark silhouette and preserve its identifying notch when composing the removal mark.
2. Add a uniquely named recipe to the appropriate batch, or extend the appropriate shared construction. A new shared module must be imported and applied by the exporter.
3. Add `new-name.svg` and, when supplied, `new-name_solid.svg` to [inventory.json](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/inventory.json). Keep the file list in JavaScript `.sort()` order.
4. Add or update the website's synonym metadata and category as described below. One metadata row covers both variants.
5. Generate SVGs and package artifacts, then run validation and the targeted integration checker.
6. Inspect the new icon beside its siblings in the existing site catalogue and Storybook at the required sizes. Verify its website search results and both variant filters. Add meaningful targeted clearance or alignment checks for new sensitive constructions.
7. Update the current file/pair counts in the [package README](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/README.md) when names or variants change. Add a changeset for consumer-visible changes, including shipped artwork, following [CONTRIBUTING.md](https://github.com/jpmorganchase/salt-ds/blob/main/CONTRIBUTING.md).
8. Review the generated diff and deliver the source recipe, metadata, registration changes, relevant changeset, and generated integration artifacts together.

The inventory guard detects unintended name changes; intentionally extending the inventory is the correct way to add new icons.
The generator rejects unregistered names, missing requested variants, and unexpected identical pair bodies (the recorded Import/Export line-only aliases are required to remain identical).
The website metadata assigns each meaning one category shared by its variants.
Regular `build:icons` can consume a new source SVG directly, but the maintained recipe workflow also needs its recipe and registration.

For `new-name.svg`, generation creates `NewNameIcon`, `NewNameIconProps`, the default label `new name`, and `.saltIcons-NewName`.
The optional `_solid` suffix becomes `Solid` in the component and class names.
The [component template](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/templateIcon.mustache) lets callers override default accessibility props.
For use in products, supply the appropriate accessible name or `aria-hidden` according to the icon's role.

Generated artifacts include `src/SVG/*.svg`, `scripts/artwork/view-box-transforms.json`, `src/components/*.tsx`, `src/components/index.ts`, `saltIcons.css`, `stories/icon.all.ts`, and the site's `allIconsList.ts`.
Use the generator for these artifacts; make durable artwork changes in the effective recipes.
Use the full package `build:icons` command: passing one SVG to the lower-level generator would rebuild its aggregate lists and CSS from only that subset.

### Website synonyms and categories

Maintain [salt-icon-synonym.json](https://github.com/jpmorganchase/salt-ds/blob/main/site/src/components/icon-preview/salt-icon-synonym.json) alongside new names and semantic changes.
It is a JSON array with the exact keys `iconName`, singular `synonym`, and `category`:

```json
{
  "iconName": "bank-check",
  "synonym": ["finance", "payment", "cheque", "check"],
  "category": "finance"
}
```

This existing entry illustrates the schema; choose terms that explain the new icon's actual meaning.
Use a lowercase hyphenated basename for `iconName`, without `.svg`, `_solid`, or the React `Icon` suffix.
One metadata row covers both outline and solid components.
The [website consumer](https://github.com/jpmorganchase/salt-ds/blob/main/site/src/components/icon-preview/IconPreview.tsx) removes hyphens and matches the PascalCase name case-insensitively, with an optional `Solid` suffix.
For an existing underscore filename, verify its generated name and use the matching hyphenated metadata form, as `favorite_strong.svg` and `favorite-strong` do.
Avoid duplicate or colliding normalized names: the consumer takes the first matching row.

The website's `category` field is the maintained category source for the catalogue.
Choose an appropriate existing value, such as `finance` or `actions`, by comparing nearby entries.
A missing website row produces a console warning, no synonyms, and a fallback `deprecated` category—even for a new icon.
Neither `generate:icons` nor `build:icons` updates this JSON.

The current search lowercases the query and removes its whitespace, but compares synonym strings literally.
Use lowercase single-word terms and add a compact equivalent for important phrases, such as `screenreader` alongside `screen reader`.
Verify intended queries in the website's [Icons catalogue](../../site/docs/foundations/assets/index.mdx), including outline-only and solid-only filtering. Storybook's icon search matches component names and does not test website synonyms.
The [Excel importer](https://github.com/jpmorganchase/salt-ds/blob/main/scripts/makeSynonym.mjs) replaces the whole JSON from `scripts/Icons Synonym List.xlsx`; that workbook is not in this checkout, so do not use it for a targeted metadata edit.

For an artwork-only correction that preserves the meaning and names, retain existing inventory, category, and synonym entries unless the correction requires a specific metadata change.
For a compatible rename, preserve the old exports and update the [recipe aliases](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/artwork/generate.mjs), [component deprecation metadata](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/scripts/generateIcons.mjs), and website metadata deliberately.
Changesets are authored separately; generation does not create release notes or update README counts.

## Commands and acceptance

Run these from the **repository root** using the project's Yarn setup. Both artwork generation and validation require installed **Google Chrome**, launched through the repository's existing Playwright dependency for painted-bound measurements:

```sh
yarn workspace @salt-ds/icons generate:icons
yarn workspace @salt-ds/icons validate:icons

# Check metadata and generated integration for the changed basename(s):
yarn node packages/icons/skills/salt-icons/scripts/check-integration.mjs --repo . new-name

# Rebuild components and CSS from existing src/SVG files only:
yarn workspace @salt-ds/icons build:icons

# Verify generated React behavior and TypeScript integration:
yarn test:components packages/icons/src/__tests__/__e2e__/icon.browser.test.tsx
yarn typecheck

# Record consumer-visible changes when applicable:
yarn changeset
```

### Use the existing review surfaces

Launch the site or Storybook from the repository root. A fresh checkout first needs the normal `yarn build` setup described in [CONTRIBUTING.md](https://github.com/jpmorganchase/salt-ds/blob/main/CONTRIBUTING.md).
Follow the [site README](https://github.com/jpmorganchase/salt-ds/blob/main/site/README.md) for its environment and snapshot setup.

```sh
# Site catalogue, after its environment setup:
yarn workspace @salt-ds/site gen:snapshot
yarn workspace @salt-ds/site serve

# Storybook:
yarn storybook
```

Use the site's [Icons catalogue](../../site/docs/foundations/assets/index.mdx) for family comparisons, synonym search, category placement, and outline/solid filtering.
Use Storybook's [Icons/Icon](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/stories/icon.stories.tsx) stories, including All Icons and All Icons With Search, for the generated React components.
The [Icons/Icon/Icon QA](https://github.com/jpmorganchase/salt-ds/blob/main/packages/icons/stories/icon.qa.stories.tsx) stories cover **Icon Sizes**, **All Icons** and **CSS Background** rendering. Use the Storybook toolbar to select density and light/dark mode for catalogue review; QAContainer-based stories already show their density and background combinations. Review legibility in the relevant existing component stories or documentation examples.

Before editing artwork, retain generated before renders and classify each finding as a confirmed regression, an existing defect or an optional preference. Record the observed problem and intended improvement. Compare before and after for the entire affected semantic family, including related controls in other categories, at native **12px and 16px** and enlarged. Accept a correction only when it improves the identified problem without weakening recognition, family balance or retained landmarks; rework or revert a candidate that fails that comparison.

For a replacement of established artwork, retain the previous system set as the recognition baseline, with status meaning and distinction at 12px taking priority over decorative detail. Compare candidates with names hidden and without semantic color, then in their normal interface context. Record visual judgment separately from human recognition feedback; geometry validation alone cannot establish equal recognizability.

Inspect each changed variant and its affected family at native **12px and 16px** on **light and dark** backgrounds, plus an enlarged view. Check generated components at the themed defaults **1.333333 in high/medium** and **1 in low/touch/mobile**, compare the numeric SVG reference at **0.67**, and inspect the configured weights used by the interface. Temporarily set `--salt-size-icon-strokeWidth` on the review container to compare explicit widths through **1.5**; verify final fitted gaps and bounds at each chosen width.
Use existing size controls where available. For an exact native size, temporarily set `--saltIcon-size` to `12px` or `16px` and confirm its computed dimensions; the `size` prop is a density-based multiplier. Use `32px` or `64px` for enlarged inspection and a temporary CSS outline on the SVG to inspect its view box. Keep these review adjustments in the browser rather than adding permanent QA stories.
Review both components and CSS-mask rendering. Verify what was actually rendered and report the sizes, stroke widths, backgrounds and variants inspected. For outline/solid comparisons, temporarily overlay or alternate the variants in the same icon box and inspect retained landmarks as well as overall bounds. Use the final generated geometry: reversing the export fit for a recipe check can hide visible movement between the shipped variants. Compare shared positive and inverse contours and placement exactly within each pair after composition. The standalone Checkmark and ProgressComplete ticks also share identical anchors. Compare Error and Warning against their reviewed container-specific marks, then judge the family's apparent emphasis together. Verify that stroke overrides change the outlined container while preserving these filled symbols.

For a review across the full standard scale, cover size multipliers 1–4 at each density, with both backgrounds and available variants. The 12px minimum applies after the density base is multiplied:

| Density      | Rendered sizes (px) | Primary width |
| ------------ | ------------------- | ------------- |
| High         | 12, 20, 30, 40      | 1.333333      |
| Medium       | 12, 24, 36, 48      | 1.333333      |
| Low          | 14, 28, 42, 56      | 1             |
| Touch/mobile | 16, 32, 48, 64      | 1             |

Hide names for the first recognition pass and record the observed object, action or uncertainty before consulting the catalogue mapping. Then check the intended meaning and relevant interface context. Revisit any feature that disappears, merges or changes the apparent meaning at smaller sizes. Use enlarged views to diagnose the construction, then confirm the correction at native sizes. An automated geometry pass or a label-assisted reading is not evidence that the drawing communicates its meaning.

When correcting legibility in a component, compare before and after in an existing documentation example that uses the icon, or an equivalent native control if no such example exists. Use the relevant density, background and control state. Keep the component's normal icon size, color and spacing during the comparison. Compare apparent weight, internal mark placement and the outline/solid transition; shared source coordinates alone do not establish a stable rendered pair. Compare related icons in the same context, and confirm that lighter secondary details also remain visible in the baked SVG and CSS-mask assets.

### Close a catalogue finding explicitly

Record each reviewed name as corrected or retained with a specific family rationale. Distinguish actual connected-member welds from independent contour softening in openings and silhouettes, ordinary frame bends, separate objects and established glyphs. A pass for the outside silhouette does not establish that internal joins were inspected. Record the exposed sectors at every connection and evaluate the minimum curvature through each intended transition at the final stroke width. Neither one welded sector nor one broad nearby curve proves that the whole connection passes. Resolve decisions across exact aliases and all members using a shared recipe before closing the finding.

For arrow corrections, compare inner shaft/head roots while preserving the point, direction, flat ends and useful straight arm lengths. For circular tracks, construct the transition on the actual curve so a helper cap cannot float beyond it. For outline/solid repairs, compare the complete fitted pair: both variants must retain the intended connection, overlap or separation, and a solid fill must not conceal an unfinished join.

Check transparent counters independently of welds. Verify paper remains open in Print, tile openings survive in Grid, control handles remain distinct in Type, lid/body relationships match in Storage, and a new curved action still has contour-following clearance in Cloud. Use the final exports and generated components; helper names or the presence of curve commands are insufficient evidence.

### Generated intersection inventory

Use `yarn workspace @salt-ds/icons audit:icons` after generation to build the local intersection map at `dist/icon-junction-review/index.html`. It lists every export, traced curved treatments (structural welds and selected softened openings), independently discovered candidate contacts, and current review coverage. Candidate contacts are questions for review, not confirmed defects. An empty candidate list is not visual approval.

Shared constructions in `junctions.mjs` and `structural-junctions.mjs` report each of their curved sectors automatically. Their review metadata is removed before production SVG optimization; it does not add attributes or change paint in shipped icons. Reuse these constructions when they fit the family. A custom construction can call `traceJunctions(body, features)` with its existing exact curve variables; do not maintain a second drawing or hand-written fitted coordinate windows for the review. Post-fit shared marks and other custom contours remain visible to independent discovery until they expose equivalent construction evidence. The review map opens with both traced joins and independently scanned contacts/corners visible. A zero traced-feature count means no curved treatment has been traced; it never proves the drawing has no joins. Distinguish structural welds from selected softened apertures: Grid's independent square cells do not meet each other even though their outline inside corners are softened. In the solid Grid, those same corner curves sit beneath fill and do not count as exposed openings. Bank's roof opening and its column attachments both follow the interior-corner default, while retaining distinct aperture and structural classifications. Battery's two recessed terminal shoulders are an example of custom curves that must be traced in the shared outline/solid recipe.

The map measures each declared curve on the final exported paint at reference, both default and heavy widths. Exposure must include the middle of that curve: adjacent straight edges and another nearby curve cannot establish a completed weld. The observations distinguish visible, submerged, occluded and uncertain transitions. A join hidden by a solid fill is a separate decision from a missing exposed weld.

For a new or changed icon:

1. Compose the closest shared family and register the artwork normally. Generate the exports, then run the audit.
2. Inspect the numbered locations and the complete unmarked drawing, including all exposed sectors. Confirm native 12px/16px recognition, both backgrounds and all four widths. The detector is a conservative geometry aid and can miss meaningful relationships; do not restrict visual review to its dots.
3. Use the generated `decision-templates.json` entry to record the review in `scripts/artwork/junction-reviews.json`. Supply a reviewer, rationale and actual visual coverage. Classify remaining generated feature IDs as required weld, intentional sharp feature, separate objects, hidden join or compact-size exception, with a specific reason. Multiple equivalent features may share one decision; no coordinates are copied. Shared joins measured as visible inherit their construction treatment but still require the icon's visual review. A required custom weld needs construction evidence before it can pass.
4. Rerun the audit. Its fingerprint invalidates approval when the artwork, recipe, generated evidence or semantic analysis version changes. A comment or formatting change in the audit implementation does not invalidate otherwise identical evidence. Unchanged analyses are cached; changing one icon normally recomputes only that icon. Never copy a new fingerprint onto an old decision without reviewing the change.

New exports are checked during `validate:icons`; only the frozen existing-catalogue migration remains pending. Adding a new icon therefore requires a current intersection review, without editing the skill or writing a one-off geometry test. The existing catalogue starts **pending**, even where earlier geometry tests pass. This is a migration record, not a claim that the existing set fails visually. `yarn workspace @salt-ds/icons check:icon-reviews` is the strict completion check: it fails until every export has a current, complete decision. Keep this separate from normal geometry validation while the existing set is being inventoried. The ordinary audit also fails for stale approvals, while producing the report needed to resolve them.

The skill remains a short entry point into this canonical workflow. Adding an icon should not require editing the skill, creating a new validator, or duplicating these rules. Add focused regressions only for behaviour that the shared checks do not cover.

### Automated checks and acceptance

The artwork validator uses installed Chrome and checks numeric reference strokes, actual fitted occupancy, the default or documented optical center, clipping and exact alias fits. It reads `scripts/artwork/view-box-transforms.json` to invert the export fit for the existing reference-geometry clearance and alignment regressions. Those reference checks complement the raw fitted-output checks; they do not replace inspection of final gaps at the configured stroke width. Shared-mark checks must compare outline/solid placement exactly and preserve each status container's reviewed mark. Update an outdated cross-container equality check when an accepted optical correction deliberately changes those dimensions; retain pair and sibling regression coverage. Component tests cover configurable React stroke behavior that is not already covered by QA stories, such as native prop handling, inherited CSS values and local override precedence. Use the existing QA stories for visual size, density and appearance coverage; avoid duplicating those cases in component tests.
The internal-junction regression check samples final exposed paint at width 1.5 for the reviewed Settings valleys, thumb webs and representative Print, Type, Grid and Storage joins. It also checks the reviewed Buildings ground sectors, Building doorway, Battery terminal, speech tails, Call receiver roots and Pin attachments. It rejects curves submerged by the stroke as well as missing curves. These bounded checks protect those features; they do not replace inspection of every internal join.

The detail-recognition regression checks all four widths for Dashboard's separate ticks, Edit's connected silhouette and pair bounds, and the straight arms and exposed root curves in cloud and panel arrows. It also covers every rotated panel state. These probes complement the complete unmarked drawing and native-size review; they do not establish recognition for every arrow in the catalogue.

Its pass does not establish semantic accuracy or consistency with the icon family; complete the visual review.

Report source inspection, numeric geometry checks, generated-component review, CSS-mask review and human recognition feedback as separate coverage. A sampled family review or a passing full-catalogue validator does not establish that every export has received visual or brand approval. Keep unresolved design choices distinct from confirmed construction defects.
The integration checker is scoped to the supplied basenames and their registered variants; it does not require unrelated legacy metadata cleanup. Preserve intentional deprecated entries that are absent from the supported synonym catalogue, including List and the old LineChart family. Keep their component deprecation annotations and replacements explicit; document the raw missing-metadata findings as compatibility exceptions instead of restoring them as supported catalogue rows. Existing spaced synonyms may still produce raw warnings when a compact alias makes the query effective: retain useful terms and verify the real query results.
Also verify real website search behavior: a metadata/schema check alone cannot establish useful search terms.

- [ ] Meaning, direction, and state are clear beside their companion icons; compound icons record the chosen modifier and placement, with deliberate family exceptions explained.
- [ ] Apparent size, spacing, terminals, and curved junctions fit the related family; record a reference comparison and the final visible weld proportion or shape. Intended welded joins remain visible at supported weights, useful straight members remain, and separate objects retain transparent clearance.
- [ ] Outline and solid retain the same subject silhouette, feature positions and proportional line widths in the final fitted exports. Preserve useful rims without repainting cutouts; when a preferred solid leads the pair, review an inset outline and its small-size counters instead of expanding the solid.
- [ ] Lettering uses the shared contours and has readable spacing/counters.
- [ ] Cutouts follow the actual foreground, including curves, endpoints, and corners.
- [ ] Each ordinary export meets the default 15.5-unit centered fit or its documented optical target at width 1.5; the brand and full-canvas surface exemptions retain their 16-unit frames.
- [ ] At the reference, density defaults and selected override widths, fitted paint stays inside the viewBox and final gaps remain useful.
- [ ] Native 12px and 16px renders work on light and dark backgrounds; enlarged views reveal no malformed geometry or unintended pinholes inside welded joins, including at the thin reference width.
- [ ] Effective recipes, sorted inventory, the generated fit manifest, website category metadata, public exports and exact aliases are consistent.
- [ ] Website synonym entries match the generated names; intended queries and variant filters find the icons in the appropriate website category.
- [ ] README counts reflect inventory changes, and consumer-visible changes have a changeset.
- [ ] Relevant generation, validation, and integration checks pass; the final generated diff matches the intended scope.

### Preserve curved-arrow alignment

Use `alignedCurvedArrow` in `scripts/artwork/curved-arrow.mjs` for the reviewed curved-arrow families. Author an open shaft starting at its head tip, followed by its two outward arm vectors. The helper replaces only the nearby approach, retains the head and distant curve, and derives the local inner fillets from the corrected curve. Keep the head arms, circle or other body, numerals and additional marks consistent within the family.

Normal artwork validation checks the final exported curves independently: it discovers the two straight head arms at a curved shaft endpoint, compares their bisector with the arriving tangent, and requires the expected number of heads. The 0.1-degree tolerance accommodates export rounding; it is not a general perceptual threshold. Add a new family to this relationship check rather than copying per-icon coordinates. Existing constructor tests also exercise circular, cubic and mirrored approaches.

Passing alignment does not approve weld strength, curvature, clear arms, visible weight or small-size recognition. Inspect the native 12px/16px before/after family, actual components and CSS masks as usual. A tangent approach should look natural rather than introducing an abrupt flat or bump into the curve.

### Compare painted pair contours

Run `yarn workspace @salt-ds/icons audit:pairs` to compare all discovered outline/solid pairs in their final exported frames. `dist/icon-pair-review/pairs.json` reports each pair at widths 0.67, 1, 4/3 and 1.5. Normal artwork validation runs the same check. `check:pair-reviews` is the strict completion gate and fails while any pair needs review.

The reusable check traces the exterior of every connected painted component at 32 samples per final viewBox unit, including detached symbols inside a frame. It ignores enclosed holes that intentionally fill, but catches changed points, shoulders, proportions, component counts and positions. A maximum contour displacement of 0.05 units accommodates raster rounding; matching bounding boxes alone does not pass. It does not assess inverse marks, internal hole shape, weld quality, recognition or perceived weight. Those require their own retained-feature checks and visual review.

Declare the intended relationship and reason once in `pair-contracts.mjs`. Use `component-exteriors` where only enclosed surfaces fill, or `identical-paint` for intentional compatibility aliases. Prefer a shared construction such as `retainedSurface` and a shared optical frame when appropriate. No per-icon pixel coordinates or new test script are needed. A contract is an assertion to test, not an approval. The Sparkle, Sparkle refresh, Favorite and Like families initially use the exterior contract; existing open-line compatibility variants require identical paint.

Unclassified existing pairs are explicitly **needs-review**, even when their contours match. New pairs outside the existing review-migration inventory must declare a relationship; missing contracts fail validation. Do not extend that legacy inventory to bypass the requirement. If an inverse mark or connected surface cannot use the existing modes, add reusable semantic coverage rather than an unexplained exception or treating a bounding-box match as approval.

### Compare glyph size with an earlier set

Run `yarn workspace @salt-ds/icons compare:glyph-sizes --baseline <git-revision>` with an explicitly chosen historical revision. The read-only command preserves each original SVG viewBox and compares original and current paint in equal display boxes. For the pre-redraw Salt set, use `1beb88c50af5b4642cf701f22f0cf7d09e48fd40`, immediately before the first generated redraw commit.

Open `dist/icon-glyph-comparison/index.html` for native-size comparisons and enlarged overlays; `measurements.csv` records the default 12px and 16px combinations, and `comparison.json` contains all four widths, source hashes and baseline identity. The page also supports the published larger display sizes. Bounds use a 50% alpha threshold at 64 samples per normalized display unit. Ink area uses alpha coverage and is reported separately from width and height. These are geometric measurements, not a human apparent-size or recognition score. Rebuild the report after artwork changes.

Keep alias exports visible because their historical glyphs can differ, but do not interpret export counts as independent meanings. Treat missing historical names as new rather than inventing a comparison. Review large changes within their families, prioritizing status and navigation; preserve useful pixel alignment and deliberate optical exceptions instead of applying a blanket scale factor.
