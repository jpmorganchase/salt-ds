import { SyntheticEvent, useState } from "react";
import {
  Banner,
  BannerContent,
  FlexItem,
  FlexLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
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
  const [selected, setSelected] = useState("primary");
  // const density = useDensity();

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setSelected(event.currentTarget.value);
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
            <ToggleButtonGroup onChange={onChange} value={selected}>
              <ToggleButton value="primary">Primary</ToggleButton>
              <ToggleButton value="secondary">Secondary</ToggleButton>
              <ToggleButton value="zebra">Zebra</ToggleButton>
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
          "ag-theme-salt-variant-secondary": selected === "secondary",
          "ag-theme-salt-variant-zebra": selected === "zebra",
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

Variants.parameters = {
  chromatic: { disableSnapshot: false },
};

export default Variants;
