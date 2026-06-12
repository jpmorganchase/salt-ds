/**
 * The default Salt theme for AG Grid v33+, built on the new Theming API.
 *
 * This is the Phase 0 spike implementation of `MIGRATION_PROPOSAL.md` §4.3,
 * incorporating the two resolutions decided 2026-06-11:
 *   - Resolution 1: tab params live on the dedicated `saltTabStyle` part
 *     (proposal §4.6.3) rather than inline here.
 *   - Resolution 2: `accentColor` uses the modern `--salt-actionable-accented-bold-background`
 *     token (per §2.1 token rename).
 *
 * Phase 0 scope:
 *   - Stand up the part composition + `withParams({...})` block with full type-checking.
 *   - Prove that no `as any` is required for any param value.
 *   - Provide a `Default` story (`stories/v3/`) that consumers can side-by-side
 *     diff against the legacy 2.x render.
 *
 * What is NOT yet in Phase 0 (lands Phase 1+):
 *   - Real CSS bodies for the Salt-specific parts (saltCellStates, saltFocusRing,
 *     saltRangeSelectionAdjustments, saltCheckboxStyle, saltColumnDropStyle's
 *     hover/active/expanded cascade).
 *   - WOFF + codepoints registration on `saltIconSet`.
 *   - Header / row variant parts beyond the "primary" defaults
 *     (`saltHeader{Secondary,Tertiary}`, `saltHeaderDivider{Secondary,Tertiary,None}`,
 *     `saltRowVariant{Secondary,Tertiary}`, `saltZebra`).
 *
 * Usage:
 *   ```tsx
 *   import { saltTheme, saltAgGridDefaults } from "@salt-ds/ag-grid-theme";
 *   <AgGridReact theme={saltTheme} {...saltAgGridDefaults} ... />
 *   ```
 *
 * Note on `colorSchemeVariable`: Salt's `--salt-*` tokens already react to
 * `SaltProvider`'s `data-mode` attribute one level up, so the default theme
 * does NOT add AG Grid's `colorSchemeVariable` part. Consumers who need
 * AG Grid's own `data-ag-theme-mode` switch can opt in with
 * `saltTheme.withPart(colorSchemeVariable)` (proposal §4.8).
 */
import { checkboxStyleDefault, createTheme } from "ag-grid-community";
import { saltCellStates } from "./parts/saltCellStates";
import { saltCheckboxStyle } from "./parts/saltCheckboxStyle";
import { saltColumnDropStyle } from "./parts/saltColumnDropStyle";
import { saltFocusRing } from "./parts/saltFocusRing";
import { saltHeaderDividerPrimary } from "./parts/header/saltHeaderDividerPrimary";
import { saltHeaderPrimary } from "./parts/header/saltHeaderPrimary";
import { saltIconSet } from "./parts/saltIconSet";
import { saltInputStyle } from "./parts/saltInputStyle";
import { saltRangeSelectionAdjustments } from "./parts/saltRangeSelectionAdjustments";
import { saltTabStyle } from "./parts/saltTabStyle";

