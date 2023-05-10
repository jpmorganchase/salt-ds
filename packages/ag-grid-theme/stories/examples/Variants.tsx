import { useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";
import { Banner, BannerContent, FlexItem, FlexLayout } from "@salt-ds/core";
import { clsx } from "clsx";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
// import { Switch } from "@salt-ds/lab";

// const [uhd, setUhd] = useState(false);

const Variants = (props: AgGridReactProps) => {
  // const [separators, setSeparators] = useState(false);
  // const [uhd, setUhd] = useState(false);
  const [index, setIndex] = useState(0);
  // const density = useDensity();

  const onChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    setIndex(index);
  };
  const { agGridProps, containerProps } = useAgGridHelpers("ag-theme-salt");

  const { className } = containerProps;

  // const onUhdChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setUhd(event.target.checked);
  // };

  // const onSeparatorsChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setSeparators(event.target.checked);
  // };

  return (
    <FlexLayout direction="column">
      <Banner status="info">
        <BannerContent>Variants are available in Salt theme only</BannerContent>
      </Banner>
      <FlexItem>
        <FlexLayout direction="row">
          <FlexItem>
            <ToggleButtonGroup onChange={onChange} selectedIndex={index}>
              <ToggleButton aria-label="primary" tooltipText="Primary">
                Primary
              </ToggleButton>
              <ToggleButton aria-label="secondary" tooltipText="Secondary">
                Secondary
              </ToggleButton>
              <ToggleButton aria-label="zebra" tooltipText="Zebra">
                Zebra
              </ToggleButton>
            </ToggleButtonGroup>
          </FlexItem>
          {/* <FlexItem>
            <Checkbox
              checked={density === "high" && uhd}
              label="Compact (for high density only)"
              onChange={onUhdChange}
              disabled={density !== "high"}
            />
          </FlexItem> */}
        </FlexLayout>
      </FlexItem>
      <div
        style={{ height: 500, width: 800, marginTop: 25 }}
        {...containerProps}
        className={clsx(className, {
          "ag-theme-salt-variant-secondary": index === 1,
          "ag-theme-salt-variant-zebra": index === 2,
        })}
      >
        <AgGridReact
          {...agGridProps}
          {...props}
          rowData={dataGridExampleData}
          columnDefs={dataGridExampleColumns}
          rowSelection="multiple"
        />
      </div>
    </FlexLayout>
  );
};

export default Variants;
