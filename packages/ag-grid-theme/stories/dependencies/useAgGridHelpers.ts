import { HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReactProps } from "ag-grid-react";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import { DEFAULT_THEME, useDensity, useTheme } from "@jpmorganchase/uitk-core";

// Helps to set className, rowHeight and headerHeight depending on the current density
export function useAgGridHelpers(): {
  containerProps: HTMLAttributes<HTMLDivElement>;
  agGridProps: AgGridReactProps;
  isGridReady: boolean;
  api?: GridApi;
  columnApi?: ColumnApi;
} {
  const apiRef = useRef<{ api: GridApi; columnApi: ColumnApi }>();
  const [isGridReady, setGridReady] = useState(false);
  const density = useDensity();
  const themes = useTheme();

  const [rowHeight, listItemHeight] = useMemo(() => {
    switch (density) {
      case "high":
        return [20, 24];
      case "medium":
        return [24, 36];
      case "low":
        return [32, 48];
      case "touch":
        return [32, 60];
      default:
        return [20, 24];
    }
  }, [density]);

  const themeName =
    themes && themes.length > 0 ? themes[0].name : DEFAULT_THEME.name;

  const className = `ag-theme-uitk-${density}-${themeName}`;

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
  }, [density, isGridReady]);

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
