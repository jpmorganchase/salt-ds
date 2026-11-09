import {
  type GridApi,
  type GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import type { AgGridReactProps } from "ag-grid-react";
import { type HTMLAttributes, useRef, useState } from "react";

// [VERSION DIVERGENCE]: AG Grid v33+ requires module registration. These examples register
// AG Grid Enterprise, because some of them use Enterprise features; an app with only
// ag-grid-community registers AllCommunityModule from "ag-grid-community" instead.
ModuleRegistry.registerModules([AllEnterpriseModule]);

// Sets the theme class name and the grid options the examples share. The theme follows the
// mode and density of the nearest SaltProvider, including row and header heights, so these
// options are only what the examples have in common.
export function useAgGridHelpers(compact = false): {
  containerProps: HTMLAttributes<HTMLDivElement>;
  agGridProps: AgGridReactProps;
  isGridReady: boolean;
  api?: GridApi;
  compact?: boolean;
} {
  const apiRef = useRef<{ api: GridApi } | undefined>(undefined);
  const [isGridReady, setGridReady] = useState(false);

  // HD Compact applies in high density; in other densities the grid uses that density's sizes.
  const className = compact ? "ag-theme-salt-compact" : "ag-theme-salt";

  const onGridReady = ({ api }: GridReadyEvent) => {
    apiRef.current = { api };
    setGridReady(true);
  };

  return {
    containerProps: {
      className,
      style: { height: 500, width: "100%" },
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
