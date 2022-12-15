import { useEffect, useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";
import { FlexItem, FlexLayout } from "@salt-ds/core";
import cn from "classnames";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
// import { Switch } from "@salt-ds/lab";

const dataGridExampleColumns = [
  {
    headerName: "",
    field: "on",
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 38,
    pinned: "left",
    suppressMenu: true,
  },
  {
    headerName: "Name",
    field: "name",
    filterParams: {
      buttons: ["reset", "apply"],
    },
    editable: false,
  },
  {
    headerName: "Code",
    field: "code",
  },
  {
    headerName: "Capital",
    field: "capital",
  },
  {
    headerName: "Population",
    type: "numericColumn",
    field: "population",
    filter: "agNumberColumnFilter",
    editable: true,
    cellClass: ["editable-numeric-cell"],
  },
];

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
  const { api, agGridProps, containerProps, isGridReady } =
    useAgGridHelpers("ag-theme-salt");

  const { className } = containerProps;

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  // const onUhdChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setUhd(event.target.checked);
  // };

  // const onSeparatorsChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setSeparators(event.target.checked);
  // };

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
          rowData={dataGridExampleData}
          columnDefs={dataGridExampleColumns}
          rowSelection="multiple"
        />
      </div>
    </FlexLayout>
  );
};

export default Variants;