export const saltTheme = createTheme()
  // ---------- parts ----------
  .withPart(saltIconSet)
  .withPart(checkboxStyleDefault) // base checkbox rendering CSS; saltCheckboxStyle overlays Salt colours + sizing
  .withPart(saltCheckboxStyle)
  .withPart(saltInputStyle)
  .withPart(saltColumnDropStyle)
  .withPart(saltTabStyle) // owns tabSelectedUnderline{Color,Width} + bespoke tab CSS — see §4.6.3
  .withPart(saltHeaderPrimary) // default; swappable via saltHeader{Secondary,Tertiary}
  .withPart(saltHeaderDividerPrimary) // default; swappable via saltHeaderDivider{Secondary,Tertiary,None}
  .withPart(saltCellStates) // app-level state classes (.error-cell, ...)
  .withPart(saltFocusRing) // unified focus rings
  .withPart(saltRangeSelectionAdjustments) // cross-cell outline, fill handle, etc.
  // ---------- parameters (the salt-tokens bridge) ----------
  .withParams({
    // sizing
    spacing: "var(--salt-spacing-50)",
    rowHeight: "calc(var(--salt-size-base) + var(--salt-spacing-100))",
    headerHeight: "calc(var(--salt-size-base) + var(--salt-spacing-100))",
    listItemHeight: "calc(var(--salt-size-base) + var(--salt-spacing-100))",
    // iconSize ported from `ag-root-var.css:30` (`--ag-icon-size: max(...)`). Lives
    // in the theme rather than in `saltIconSet` because `iconOverrides` doesn't
    // accept it and `rowGroupIndentSize` below references it via `{ calc: "iconSize + spacing" }`.
    iconSize: "max(var(--salt-size-icon), 12px)",
    cellHorizontalPadding: "var(--salt-spacing-100)",
    widgetContainerHorizontalPadding: "var(--salt-spacing-100)",
    rowGroupIndentSize: { calc: "iconSize + spacing" },

    // typography
    fontFamily: "var(--salt-text-fontFamily)",
    fontSize: "var(--salt-text-fontSize)",
    headerFontSize: "var(--salt-text-label-fontSize)",
    headerFontWeight: "var(--salt-text-label-fontWeight-strong)",

    // colours — key
    backgroundColor: "var(--salt-container-primary-background)",
    foregroundColor: "var(--salt-content-primary-foreground)",
    accentColor: "var(--salt-actionable-accented-bold-background)",
    invalidColor: "var(--salt-status-error-foreground-informative)",

    // colours — chrome / menus
    // (headerBackground/Hover/Text & headerRowBorder are set by the header parts above)
    chromeBackgroundColor: "var(--salt-container-primary-background)",
    menuBackgroundColor: "var(--salt-container-primary-background)",
    tooltipBackgroundColor: "var(--salt-container-primary-background)",
    modalOverlayBackgroundColor: "var(--salt-overlayable-background)",

    // colours — rows
    cellTextColor: "var(--salt-content-primary-foreground)",
    rowHoverColor: "var(--salt-selectable-background-hover)",
    selectedRowBackgroundColor: "var(--salt-selectable-background-selected)",

    // colours — range selection
    rangeSelectionBackgroundColor: "var(--salt-overlayable-background-rangeSelection)",
    rangeSelectionHighlightColor: "var(--salt-overlayable-background-highlight)",
    rangeSelectionBorderStyle: "none",

    // borders (composite values, see Borders docs)
    borderColor: "var(--salt-separable-secondary-borderColor)",
    rowBorder: { width: "var(--salt-size-fixed-100)", color: "var(--salt-separable-tertiary-borderColor)" },
    columnBorder: false,
    wrapperBorder: false, // matches `ag-root-var.css` lines 78–83 today
    headerColumnBorder: { width: "var(--salt-size-fixed-100)", color: "var(--salt-separable-tertiary-borderColor)" },
    headerColumnBorderHeight: "calc(var(--salt-size-base) / 2 - 2px)",
    borderRadius: "var(--salt-palette-corner)",

    // inputs
    inputBorder: { color: "var(--salt-editable-borderColor)" },
    inputFocusBorder: { color: "var(--salt-editable-borderColor-hover)" },
    inputFocusShadow: "none",

    // tabs — see saltTabStyle part (§4.6.3) for tabSelectedUnderline{Color,Width}

    // overlays
    popupShadow: "var(--salt-overlayable-shadow-modal)",

    // value change deltas
    valueChangeDeltaUpColor: "var(--salt-sentiment-positive-foreground-decorative)",
    valueChangeDeltaDownColor: "var(--salt-sentiment-negative-foreground-decorative)",
  });

/**
 * Optional factory for consumers who want to override Salt defaults at build
 * time. Returns `saltTheme` unchanged if no overrides are supplied.
 */
export const createSaltTheme = (
  overrides?: Parameters<typeof saltTheme.withParams>[0],
) => (overrides ? saltTheme.withParams(overrides) : saltTheme);

