import {
  FlexItem,
  FlexLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import type { StoryFn } from "@storybook/react";
import { type SyntheticEvent, useState } from "react";
import {
  Grid,
  GridColumn,
  type GridRowSelectionMode,
  NumericColumn,
  RowSelectionCheckboxColumn,
  RowSelectionRadioColumn,
} from "../src";
import { type DummyRow, dummyRowKeyGetter, rowData } from "./dummyData";
import "./grid.stories.css";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

const RowSelectionModesTemplate: StoryFn<{}> = () => {
  const [rowSelectionMode, setRowSelectionMode] =
    useState<GridRowSelectionMode>("multi");

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setRowSelectionMode(event.currentTarget.value as GridRowSelectionMode);
  };

  return (
    <FlexLayout direction="column">
      <FlexItem>
        <ToggleButtonGroup onChange={onChange} value={rowSelectionMode}>
          <ToggleButton value="multi">Multi</ToggleButton>
          <ToggleButton value="single">Single</ToggleButton>
          <ToggleButton value="none">None</ToggleButton>
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
