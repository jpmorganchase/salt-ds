import { useDensity, useTheme } from "@salt-ds/core";
import type { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import { LicenseManager } from "ag-grid-enterprise";
import type { AgGridReactProps } from "ag-grid-react";
import { type HTMLAttributes, useMemo, useRef, useState } from "react";

LicenseManager.setLicenseKey("your license key");

// Helps to set className, rowHeight and headerHeight depending on the current density
export function useAgGridHelpers(compact = false): {
  containerProps: HTMLAttributes<HTMLDivElement>;
  agGridProps: AgGridReactProps;
  isGridReady: boolean;
  api?: GridApi;
  /**
   * @deprecated — Use methods via the grid api instead.
   */
  columnApi?: ColumnApi;
  compact?: boolean;
} {
  const apiRef = useRef<{ api: GridApi; columnApi: ColumnApi }>();
  const [isGridReady, setGridReady] = useState(false);
  const density = useDensity();
  const { mode } = useTheme();

  const [rowHeight, listItemHeight] = useMemo(() => {
    switch (density) {
      case compact && "high":
        return [20, 20];
      case "high":
        return [24, 24];
      case "medium":
        return [36, 36];
      case "low":
        return [48, 48];
      case "touch":
        return [60, 60];
      default:
        return [20, 24];
    }
  }, [density, compact]);

  const className = `ag-theme-salt${
    compact && density === "high" ? "-compact" : ""
  }-${mode}`;

  const onGridReady = ({ api, columnApi }: GridReadyEvent) => {
    apiRef.current = { api, columnApi };
    api.sizeColumnsToFit();
    setGridReady(true);
  };

  return {
    containerProps: {
      className,
      style: { height: 500, width: "100%" },
    },
    agGridProps: {
      onGridReady,
      rowHeight,
      headerHeight: rowHeight,
      suppressMenuHide: true,
      defaultColDef: {
        filter: true,
        resizable: true,
        sortable: true,
        filterParams: {
          cellHeight: listItemHeight,
        },
      },
    },
    isGridReady,
    api: apiRef.current?.api,
    columnApi: apiRef.current?.columnApi,
  };
}
