import { ChangeEvent, useEffect, useState } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import {
  StackLayout,
  FlexItem,
  FlexLayout,
  Checkbox,
  useDensity,
  useTheme,
} from "@salt-ds/core";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

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
  const densities = ["touch","low","medium","high","high-compact"];
  const themes: string[] = [];

  densities.forEach((density => {
    themes.push(`ag-theme-salt-${density}-light`);
    themes.push(`ag-theme-salt-${density}-dark`);
  }))
  
  return themes;
}

const HDCompact = (props: AgGridReactProps) => {
  const [compact, setCompact] = useState(false);
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { mode } = useTheme();
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers(
    `ag-theme-${themeName}`,
    compact
  );

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const density = useDensity();

  useEffect(() => {
    const gridRoot = document.querySelector<HTMLElement>(`.ag-salt-theme`);

    if (compact) {
      getThemeNames().forEach((theme) => gridRoot?.classList.toggle(theme, theme.includes(`${density}-compact`) && theme.includes(mode)));
    } else {
      getThemeNames().forEach((theme) => gridRoot?.classList.toggle(theme, theme.includes(density) && theme.includes(mode)));
    }
  }, [density, mode]);

  const handleCompactChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCompact(event.target.checked);
  };
  
  return (
    <StackLayout gap={4}>
      <FlexLayout direction="row">
        {switcher}
        <FlexItem>
          <Checkbox
            checked={compact && density === "high"}
            label="Compact (for high density only)"
            onChange={handleCompactChange}
            disabled={density !== "high"}
          />
        </FlexItem>
      </FlexLayout>
      <div {...containerProps}>
        <AgGridReact
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
          statusBar={statusBar}
          rowSelection="multiple"
          {...agGridProps}
          {...props}
          enableRangeSelection={true}
          className="ag-salt-theme"
        />
      </div>
    </StackLayout>
  );
};

export default HDCompact;
