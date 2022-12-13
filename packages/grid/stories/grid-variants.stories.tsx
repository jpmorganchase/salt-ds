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
} from "@jpmorganchase/uitk-lab";
import { Checkbox, FlexItem, FlexLayout } from "@jpmorganchase/uitk-core";
import "./grid.stories.css";
import { Story } from "@storybook/react";
import { DummyRow, dummyRowKeyGetter, rowData } from "./dummyData";

export default {
  title: "Grid/New Grid",
  component: Grid,
  argTypes: {},
};

const GridVariantsTemplate: Story<{}> = () => {
  const [separators, setSeparators] = useState(false);
  const [index, setIndex] = useState(0);

  const onChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    setIndex(index);
  };

  const onSeparatorsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSeparators(checked);
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
        </FlexLayout>
      </FlexItem>
      <Grid
        rowData={rowData}
        rowKeyGetter={dummyRowKeyGetter}
        className="grid"
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
