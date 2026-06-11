/**
 * Plain-object opt-in defaults for `<AgGridReact>` (proposal §4.2 + §9 decision 3).
 *
 * Consumers spread this (or skip it entirely) into their grid:
 *
 *   ```tsx
 *   import { saltTheme, saltAgGridDefaults } from "@salt-ds/ag-grid-theme";
 *   <AgGridReact theme={saltTheme} {...saltAgGridDefaults} ... />
 *   ```
 *
 * Overrides are just additional props placed after the spread. Grid-instance
 * management (`apiRef`, `isGridReady`, `sizeColumnsToFit` on ready) is generic
 * AG Grid plumbing and stays in consumer code — see the §9 reversal of
 * decision 3 (no `useSaltAgGrid()` hook; nothing reactive to do).
 */
import type { AgGridReactProps } from "ag-grid-react";

export const saltAgGridDefaults = {
  defaultColDef: { filter: true, resizable: true, sortable: true },
} satisfies Partial<AgGridReactProps>;

