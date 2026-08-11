import { useDensity, useTheme } from "@salt-ds/core";
import {
  type GridApi,
  type GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import type { AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import {
  type HTMLAttributes,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

// [VERSION DIVERGANCE]: AG Grid v33+ requires module registration; this example setup is not part of the published CSS package.
ModuleRegistry.registerModules([AllEnterpriseModule]);

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
  const apiRef = useRef<{ api: GridApi } | undefined>(undefined);
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
      className,
      style: { height: 500, width: 800 },
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
