import "./_setupV3";
/**
 * Phase 2 V3 spike — `ContextMenu` story rendered against `saltTheme`.
 *
 * Right-click on any cell to open the custom context menu. Exercises
 * `getContextMenuItems` with the full variation set the legacy story
 * carried:
 *   - `name: "Alert ..."` with `action()` callback + custom `cssClasses`
 *     (`["redFont", "bold"]`) — those classes don't have global CSS
 *     defined; AG just applies them, no-op styling-wise but useful for
 *     consumer-defined per-item theming.
 *   - `disabled: true` + `tooltip` long-string variant
 *   - Nested `subMenu` (Country with 3 items, Person with 9 items) —
 *     exercises the saltCellStates menu-option height + saltHeaderLayout
 *     hover halo at sub-menu level.
 *   - `"separator"` string entry between groups.
 *   - `icon: "<img src='...' />"` HTML strings for the Windows / Mac
 *     menu items (legacy uses bitmap icons rather than salt-icons font
 *     glyphs to demonstrate that consumers can mix both).
 *   - `shortcut: "Alt + W"` / `"Alt + M"` keyboard shortcut display.
 *   - `checked: true` to show the check-mark glyph next to a selected
 *     item.
 *   - Built-in `"copy"` action as the last entry.
 *
 * `allowContextMenuWithControlKey` lets Mac users open the menu via
 * Ctrl+click (otherwise blocked because Mac uses Ctrl+click for browser
 * context menu).
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → ContextMenu`
 * (`packages/ag-grid-theme/src/examples/ContextMenu.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import {
  AllCommunityModule,
  type DefaultMenuItem,
  type GetContextMenuItemsParams,
  type MenuItemDef,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import mac from "../../src/dependencies/mac.png";
import windows from "../../src/dependencies/windows.png";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

const getContextMenuItems = (
  params: GetContextMenuItemsParams,
): (MenuItemDef | DefaultMenuItem)[] => [
  {
    name: `Alert ${params.value}`,
    action() {
      window.alert(`Alerting about ${params.value}`);
    },
    cssClasses: ["redFont", "bold"],
  },
  {
    name: "Always Disabled",
    disabled: true,
    tooltip:
      "Very long tooltip, did I mention that I am very long, well I am! Long!  Very Long!",
  },
  {
    name: "Country",
    subMenu: [
      { name: "Ireland", action: () => console.log("Ireland was pressed") },
      { name: "UK", action: () => console.log("UK was pressed") },
      { name: "France", action: () => console.log("France was pressed") },
    ],
  },
  {
    name: "Person",
    subMenu: [
      { name: "Niall", action: () => console.log("Niall was pressed") },
      { name: "Sean", action: () => console.log("Sean was pressed") },
      { name: "John", action: () => console.log("John was pressed") },
      { name: "Alberto", action: () => console.log("Alberto was pressed") },
      { name: "Tony", action: () => console.log("Tony was pressed") },
      { name: "Andrew", action: () => console.log("Andrew was pressed") },
      { name: "Kev", action: () => console.log("Kev was pressed") },
      { name: "Will", action: () => console.log("Will was pressed") },
      { name: "Armaan", action: () => console.log("Armaan was pressed") },
    ],
  },
  "separator",
  {
    name: "Windows",
    shortcut: "Alt + W",
    action() {
      console.log("Windows Item Selected");
    },
    icon: `<img src='${windows}' alt="" />`,
  },
  {
    name: "Mac",
    shortcut: "Alt + M",
    action() {
      console.log("Mac Item Selected");
    },
    icon: `<img src='${mac}' alt="" />`,
  },
  "separator",
  {
    name: "Checked",
    checked: true,
    action() {
      console.log("Checked Selected");
    },
    icon: `<img src='${windows}' alt="" />`,
  },
  "copy",
];

export const ContextMenu = () => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      allowContextMenuWithControlKey
      getContextMenuItems={getContextMenuItems}
      columnDefs={dataGridExampleColumns}
      rowSelection="multiple"
      rowData={dataGridExampleData}
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
