import { ChangeEvent, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  StackLayout,
  Checkbox,
  useDensity,
  useTheme,
} from "@salt-ds/core";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultColumns, defaultData } from "./data";

const statusBar = {
  statusPanels: [
    {
      statusPanel: "agTotalRowCountComponent",
      align: "left",
    },
    { statusPanel: "agFilteredRowCountComponent" },
    { statusPanel: "agSelectedRowCountComponent" },
    { statusPanel: "agAggregationComponent" },
  ],
};

const getThemeNames = () => {
  const densities = ["touch", "low", "medium", "high", "high-compact"];
  const themes: string[] = [];

  densities.forEach((density) => {
    themes.push(`ag-theme-salt-${density}-light`);
    themes.push(`ag-theme-salt-${density}-dark`);
  });

  return themes;
};

const HDCompact = () => {
  const [compact, setCompact] = useState(false);
  const { mode } = useTheme();
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers(compact);

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const density = useDensity();

  useEffect(() => {
    const gridRoot = document.querySelector<HTMLElement>(`.ag-salt-theme`);

    if (compact) {
      getThemeNames().forEach((theme) =>
        gridRoot?.classList.toggle(
          theme,
          theme.includes(`${density}-compact`) && theme.includes(mode)
        )
      );
    } else {
      getThemeNames().forEach((theme) =>
        gridRoot?.classList.toggle(
          theme,
          theme.includes(density) && theme.includes(mode)
        )
      );
    }
  }, [density, mode]);

  const handleCompactChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCompact(event.target.checked);
  };

  return (
    <StackLayout gap={4}>
        <Checkbox
        checked={compact && density === "high"}
        label="Compact (for high density only)"
        onChange={handleCompactChange}
        disabled={density !== "high"}
        />
      <div {...containerProps}>
        <AgGridReact
          columnDefs={defaultColumns}
          rowData={defaultData}
          statusBar={statusBar}
          rowSelection="multiple"
          {...agGridProps}
          enableRangeSelection={true}
          className="ag-salt-theme"
        />
      </div>
    </StackLayout>
  );
};

export default HDCompact;
