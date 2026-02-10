import { useDensity, useTheme } from "@salt-ds/core";
import type { GridApi, GridReadyEvent } from "ag-grid-community";
import "ag-grid-enterprise";
import type { AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import {
  type HTMLAttributes,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

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
  compact?: boolean;
} {
  const apiRef = useRef<{ api: GridApi }>();
  const [isGridReady, setGridReady] = useState(false);
  const contextDensity = useDensity();
  const { mode: contextMode } = useTheme();

  const mode = modeProp ?? contextMode;
  const density = densityProp ?? contextDensity;

  const [rowHeight, headerRowHeight] = useMemo(() => {
    switch (density) {
      case compact && "high":
        return [21, 20];
      case "high":
        return [25, 24]; // 20 + 4 + [1 (border)]
      case "medium":
        return [37, 36]; // 28 + 8 + [1 (border)]
      case "low":
        return [49, 48]; // 36 + 12 + [1 (border)]
      case "touch":
        return [61, 60]; // 44 + 16 + [1 (border)]
      case "mobile":
        return [61, 60]; // 44 + 16 + [1 (border)]
      default:
        return [25, 24];
    }
  }, [density, compact]);

  const className = clsx(
    containerClassName,
    `ag-theme-salt${compact && density === "high" ? "-compact" : ""}-${mode}`,
  );

  const onGridReady = useCallback(({ api }: GridReadyEvent) => {
    apiRef.current = { api };
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
