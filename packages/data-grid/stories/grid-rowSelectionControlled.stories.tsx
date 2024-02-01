import {
  Grid,
  GridColumn,
  GridProps,
  RowSelectionCheckboxColumn,
} from "../src";
import { DummyRow, dummyRowKeyGetter, rowData } from "./dummyData";
import { useState } from "react";
import { FlexLayout } from "@salt-ds/core";
import "./grid.stories.css";
import { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

const RowSelectionControlledTemplate: StoryFn<{}> = () => {
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
