import { HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReactProps } from "ag-grid-react";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import { useDensity, useTheme } from "@salt-ds/core";
import { LicenseManager } from "ag-grid-enterprise";

LicenseManager.setLicenseKey("your license key");

// Helps to set className, rowHeight and headerHeight depending on the current density
export function useAgGridHelpers(compact = false): {
  containerProps: HTMLAttributes<HTMLDivElement>;
  agGridProps: AgGridReactProps;
  isGridReady: boolean;
  api?: GridApi;
  columnApi?: ColumnApi;
  compact?: boolean;
} {
  const apiRef = useRef<{ api: GridApi; columnApi: ColumnApi }>();
  const [isGridReady, setGridReady] = useState(false);
  const density = useDensity();
  const { mode } = useTheme();

  const [rowHeight, listItemHeight] = useMemo(() => {
    switch (["ag-theme-salt", density].join("-")) {
      case compact && "ag-theme-salt-high":
        return [20, 20];
      case "ag-theme-salt-high":
        return [24, 24];
      case "ag-theme-salt-medium":
        return [36, 36];
      case "ag-theme-salt-low":
        return [48, 48];
      case "ag-theme-salt-touch":
        return [60, 60];
      default:
        return [20, 24];
    }
  }, [density, compact]);

  const className = `ag-theme-salt-${
    compact && density === "high" ? `-compact` : ``
  }-${mode}`;

  const onGridReady = ({ api, columnApi }: GridReadyEvent) => {
    apiRef.current = { api, columnApi };
    api.sizeColumnsToFit();
    setGridReady(true);
  };

  useEffect(() => {
    // setHeaderHeight doesn't work if not in setTimeout
    setTimeout(() => {
      if (isGridReady) {
        apiRef.current!.api.resetRowHeights();
        apiRef.current!.api.setHeaderHeight(rowHeight);
        apiRef.current!.api.setFloatingFiltersHeight(rowHeight);
        // TODO how to set listItemHeight as the "ag-filter-virtual-list-item" height? Issue 2479
      }
    }, 0);
  }, [rowHeight, isGridReady, listItemHeight]);

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
