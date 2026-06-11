import "../dependencies/setupAgGridLegacy";
import {
  FlexLayout,
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
type HeaderDivider = "primary" | "secondary" | "tertiary" | "none";

const HeaderVariants = (props: AgGridReactProps) => {
  const [variant, setVariant] = useState<HeaderVariant>("secondary");
  const [divider, setDivider] = useState<HeaderDivider>("primary");

  const { agGridProps, containerProps } = useAgGridHelpers();

  const onVariantChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value as HeaderVariant);
  };
  const onDividerChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setDivider(event.currentTarget.value as HeaderDivider);
  };

  return (
    <StackLayout style={{ width: "100%" }}>
      <FlexLayout gap={3} wrap>
        <StackLayout gap={1}>
          <Label>Header background</Label>
          <ToggleButtonGroup onChange={onVariantChange} value={variant}>
            <ToggleButton value="primary">Primary</ToggleButton>
            <ToggleButton value="secondary">Secondary</ToggleButton>
            <ToggleButton value="tertiary">Tertiary</ToggleButton>
          </ToggleButtonGroup>
        </StackLayout>
        <StackLayout gap={1}>
          <Label>Header divider</Label>
          <ToggleButtonGroup onChange={onDividerChange} value={divider}>
            <ToggleButton value="primary">Primary</ToggleButton>
            <ToggleButton value="secondary">Secondary</ToggleButton>
            <ToggleButton value="tertiary">Tertiary</ToggleButton>
            <ToggleButton value="none">None</ToggleButton>
          </ToggleButtonGroup>
        </StackLayout>
      </FlexLayout>
      <div
        {...containerProps}
        className={clsx(
          containerProps.className,
          `ag-theme-salt-header-${variant}`,
          `ag-theme-salt-header-divider-${divider}`,
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


