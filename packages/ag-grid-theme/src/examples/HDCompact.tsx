import {
  SaltProvider,
  SaltProviderNext,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import { type SyntheticEvent, useState } from "react";
import { DropdownEditor } from "../dependencies/cell-editors/DropdownEditor";
import dataGridExampleColumnsHdCompact from "../dependencies/dataGridExampleColumnsHdCompact";
import dataGridExampleData from "../dependencies/dataGridExampleData";
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

const HDCompact = (props: AgGridReactProps) => {
  const [selected, setSelected] = useState("primary");
  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setSelected(event.currentTarget.value);
  };
  const { themeNext } = useTheme();
  const { agGridProps, containerProps } = useAgGridHelpers({
    compact: true,
    density: "high",
  });

  const Provider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <Provider density="high">
      <StackLayout style={{ width: "100%" }}>
        <ToggleButtonGroup onChange={onChange} value={selected}>
          <ToggleButton value="primary">Primary</ToggleButton>
          <ToggleButton value="secondary">Secondary</ToggleButton>
          <ToggleButton value="zebra">Zebra</ToggleButton>
        </ToggleButtonGroup>
        <div
          {...containerProps}
          className={clsx(containerProps.className, {
            "ag-theme-salt-variant-secondary": selected === "secondary",
            "ag-theme-salt-variant-zebra": selected === "zebra",
          })}
        >
          <AgGridReact
            columnDefs={dataGridExampleColumnsHdCompact}
            rowData={dataGridExampleData}
            statusBar={statusBar}
            rowSelection="multiple"
            {...agGridProps}
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
    </Provider>
  );
};

export default HDCompact;
