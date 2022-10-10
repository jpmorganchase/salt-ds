import { ColumnGroup, Grid, GridColumn, GridProps } from "../../src";
import { DummyRow, dummyRowKeyGetter, rowData } from "./GridVariantExample";
import "./Examples.css";

export const GridColumnGroupExample = (props: Partial<GridProps<DummyRow>>) => {
  return (
    <Grid
      rowData={rowData}
      rowKeyGetter={dummyRowKeyGetter}
      className="grid-column-groups"
      zebra={true}
      {...props}
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
