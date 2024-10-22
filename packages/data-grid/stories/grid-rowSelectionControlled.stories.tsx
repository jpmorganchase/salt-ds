import { FlexLayout } from "@salt-ds/core";
import { useState } from "react";
import { Grid, GridColumn, RowSelectionCheckboxColumn } from "../src";
import { dummyRowKeyGetter, rowData } from "./dummyData";
import "./grid.stories.css";
import type { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

const RowSelectionControlledTemplate: StoryFn = () => {
  const [selection, setSelection] = useState<number[]>([]);

  const onRowSelected = (rowIndices: number[]) => {
    setSelection(rowIndices);
  };

  return (
    <FlexLayout direction="row">
      <Grid
        rowData={rowData}
        rowKeyGetter={dummyRowKeyGetter}
        className="grid-small"
        cellSelectionMode="none"
        columnSeparators={true}
        zebra={true}
        rowSelectionMode="multi"
        selectedRowIdxs={selection}
        onRowSelected={onRowSelected}
        headerIsFocusable={true}
      >
        <RowSelectionCheckboxColumn id="checkbox" />
        <GridColumn name="A" id="a" defaultWidth={50} getValue={(r) => r.a} />
      </Grid>
      <Grid
        rowData={rowData}
        rowKeyGetter={dummyRowKeyGetter}
        className="grid-small"
        cellSelectionMode="none"
        columnSeparators={true}
        zebra={true}
        rowSelectionMode="multi"
        selectedRowIdxs={selection}
        onRowSelected={onRowSelected}
        headerIsFocusable={true}
      >
        <RowSelectionCheckboxColumn id="checkbox" />
        <GridColumn name="A" id="a" defaultWidth={50} getValue={(r) => r.a} />
        <GridColumn name="B" id="b" defaultWidth={50} getValue={(r) => r.b} />
      </Grid>
    </FlexLayout>
  );
};

export const RowSelectionControlled = RowSelectionControlledTemplate.bind({});
