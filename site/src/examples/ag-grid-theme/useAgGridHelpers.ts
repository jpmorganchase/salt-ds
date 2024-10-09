import { useDensity, useTheme } from "@salt-ds/core";
import type { GridApi, GridReadyEvent } from "ag-grid-community";
import { LicenseManager } from "ag-grid-enterprise";
import type { AgGridReactProps } from "ag-grid-react";
import { type HTMLAttributes, useMemo, useRef, useState } from "react";

// Helps to set className, rowHeight and headerHeight depending on the current density
export function useAgGridHelpers(compact = false): {
  containerProps: HTMLAttributes<HTMLDivElement>;
  agGridProps: AgGridReactProps;
  isGridReady: boolean;
  api?: GridApi;
  compact?: boolean;
} {
  const apiRef = useRef<{ api: GridApi }>();
  const [isGridReady, setGridReady] = useState(false);
  const density = useDensity();
  const { mode } = useTheme();

  // Row height is 1px more than header row, to count for border between rows
  const [rowHeight, headerRowHeight] = useMemo(() => {
    switch (density) {
      case compact && "high":
        return [21, 20];
      case "high":
        return [25, 24];
      case "medium":
        return [37, 36];
      case "low":
        return [49, 48];
      case "touch":
        return [61, 60];
      default:
        return [25, 24];
    }
  }, [density, compact]);

  const className = `ag-theme-salt${
    compact && density === "high" ? "-compact" : ""
  }-${mode}`;

  const onGridReady = ({ api }: GridReadyEvent) => {
    apiRef.current = { api };
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
      headerHeight: headerRowHeight,
      suppressMenuHide: true,
      defaultColDef: {
        filter: true,
        resizable: true,
        sortable: true,
        filterParams: {
          cellHeight: rowHeight,
        },
      },
    },
    isGridReady,
    api: apiRef.current?.api,
  };
}
