import { ChangeEvent, useEffect, useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";
import { FlexItem, FlexLayout, useDensity } from "@salt-ds/core";
import cn from "classnames";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";

const Variants = (props: AgGridReactProps) => {
  const [separators, setSeparators] = useState(false);
  const [uhd, setUhd] = useState(false);
  const [index, setIndex] = useState(0);
  const density = useDensity();

  const onChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    setIndex(index);
  };
  const { api, agGridProps, containerProps, isGridReady } =
    useAgGridHelpers("ag-theme-salt");

  const { className } = containerProps;

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const onUhdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUhd(event.target.checked);
  };

  const onSeparatorsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSeparators(event.target.checked);
  };

  return (
    <FlexLayout direction="column">
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
        style={{ height: 800, width: 800, marginTop: 25 }}
        {...containerProps}
        className={cn(className, {
          "ag-theme-salt-variant-secondary": index === 1,
          "ag-theme-salt-variant-zebra": index === 2,
        })}
      >
        <AgGridReact
          {...agGridProps}
          {...props}
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
        />
      </div>
    </FlexLayout>
  );
};

export default Variants;
