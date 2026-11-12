import {
  SaltProvider,
  SaltProviderNext,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
  useDensity,
  useTheme,
} from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import { type SyntheticEvent, useState } from "react";
import { DropdownEditor } from "../dependencies/cell-editors/DropdownEditor";
import dataGridExampleColumnsHdCompact from "../dependencies/dataGridExampleColumnsHdCompact";
import dataGridExampleData from "../dependencies/dataGridExampleData";

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

const HDCompactGrid = (props: AgGridReactProps) => {
  const [selected, setSelected] = useState("primary");
  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setSelected(event.currentTarget.value);
  };
  const density = useDensity();
  // Only opt into HD Compact when the nearest provider uses high density.
  const className =
    density === "high" ? "ag-theme-salt-compact" : "ag-theme-salt";

  return (
    <StackLayout style={{ width: "100%" }}>
      <ToggleButtonGroup onChange={onChange} value={selected}>
        <ToggleButton value="primary">Primary</ToggleButton>
        <ToggleButton value="secondary">Secondary</ToggleButton>
        <ToggleButton value="zebra">Zebra</ToggleButton>
      </ToggleButtonGroup>
      <div
        className={clsx(className, {
          "ag-theme-salt-variant-secondary": selected === "secondary",
          "ag-theme-salt-variant-zebra": selected === "zebra",
        })}
        style={{ height: 500, width: 800 }}
      >
        <AgGridReact
          columnDefs={dataGridExampleColumnsHdCompact}
          rowData={dataGridExampleData}
          statusBar={statusBar}
          rowSelection="multiple"
          {...props}
          cellSelection={true}
          onFirstDataRendered={(params) => {
            params.api.forEachNode((node, index) => {
              if (node.data && index < 3) {
                node.setSelected(true);
              }
            });
          }}
          components={{
            DropdownEditor,
          }}
        />
      </div>
    </StackLayout>
  );
};

const HDCompact = (props: AgGridReactProps) => {
  const { themeNext } = useTheme();
  const Provider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <Provider density="high">
      <HDCompactGrid {...props} />
    </Provider>
  );
};

export default HDCompact;
