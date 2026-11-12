import {
  Label,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import { type SyntheticEvent, useState } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultColumns, defaultData } from "./data";

type HeaderVariant = "primary" | "secondary" | "tertiary";

export const HeaderVariants = (props: AgGridReactProps) => {
  const [variant, setVariant] = useState<HeaderVariant>("secondary");

  const onVariantChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value as HeaderVariant);
  };

  return (
    <StackLayout style={{ width: "100%" }}>
      <StackLayout gap={1}>
        <Label>Header background</Label>
        <ToggleButtonGroup
          aria-label="Header background"
          onChange={onVariantChange}
          value={variant}
        >
          <ToggleButton value="primary">Primary</ToggleButton>
          <ToggleButton value="secondary">Secondary</ToggleButton>
          <ToggleButton value="tertiary">Tertiary</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
      <div
        className={clsx("ag-theme-salt", `ag-theme-salt-header-${variant}`)}
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
