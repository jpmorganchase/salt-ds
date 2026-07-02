// @ts-check
/**
 * Source of truth for the `salt-icons` ag-grid icon font.
 *
 * Each entry maps an ag-grid icon name (the one referenced by AG Grid's
 * `--ag-icon-font-code-<name>` CSS custom properties in `css/salt-icons.css`)
 * to:
 *   - `source`: where the SVG comes from.
 *       - `"salt:<filename>"`  – read `packages/icons/src/SVG/<filename>.svg`
 *         from the `@salt-ds/icons` package. Use this whenever a suitable
 *         Salt icon exists; the font then auto-tracks Salt updates.
 *       - `"custom"`           – read `icons-src/<ag-grid-name>.svg` from
 *         this package. Use only when no Salt equivalent exists (e.g.
 *         composite checkbox/radio glyphs, the empty `none` placeholder).
 *   - `codepoint`: locked PUA codepoint. Mirrors `css/salt-icons.css`.
 *     **Never renumber an existing icon** — downstream CSS reads these
 *     as raw hex values. New icons should be appended starting at 0xe939.
 *
 * After editing this file, regenerate the font:
 *   yarn workspace @salt-ds/ag-grid-theme run regen-icons
 *
 * @typedef {{ source: `salt:${string}` | "custom", codepoint: number, comment?: string }} IconEntry
 * @type {Record<string, IconEntry>}
 */
module.exports = {
  aggregation:              { source: "salt:sum",                  codepoint: 0xe900 },
  arrows:                   { source: "salt:move-all",             codepoint: 0xe901 },
  asc:                      { source: "salt:sort-ascend",          codepoint: 0xe902 },
  cancel:                   { source: "salt:close",                codepoint: 0xe903 },
  chart:                    { source: "salt:chart-bar",            codepoint: 0xe904 },
  "checkbox-checked":       { source: "custom",                    codepoint: 0xe905, comment: "Composite box + tick glyph; no Salt equivalent." },
  "checkbox-indeterminate": { source: "custom",                    codepoint: 0xe906, comment: "Composite box + dash glyph; no Salt equivalent." },
  "checkbox-unchecked":     { source: "custom",                    codepoint: 0xe907, comment: "Empty box glyph; no Salt equivalent." },
  "color-picker":           { source: "custom",                    codepoint: 0xe908, comment: "Eyedropper; no Salt equivalent." },
  columns:                  { source: "salt:column-chooser",       codepoint: 0xe909 },
  contracted:               { source: "salt:chevron-right",        codepoint: 0xe90a },
  copy:                     { source: "salt:copy",                 codepoint: 0xe90b },
  cross:                    { source: "salt:close",                codepoint: 0xe90c },
  csv:                      { source: "salt:csv",                  codepoint: 0xe90d },
  cut:                      { source: "salt:cut",                  codepoint: 0xe90e },
  desc:                     { source: "salt:sort-descend",         codepoint: 0xe90f },
  down:                     { source: "salt:chevron-down",         codepoint: 0xe910 },
  excel:                    { source: "salt:xls",                  codepoint: 0xe911 },
  expanded:                 { source: "salt:chevron-down",         codepoint: 0xe912 },
  "eye-slash":              { source: "salt:hidden",               codepoint: 0xe913 },
  eye:                      { source: "salt:visible",              codepoint: 0xe914 },
  filter:                   { source: "salt:filter",               codepoint: 0xe915, comment: "Also aliased to filter-clear in css/salt-icons.css." },
  "filter-filled":          { source: "salt:filter_solid",         codepoint: 0xe916, comment: "Salt-specific (filled variant)." },
  first:                    { source: "salt:first",                codepoint: 0xe917 },
  grip:                     { source: "salt:drag-row",             codepoint: 0xe918 },
  group:                    { source: "salt:group",                codepoint: 0xe919 },
  last:                     { source: "salt:last",                 codepoint: 0xe91a },
  left:                     { source: "salt:chevron-left",         codepoint: 0xe91b },
  linked:                   { source: "salt:linked",               codepoint: 0xe91c },
  loading:                  { source: "salt:loader",               codepoint: 0xe91d },
  maximize:                 { source: "salt:maximize",             codepoint: 0xe91e },
  "menu-alt":               { source: "salt:overflow-menu",        codepoint: 0xe91f, comment: "Hamburger variant — used for column header menu trigger." },
  menu:                     { source: "salt:menu",                 codepoint: 0xe920 },
  minimize:                 { source: "salt:minimize",             codepoint: 0xe921 },
  minus:                    { source: "salt:remove",               codepoint: 0xe922 },
  next:                     { source: "salt:chevron-right",        codepoint: 0xe923 },
  none:                     { source: "custom",                    codepoint: 0xe924, comment: "Empty placeholder glyph (no-sort indicator)." },
  "not-allowed":            { source: "salt:not-allowed",          codepoint: 0xe925 },
  paste:                    { source: "salt:paste",                codepoint: 0xe926 },
  pin:                      { source: "salt:pin",                  codepoint: 0xe927 },
  pivot:                    { source: "salt:pivot",                codepoint: 0xe928 },
  plus:                     { source: "salt:add",                  codepoint: 0xe929 },
  previous:                 { source: "salt:chevron-left",         codepoint: 0xe92a },
  "radio-button-off":       { source: "custom",                    codepoint: 0xe92b, comment: "Empty circle glyph; no Salt equivalent." },
  "radio-button-on":        { source: "custom",                    codepoint: 0xe92c, comment: "Circle with dot glyph; no Salt equivalent." },
  right:                    { source: "salt:chevron-right",        codepoint: 0xe92d },
  save:                     { source: "salt:save",                 codepoint: 0xe92e },
  "small-down":             { source: "salt:triangle-down",        codepoint: 0xe92f },
  "small-left":             { source: "salt:triangle-left",        codepoint: 0xe930 },
  "small-right":            { source: "salt:triangle-right",       codepoint: 0xe931 },
  "small-up":               { source: "salt:triangle-up",          codepoint: 0xe932 },
  tick:                     { source: "salt:checkmark",            codepoint: 0xe933 },
  "tree-closed":            { source: "salt:chevron-right",        codepoint: 0xe934 },
  "tree-indeterminate":     { source: "custom",                    codepoint: 0xe935, comment: "Partial-select marker; no Salt equivalent." },
  "tree-open":              { source: "salt:chevron-down",         codepoint: 0xe936 },
  unlinked:                 { source: "salt:unlinked",             codepoint: 0xe937 },
  up:                       { source: "salt:chevron-up",           codepoint: 0xe938 },
};

