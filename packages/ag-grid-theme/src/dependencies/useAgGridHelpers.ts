import { useDensity } from "@salt-ds/core";
import {
  type GridApi,
  type GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import type { AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import { type HTMLAttributes, useCallback, useRef, useState } from "react";

// [VERSION DIVERGENCE]: AG Grid v33+ requires module registration; this example setup is not part of the published CSS package.
ModuleRegistry.registerModules([AllEnterpriseModule]);

interface AgGridHelpersProps {
  compact?: boolean;
  containerClassName?: string;
}

// Sets the theme class name and the grid options the examples share. The theme's CSS
// follows the mode and density of the nearest SaltProvider, including row and header heights.
export function useAgGridHelpers({
  compact = false,
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
  const density = useDensity();

  const className = clsx(
    containerClassName,
    compact && density === "high" ? "ag-theme-salt-compact" : "ag-theme-salt",
  );

  const onGridReady = useCallback(({ api }: GridReadyEvent) => {
    apiRef.current = { api };
    setGridReady(true);
  }, []);

  return {
    containerProps: {
      className,
      style: { height: 500, width: 800 },
    },
    agGridProps: {
      // [VERSION DIVERGENCE]: AG Grid v33+ defaults to the Theming API; Salt continues to use legacy CSS themes.
      theme: "legacy",
      onGridReady,
      // [VERSION DIVERGENCE]: In v36, sizing on gridReady can run before vertical-scroll visibility is known. Let AG Grid defer fitting until data is rendered.
      autoSizeStrategy: { type: "fitGridWidth" },
      suppressMenuHide: true,
      defaultColDef: {
        filter: true,
        resizable: true,
        sortable: true,
      },
    },
    isGridReady,
    api: apiRef.current?.api,
  };
}
