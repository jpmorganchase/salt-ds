import { useDensity, useTheme } from "@salt-ds/core";
import {
  type GridApi,
  type GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import type { AgGridReactProps } from "ag-grid-react";
import {
  type HTMLAttributes,
  useMemo,
  useRef,
  useState,
} from "react";

// [VERSION DIVERGANCE]: AG Grid v33+ requires module registration; this example setup is not part of the published CSS package.
ModuleRegistry.registerModules([AllEnterpriseModule]);

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
      // [VERSION DIVERGANCE]: AG Grid v33+ defaults to the Theming API; Salt continues to use legacy CSS themes.
      theme: "legacy",
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
