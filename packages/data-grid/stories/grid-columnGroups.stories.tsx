import { ColumnGroup, Grid, GridColumn, GridProps } from "../src";
import { DummyRow, dummyRowKeyGetter, rowData } from "./dummyData";
import "./grid.stories.css";
import { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

const ColumnGroupsTemplate: StoryFn<{}> = () => {
  return (
    <Grid
      rowData={rowData}
      rowKeyGetter={dummyRowKeyGetter}
      className="grid-column-groups"
      zebra={true}
    >
      <ColumnGroup name="Group One" id="group_one">
        <GridColumn id="a" name="A" getValue={(r) => r.a} />
        <GridColumn id="b" name="B" getValue={(r) => r.b} />
      </ColumnGroup>
      <ColumnGroup name="Group Two" id="group_two">
        <GridColumn id="c" name="C" getValue={(r) => r.c} />
      </ColumnGroup>
    </Grid>
  );
};

export const ColumnGroups = ColumnGroupsTemplate.bind({});
