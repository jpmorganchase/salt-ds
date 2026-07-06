import {
  Label,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import { type SyntheticEvent, useState } from "react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

type HeaderVariant = "primary" | "secondary" | "tertiary";

const HeaderVariants = (props: AgGridReactProps) => {
  const [variant, setVariant] = useState<HeaderVariant>("secondary");

  const { agGridProps, containerProps } = useAgGridHelpers();

  const onVariantChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value as HeaderVariant);
  };

  return (
    <StackLayout style={{ width: "100%" }}>
      <StackLayout gap={1}>
        <Label>Header background</Label>
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
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
        />
      </div>
    </StackLayout>
  );
};

export default HeaderVariants;
