import { HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReactProps } from "ag-grid-react";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import { useDensity, useTheme } from "@jpmorganchase/uitk-core";

// Helps to set className, rowHeight and headerHeight depending on the current density
export function useAgGridHelpers(agThemeName: string = "ag-theme-uitk"): {
  containerProps: HTMLAttributes<HTMLDivElement>;
  agGridProps: AgGridReactProps;
  isGridReady: boolean;
  api?: GridApi;
  columnApi?: ColumnApi;
} {
  const apiRef = useRef<{ api: GridApi; columnApi: ColumnApi }>();
  const [isGridReady, setGridReady] = useState(false);
  const density = useDensity();
  const { mode } = useTheme();

  const [rowHeight, listItemHeight] = useMemo(() => {
    switch ([agThemeName, density].join("-")) {
      case "ag-theme-uitk-high":
        return [20, 24];
      case "ag-theme-uitk-medium":
        return [24, 36];
      case "ag-theme-uitk-low":
        return [32, 48];
      case "ag-theme-uitk-touch":
        return [32, 60];
      case "ag-theme-odyssey-high":
        return [24, 24];
      case "ag-theme-odyssey-medium":
        return [36, 36];
      case "ag-theme-odyssey-low":
        return [48, 48];
      case "ag-theme-odyssey-touch":
        return [60, 60];
      default:
        return [20, 24];
    }
  }, [density, agThemeName]);

  const className = `${agThemeName}-${density}-${mode}`;

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
        // TODO how to set listItemHeight as the "ag-filter-virtual-list-item" height?
      }
    }, 0);
  }, [density, isGridReady, agThemeName]);

  return {
    containerProps: {
      className,
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
      },
    },
    isGridReady,
    api: apiRef.current?.api,
    columnApi: apiRef.current?.columnApi,
  };
}
