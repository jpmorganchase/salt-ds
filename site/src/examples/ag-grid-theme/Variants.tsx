import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import { SyntheticEvent, useState } from "react";
import {
  Banner,
  BannerContent,
  FlexItem,
  FlexLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultColumns, defaultData } from "./data";

export const Variants = (props: AgGridReactProps) => {
  const [selected, setSelected] = useState("primary");
  const { agGridProps, containerProps } = useAgGridHelpers();

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setSelected(event.currentTarget.value);
  };

  return (
    <FlexLayout direction="column">
      <Banner status="info">
        <BannerContent>Variants are available in Salt theme only</BannerContent>
      </Banner>
      <FlexItem>
        <FlexLayout direction="row">
          <FlexItem>
            <ToggleButtonGroup onChange={onChange} value={selected}>
              <ToggleButton value="primary">Primary</ToggleButton>
              <ToggleButton value="secondary">Secondary</ToggleButton>
              <ToggleButton value="zebra">Zebra</ToggleButton>
            </ToggleButtonGroup>
          </FlexItem>
        </FlexLayout>
      </FlexItem>
      <div
        style={{ height: 500, width: 800, marginTop: 25 }}
        {...containerProps}
        className={clsx({
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
    </FlexLayout>
  );
};
