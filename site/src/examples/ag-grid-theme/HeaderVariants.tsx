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
import { useAgGridHelpers } from "./useAgGridHelpers";

type HeaderVariant = "primary" | "secondary" | "tertiary";

export const HeaderVariants = (props: AgGridReactProps) => {
  const [variant, setVariant] = useState<HeaderVariant>("secondary");

  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { agGridProps, containerProps } = useAgGridHelpers();

  const onVariantChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value as HeaderVariant);
  };

  return (
    <StackLayout style={{ width: "100%" }}>
      <StackLayout gap={1}>
        <Label>Variant</Label>
        <ToggleButtonGroup onChange={onVariantChange} value={variant}>
          <ToggleButton value="primary">Primary</ToggleButton>
          <ToggleButton value="secondary">Secondary</ToggleButton>
          <ToggleButton value="tertiary">Tertiary</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
      <div
        {...containerProps}
        className={clsx(
          containerProps.className,
          `ag-theme-salt-header-${variant}`,
        )}
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
