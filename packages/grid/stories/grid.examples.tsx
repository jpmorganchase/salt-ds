import {
  Grid,
  GridProps,
  GridColumn,
  ColumnGroup,
  NumericColumn,
  RowKeyGetter,
  RowSelectionCheckboxColumn,
  RowSelectionRadioColumn,
} from "../src";
import "./grid.examples.css";

interface DummyRow {
  id: string;
  a: string;
  b: number;
  c: string;
}

const rowKeyGetter: RowKeyGetter<DummyRow> = (r) => r.id;

const rowData: DummyRow[] = [...new Array(5)].map((_, i) => ({
  id: `Row${i}`,
  a: `A${i}`,
  b: i * 100,
  c: `C${i}`,
}));

export const GridVariantExample = (props: Partial<GridProps<DummyRow>>) => {
  return (
    <Grid
      rowData={rowData}
      rowKeyGetter={rowKeyGetter}
      className="grid"
      {...props}
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
  );
};

export const GridAnatomyExample = (props: Partial<GridProps<DummyRow>>) => {
  return (
    <Grid
      rowData={[rowData[0]]}
      rowKeyGetter={rowKeyGetter}
      className="grid"
      {...props}
    >
      <GridColumn name="A" id="a" getValue={(r) => r.a} />
    </Grid>
  );
};

export const GridColumnGroupExample = (props: Partial<GridProps<DummyRow>>) => {
  return (
    <Grid
      rowData={rowData}
      rowKeyGetter={rowKeyGetter}
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

export const RowSelectionModesExample = (
  props: Partial<GridProps<DummyRow>>
) => {
  const { rowSelectionMode } = props;
  return (
    <Grid
      rowData={rowData}
      rowKeyGetter={rowKeyGetter}
      className="grid"
      cellSelectionMode="none"
      columnSeparators={true}
      defaultSelectedRowIdxs={
        rowSelectionMode === "single"
          ? new Set([1])
          : rowSelectionMode === "multi"
          ? new Set([0, 3])
          : undefined
      }
      zebra={true}
      {...props}
    >
      {rowSelectionMode === "multi" && <RowSelectionCheckboxColumn id="s" />}
      {rowSelectionMode === "single" && <RowSelectionRadioColumn id="s" />}
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
  );
};
