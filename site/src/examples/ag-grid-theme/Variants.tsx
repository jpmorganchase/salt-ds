import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import { SyntheticEvent, useState } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultColumns, defaultData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const Variants = (props: AgGridReactProps) => {
  const [selected, setSelected] = useState("primary");
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { agGridProps, containerProps } = useAgGridHelpers();

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setSelected(event.currentTarget.value);
  };

  return (
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
          {...agGridProps}
          {...props}
          rowData={defaultData}
          columnDefs={defaultColumns}
          rowSelection="multiple"
        />
      </div>
    </StackLayout>
  );
};
