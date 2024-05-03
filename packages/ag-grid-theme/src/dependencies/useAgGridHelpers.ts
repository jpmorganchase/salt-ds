import { useDensity, useTheme } from "@salt-ds/core";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import { LicenseManager } from "ag-grid-enterprise";
import { AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import { HTMLAttributes, useCallback, useMemo, useRef, useState } from "react";

LicenseManager.setLicenseKey("your license key");

interface AgGridHelpersProps {
  compact?: boolean;
  mode?: string;
  density?: string;
  containerClassName?: string;
}

// Helps to set className, rowHeight and headerHeight depending on the current density
export function useAgGridHelpers({
  compact = false,
  mode: modeProp,
  density: densityProp,
  containerClassName,
}: AgGridHelpersProps = {}): {
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
  const contextDensity = useDensity();
  const { mode: contextMode } = useTheme();

  const mode = modeProp ?? contextMode;
  const density = densityProp ?? contextDensity;

  const [rowHeight, listItemHeight] = useMemo(() => {
    switch (density) {
      case compact && "high":
        return [20, 20];
      case "high":
        return [24, 24]; // 20 + 4
      case "medium":
        return [36, 36]; // 28 + 8
      case "low":
        return [48, 48]; // 36 + 12
      case "touch":
        return [60, 60]; // 44 + 16
      default:
        return [24, 24];
    }
  }, [density, compact]);

  const className = clsx(
    containerClassName,
    `ag-theme-salt${compact && density === "high" ? `-compact` : ``}-${mode}`
  );

  const onGridReady = useCallback(({ api, columnApi }: GridReadyEvent) => {
    apiRef.current = { api, columnApi };
    api.sizeColumnsToFit();
    setGridReady(true);
  }, []);

  return {
    containerProps: {
      className: clsx(containerClassName, className),
      style: { height: 500, width: 800 },
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
