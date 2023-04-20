import { Story } from "@storybook/react";
import {
  Grid,
  GridColumn,
  GridRowSelectionMode,
  NumericColumn,
  RowSelectionCheckboxColumn,
  RowSelectionRadioColumn,
} from "../src";
import { DummyRow, dummyRowKeyGetter, rowData } from "./dummyData";
import { useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";
import { FlexItem, FlexLayout } from "@salt-ds/core";
import "./grid.stories.css";

export default {
  title: "Data Grid/Data Grid",
  component: Grid,
  argTypes: {},
};

const RowSelectionModesTemplate: Story<{}> = () => {
  const rowSelectionModes: GridRowSelectionMode[] = ["multi", "single", "none"];
  const [index, setIndex] = useState<number>(0);

  const onChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    setIndex(index);
  };

  const rowSelectionMode = rowSelectionModes[index];

  return (
    <FlexLayout direction="column">
      <FlexItem>
        <ToggleButtonGroup onChange={onChange} selectedIndex={index}>
          <ToggleButton aria-label="multi" tooltipText="Multi">
            Multi
          </ToggleButton>
          <ToggleButton aria-label="single" tooltipText="Single">
            Single
          </ToggleButton>
          <ToggleButton aria-label="none" tooltipText="None">
            None
          </ToggleButton>
        </ToggleButtonGroup>
      </FlexItem>
      <Grid
        rowData={rowData}
        rowKeyGetter={dummyRowKeyGetter}
        className="grid"
        cellSelectionMode="none"
        columnSeparators={true}
        zebra={true}
        rowSelectionMode={rowSelectionMode}
        headerIsFocusable={rowSelectionMode === "multi"}
        key={rowSelectionMode}
      >
        {rowSelectionMode === "multi" && (
          <RowSelectionCheckboxColumn id="checkbox" />
        )}
        {rowSelectionMode === "single" && (
          <RowSelectionRadioColumn id="radio" />
        )}
        <GridColumn name="A" id="a" defaultWidth={50} getValue={(r) => r.a} />
        <NumericColumn
          name="B"
          id="b"
          defaultWidth={100}
          precision={2}
          getValue={(r: DummyRow) => r.b}
          align={"right"}
          sortable
        />
        <GridColumn name="C" id="c" defaultWidth={50} getValue={(r) => r.c} />
      </Grid>
    </FlexLayout>
  );
};

export const RowSelectionModes = RowSelectionModesTemplate.bind({});
