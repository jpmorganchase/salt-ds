import "./_setupV3";
/**
 * Phase 2 V3 spike — `Icons` story rendered against `saltTheme`.
 *
 * Visual catalog of all 57 salt-icons glyphs registered by `saltIconSet`.
 * Each icon name renders as `<div class="ag-icon-{name}">{name}</div>`;
 * the `saltIconSet` part injects a
 * `.ag-icon-{name}::before { content: "\eXXX"; font-family: "salt-icons" }`
 * rule per icon, so the glyph paints before the label text.
 *
 * The grid itself isn't shown — this is a doc story for the icon set,
 * not a data-grid story. The list is wrapped in a `<div class="ag-theme-…">`
 * placeholder (via the saltTheme `themeClassName` accessor) so the icon
 * font + colour cascade applies, mirroring how the icons render inside a
 * real grid.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → Icons`
 * (`packages/ag-grid-theme/src/examples/Icons.tsx`).
 */
import { saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

/**
 * All 57 icons registered by `saltIconSet` (matches `SALT_ICONS` in
 * `packages/ag-grid-theme/src/parts/saltIconSet.ts`). Source of truth lives
 * in saltIconSet.ts; the list here is a verbatim copy for the visual catalog.
 */
const providedIcons = [
  "aggregation",
  "arrows",
  "asc",
  "cancel",
  "chart",
  "checkbox-checked",
  "checkbox-indeterminate",
  "checkbox-unchecked",
  "color-picker",
  "columns",
  "contracted",
  "copy",
  "cut",
  "cross",
  "csv",
  "desc",
  "down",
  "excel",
  "expanded",
  "eye-slash",
  "eye",
  "filter",
  "first",
  "grip",
  "group",
  "last",
  "left",
  "linked",
  "loading",
  "maximize",
  "menu",
  "menu-alt",
  "minimize",
  "minus",
  "next",
  "none",
  "not-allowed",
  "paste",
  "pin",
  "pivot",
  "plus",
  "previous",
  "radio-button-off",
  "radio-button-on",
  "right",
  "save",
  "small-down",
  "small-left",
  "small-right",
  "small-up",
  "tick",
  "tree-closed",
  "tree-indeterminate",
  "tree-open",
  "unlinked",
  "up",
];

/**
 * Inline CSS for the icon catalog layout. Mirrors `Icons.css` from the
 * legacy story:
 *   - 8px gap between the icon glyph and the label text
 *   - `animation: none` on `.ag-icon-loading` so the spinner stays still
 *     for screenshot determinism (the icon set ships an `animation: spin`
 *     rule on this one icon).
 *
 * Scoped to a parent class so the rules don't leak to other stories in
 * the same Storybook iframe.
 */
const ICON_CATALOG_CSS = `
  .salt-ag-icon-catalog [class^="ag-icon"]::before {
    margin-right: var(--salt-spacing-100);
  }
  .salt-ag-icon-catalog .ag-icon-loading {
    animation: none;
  }
  .salt-ag-icon-catalog {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--salt-spacing-100) var(--salt-spacing-300);
    padding: var(--salt-spacing-200);
  }
`;

export const Icons = () => {
  // Tap saltTheme into the iframe so its part-scoped CSS
  // (.ag-icon-{name}::before content) lands on the catalog\'s children.
  // We render a dummy hidden AgGridReact so AG initialises the theme on the
  // page; the catalog list itself doesn\'t need a grid.
  return (
    <>
      <style>{ICON_CATALOG_CSS}</style>
      <div style={{ display: "none" }}>
        <AgGridReact theme={saltTheme} rowData={[]} columnDefs={[]} />
      </div>
      <div className="salt-ag-icon-catalog">
        {providedIcons.map((name) => (
          <div key={name} className={`ag-icon-${name}`}>
            {name}
          </div>
        ))}
      </div>
    </>
  );
};
