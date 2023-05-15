import {
  Grid,
  GridColumn,
  GridProps,
  NumericColumn,
  RowKeyGetter,
  RowSelectionCheckboxColumn,
} from "../src";
import { ChangeEvent, useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";
import { Checkbox, FlexItem, FlexLayout, useDensity } from "@salt-ds/core";
import "./grid.stories.css";
import { Story } from "@storybook/react";
import { DummyRow, dummyRowKeyGetter, rowData } from "./dummyData";
import { clsx } from "clsx";

export default {
  title: "Data Grid/Data Grid",
  component: Grid,
  argTypes: {},
};

const GridVariantsTemplate: Story<{}> = () => {
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
          <FlexItem>
            <Checkbox
              checked={separators}
              label="Column separators"
              onChange={onSeparatorsChange}
            />
          </FlexItem>
          <FlexItem>
            <Checkbox
              checked={density === "high" && uhd}
              label="Compact (for high density only)"
              onChange={onUhdChange}
              disabled={density !== "high"}
            />
          </FlexItem>
        </FlexLayout>
      </FlexItem>
      <Grid
        rowData={rowData}
        rowKeyGetter={dummyRowKeyGetter}
        className={clsx("grid", { ["grid-uhd"]: uhd })}
        variant={index === 1 ? "secondary" : "primary"}
        zebra={index === 2 ? true : false}
        columnSeparators={separators}
        headerIsFocusable={true}
      >
        <RowSelectionCheckboxColumn id="s" />
        <GridColumn name="A" id="a" defaultWidth={50} getValue={(r) => r.a} />
        <NumericColumn
          name="B"
          id="b"
          defaultWidth={100}
          precision={2}
          getValue={(r: DummyRow) => r.b}
          align={"right"}
        />
        <GridColumn name="C" id="c" defaultWidth={50} getValue={(r) => r.c} />
      </Grid>
    </FlexLayout>
  );
};

export const GridVariants = GridVariantsTemplate.bind({});
