/**
 * Salt icon set part — provides the bespoke `salt-icons.woff` font + the
 * Salt-specific codepoints for every icon AG Grid renders.
 *
 * Implementation strategy:
 *   1. Use AG Grid v3's `iconOverrides({ type: 'font', family, icons })`
 *      factory to generate one `.ag-icon-{key}::before { content: '\eXXX';
 *      font-family: 'salt-icons'; }` rule per icon. AG Grid scopes that CSS
 *      inside a `:where(.ag-theme-iconSet-N)` block.
 *   2. Inject the @font-face declaration at the *document root* (NOT inside
 *      the part's scoped CSS) via a side-effect at module import time.
 *      @font-face is invalid CSS inside a selector block — browsers ignore
 *      it — so it MUST live at top level. The injection is idempotent
 *      (guards on a fixed-id `<style>` element) and SSR-safe.
 *
 * Ported verbatim from `packages/ag-grid-theme/css/salt-icons.css` (2.x line).
 * Icon names are kebab-case to match AG Grid's internal `.ag-icon-{name}`
 * class selectors.
 *
 * Note on `iconSize`: in 2.x this lived alongside the icon codes via
 * `ag-root-var.css:30` (`--ag-icon-size: max(var(--salt-size-icon), 12px)`).
 * In v3 it's a typed theme param on `SharedThemeParams`, so it lives in
 * `saltTheme.withParams({ iconSize: ... })` instead of here.
 *
 * Note on `feature`: `iconOverrides` returns a part WITHOUT
 * `feature: "iconSet"`, which means it composes with (rather than replaces)
 * any other icon set in the theme. Because `saltTheme` starts from
 * `createTheme()` (empty) and adds no other icon set, this is the correct
 * behaviour — the Salt icons are the only ones loaded. Consumers can still
 * swap in a built-in set via `saltTheme.withPart(iconSetQuartz())` etc.
 */
import { iconOverrides } from "ag-grid-community";
import saltIconsFontFace from "../css/salt-icons.css?inline";

// Inject the @font-face at the document root. Idempotent + SSR-safe.
if (typeof document !== "undefined") {
  const id = "salt-ag-grid-theme-icons-font-face";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = saltIconsFontFace;
    document.head.appendChild(style);
  }
}

/**
 * 57 icon name → codepoint mappings ported from
 * `packages/ag-grid-theme/css/salt-icons.css` lines 12-66.
 */
const SALT_ICONS: Record<string, string> = {
  aggregation: "\ue900",
  arrows: "\ue901",
  asc: "\ue902",
  cancel: "\ue903",
  chart: "\ue904",
  "checkbox-checked": "\ue905",
  "checkbox-indeterminate": "\ue906",
  "checkbox-unchecked": "\ue907",
  "color-picker": "\ue908",
  columns: "\ue909",
  contracted: "\ue90a",
  copy: "\ue90b",
  cross: "\ue90c",
  csv: "\ue90d",
  cut: "\ue90e",
  desc: "\ue90f",
  down: "\ue910",
  excel: "\ue911",
  expanded: "\ue912",
  "eye-slash": "\ue913",
  eye: "\ue914",
  // `filter-clear` is a legacy alias the latest AG Grid no longer ships;
  // kept for backwards compatibility (mirrors the comment in salt-icons.css)
  "filter-clear": "\ue915",
  filter: "\ue915",
  "filter-filled": "\ue916", // Salt-specific icon
  first: "\ue917",
  grip: "\ue918",
  group: "\ue919",
  last: "\ue91a",
  left: "\ue91b",
  linked: "\ue91c",
  loading: "\ue91d",
  maximize: "\ue91e",
  "menu-alt": "\ue91f",
  menu: "\ue920",
  minimize: "\ue921",
  minus: "\ue922",
  next: "\ue923",
  none: "\ue924",
  "not-allowed": "\ue925",
  paste: "\ue926",
  pin: "\ue927",
  pivot: "\ue928",
  plus: "\ue929",
  previous: "\ue92a",
  "radio-button-off": "\ue92b",
  "radio-button-on": "\ue92c",
  right: "\ue92d",
  save: "\ue92e",
  "small-down": "\ue92f",
  "small-left": "\ue930",
  "small-right": "\ue931",
  "small-up": "\ue932",
  tick: "\ue933",
  "tree-closed": "\ue934",
  "tree-indeterminate": "\ue935",
  "tree-open": "\ue936",
  unlinked: "\ue937",
  up: "\ue938",
};

export const saltIconSet = iconOverrides({
  type: "font",
  family: "salt-icons",
  // Pin to regular weight (400). `.ag-icon::before` would otherwise inherit
  // `font-weight` from its container — e.g. headers carry
  // `font-weight: var(--salt-text-label-fontWeight-strong)` (600), causing
  // the browser to apply synthetic-bold to the salt-icons font glyphs.
  // The font isn't designed for heavy weights, so the result is visibly
  // thickened / "layered" icon strokes (verified via DevTools:
  // computed `font-weight: 600` on `.ag-header-cell .ag-icon::before`).
  // Setting `weight: 400` here makes `iconOverrides` emit
  // `font-weight: 400` on every `.ag-icon-XXX::before` rule, breaking the
  // inheritance and rendering glyphs at their designed regular weight.
  // (Phase 7 finding 2026-06-14.)
  weight: 400,
  icons: SALT_ICONS,
});

