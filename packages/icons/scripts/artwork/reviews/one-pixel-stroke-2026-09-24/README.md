# Low-density one-pixel stroke — 24 September 2026

The user requested the proposed stroke-weight adjustment after the native-size review.

## Change

Set `--salt-size-icon-strokeWidth` to `1.142857` (approximately 8/7) in `.salt-density-low`. At the default 14px icon size, `1.142857 × 14 / 16 ≈ 1` CSS pixel, up from 0.875. High/medium remain approximately 4/3 at the component's minimum 12px; touch/mobile remain 1 at 16px.

The SVG recipes, filled shapes, generated exports, base icon sizes and local override precedence are unchanged by this adjustment. Larger size multipliers still scale the configured stroke; this does not introduce a non-scaling stroke or optical variants. Secondary strokes retain their proportions. Baked SVG/CSS-mask widths remain 0.67 and do not inherit the theme token.

Active design/contribution/size guidance, examples and maintenance documentation now distinguish the three themed weights. Existing four-anchor geometry audit coverage is described accurately; native review explicitly includes 8/7.

## Verification

- Theme build passed.
- 22 browser icon tests passed, including four new checks of actual rendered primary stroke width at high, medium, low and touch density, plus the secondary-hand ratio.
- The normal Yarn test shortcut could not resolve its runner in the current installation. The same browser configuration and test file passed when invoked with the installed Vitest 4.1.11 runner directly. No dependency or lockfile changes were made.
- All 550 generated React icons were loaded from the existing Storybook. Their low-density computed dimensions were 14×14px and their stroke token was 1.142857. See `live-metrics.json`.
- Seven catalogue sheets show all 550 icons before/after at 14px DPR 1 on both backgrounds: 2,200 native renderings. Coverage is recorded in `coverage.json`.
- A focused sheet reviews 38 dense-detail, arrow, status and primary-control exports using actual generated markup and Salt button styles. See `focus-coverage.json`.
- Two independent read-only agents inspected the seven original-resolution sheets (320 exports on 1–4; 230 exports on 5–7); the root agent inspected the 38-icon button sheet.
- The phone review's three sizes, three weight modes, captured/live rendering, actual stroke widths, catalogue and search passed preview checks at 390px and 1100px viewport widths.

No concrete new visual regressions were found: arrowheads and status gestures remain distinct and the reviewed counters remain open. Calendar/ColumnChooser/Globe grids, small file/timer lettering and some horizontal strokes retain their pre-existing detail or antialiasing limitations. This is an expert visual check, not a human recognition study or blanket approval of every existing drawing.

The current [phone review](https://salt-icons-review-0909.joshuawooding.chatgpt.site/native-size-review.html) uses the new default and offers the previous 14px weight for comparison. Captured 1× pixels preserve the low-resolution rendering on a higher-density phone screen.
