# AG Grid icon font sources

`src/fonts/salt-icons.woff` is generated from the SVGs in this folder with
[fantasticon](https://github.com/tancredi/fantasticon). Each SVG is named after
its [AG Grid icon key](https://www.ag-grid.com/javascript-data-grid/custom-icons/),
and `codepoints.json` pins each icon to its codepoint.

## Adding an icon

1. Copy the SVG into this folder, named after the AG Grid icon key (for example
   `cp ../../../icons/src/SVG/<salt-icon>.svg ./<ag-grid-icon-key>.svg`). Icons are
   scaled to fill the font's em square, so any square `viewBox` works. Holes drawn
   with `fill-rule="evenodd"` are converted automatically, because fonts only
   support the nonzero fill rule.
2. Run `yarn build:icons` from `packages/ag-grid-theme`. New icons are assigned the
   next codepoint after the current highest and saved to `codepoints.json`.
3. Add the `--ag-icon-font-code-*` line the script prints to `src/css/salt-icons.css`.
4. Add the icon key to `providedIcons` in `src/examples/Icons.tsx`.

To change an existing icon, replace its SVG and rerun `yarn build:icons`.
Don't change or remove existing codepoints, because consumers may reference them.
