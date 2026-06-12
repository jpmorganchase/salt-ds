import "./_setupV3";
/**
 * Phase 2 V3 spike — `ProvidedCellEditors` story rendered against `saltTheme`.
 *
 * Exercises AG's built-in cell editors (`agTextCellEditor`,
 * `agLargeTextCellEditor`, `agNumberCellEditor`, `agDateStringCellEditor`,
 * `agSelectCellEditor`, etc.) wired up via `agProvidedCellEditorsExampleColumns`:
 *   - editor popups inherit `menuBackgroundColor` + `popupShadow` from
 *     saltTheme
 *   - input borders / focus come from `saltInputStyle`
 *   - the registered `dateString` data-type definition lets the date editor
 *     parse `YYYY-MM-DD` strings round-trip.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → ProvidedCellEditors`
 * (`packages/ag-grid-theme/src/examples/ProvidedCellEditors.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import {
  AllCommunityModule,
  type DateStringDataTypeDefinition,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import agProvidedCellEditorsExampleColumns from "../../src/dependencies/agProvidedCellEditorsExampleColumns";
import { dataGridExampleDataCellEditors } from "../../src/dependencies/dataGridExampleDataCellEditors";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// https://www.ag-grid.com/javascript-data-grid/cell-data-types/#date-as-string-data-type-definition
const dateString: DateStringDataTypeDefinition<
  (typeof dataGridExampleDataCellEditors)[number]
> = {
  baseDataType: "dateString",
  extendsDataType: "dateString",
  valueParser: (params) =>
    params.newValue?.match("\\d{4}-\\d{2}-\\d{2}") ? params.newValue : null,
  valueFormatter: (params) => (params.value == null ? "" : params.value),
  dataTypeMatcher: (value) =>
    typeof value === "string" && !!value.match("\\d{4}-\\d{2}-\\d{2}"),
  dateParser: (value) => {
    if (value == null || value === "") {
      return undefined;
    }
    const dateParts = value.split("-");
    return dateParts.length === 3
      ? new Date(
          Number.parseInt(dateParts[0], 10),
          Number.parseInt(dateParts[1], 10) - 1,
          Number.parseInt(dateParts[2], 10),
        )
      : undefined;
  },
  dateFormatter: (value) => {
    if (value == null) {
      return undefined;
    }
    const date = String(value.getDate());
    const month = String(value.getMonth() + 1);
    return `${value.getFullYear()}-${month.length === 1 ? `0${month}` : month}-${date.length === 1 ? `0${date}` : date}`;
  },
};

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const ProvidedCellEditors = () => (
  <div style={{ height: 500, width: 800 }}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={agProvidedCellEditorsExampleColumns}
      rowData={[...dataGridExampleDataCellEditors]}
      dataTypeDefinitions={{ dateString }}
    />
  </div>
);

