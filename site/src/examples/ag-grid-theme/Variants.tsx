import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import { type SyntheticEvent, useState } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultColumns, defaultData } from "./data";

export const Variants = (props: AgGridReactProps) => {
  const [selected, setSelected] = useState("primary");

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setSelected(event.currentTarget.value);
  };

  return (
    <StackLayout style={{ width: "100%" }}>
      <ToggleButtonGroup onChange={onChange} value={selected}>
        <ToggleButton value="primary">Primary</ToggleButton>
        <ToggleButton value="secondary">Secondary</ToggleButton>
        <ToggleButton value="tertiary">Tertiary</ToggleButton>
      </ToggleButtonGroup>
      <div
        className={clsx("ag-theme-salt", {
          "ag-theme-salt-variant-secondary": selected === "secondary",
          "ag-theme-salt-variant-tertiary": selected === "tertiary",
        })}
        style={{ height: 500, width: "100%" }}
      >
        <AgGridReact
          theme="legacy"
          autoSizeStrategy={{ type: "fitGridWidth" }}
          defaultColDef={{ filter: true }}
          {...props}
          rowData={defaultData}
          columnDefs={defaultColumns}
          rowSelection="multiple"
        />
      </div>
    </StackLayout>
  );
};
