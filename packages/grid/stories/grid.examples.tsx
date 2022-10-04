import { ChangeEvent, useState } from "react";
import {
  Grid,
  GridProps,
  GridColumn,
  ColumnGroup,
  NumericColumn,
  RowKeyGetter,
  RowSelectionCheckboxColumn,
  RowSelectionRadioColumn,
  GridRowSelectionMode,
} from "../src";
import "./grid.examples.css";
import { Checkbox, FlexItem, FlexLayout } from "../../core";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "../../lab";

interface DummyRow {
  id: string;
  a: string;
  b: number;
  c: string;
}

const rowKeyGetter: RowKeyGetter<DummyRow> = (r) => r.id;

const rowData: DummyRow[] = [...new Array(50)].map((_, i) => ({
  id: `Row${i}`,
  a: `A${i}`,
  b: i * 100,
  c: `C${i}`,
}));

export const GridVariantExample = (props: Partial<GridProps<DummyRow>>) => {
  const variants = [`primary`, `secondary`, `zebra`];
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
              <ToggleButton ariaLabel="primary" tooltipText="Primary">
                Primary
              </ToggleButton>
              <ToggleButton ariaLabel="secondary" tooltipText="Secondary">
                Secondary
              </ToggleButton>
              <ToggleButton ariaLabel="zebra" tooltipText="Zebra">
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
        rowKeyGetter={rowKeyGetter}
        className="grid"
        variant={index === 1 ? "secondary" : "primary"}
        zebra={index === 2 ? true : false}
        columnSeparators={separators}
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
    </FlexLayout>
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
          <ToggleButton ariaLabel="multi" tooltipText="Multi">
            Multi
          </ToggleButton>
          <ToggleButton ariaLabel="single" tooltipText="Single">
            Single
          </ToggleButton>
          <ToggleButton ariaLabel="none" tooltipText="None">
            None
          </ToggleButton>
        </ToggleButtonGroup>
      </FlexItem>
      <Grid
        rowData={rowData}
        rowKeyGetter={rowKeyGetter}
        className="grid"
        cellSelectionMode="none"
        columnSeparators={true}
        zebra={true}
        {...props}
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
        />
        <GridColumn name="C" id="c" defaultWidth={50} getValue={(r) => r.c} />
      </Grid>
    </FlexLayout>
  );
};

export const ControlledRowSelectionExample = (
  props: Partial<GridProps<DummyRow>>
) => {
  const [selection, setSelection] = useState<number[]>([]);

  const onRowSelected = (rowIndices: number[]) => {
    setSelection(rowIndices);
  };

  return (
    <FlexLayout direction="row">
      <Grid
        rowData={rowData}
        rowKeyGetter={rowKeyGetter}
        className="grid"
        cellSelectionMode="none"
        columnSeparators={true}
        zebra={true}
        rowSelectionMode="multi"
        selectedRowIdxs={selection}
        onRowSelected={onRowSelected}
        {...props}
      >
        <RowSelectionCheckboxColumn id="checkbox" />
        <GridColumn name="A" id="a" defaultWidth={50} getValue={(r) => r.a} />
      </Grid>
      <Grid
        rowData={rowData}
        rowKeyGetter={rowKeyGetter}
        className="grid"
        cellSelectionMode="none"
        columnSeparators={true}
        zebra={true}
        rowSelectionMode="multi"
        selectedRowIdxs={selection}
        onRowSelected={onRowSelected}
        {...props}
      >
        <RowSelectionCheckboxColumn id="checkbox" />
        <GridColumn name="A" id="a" defaultWidth={50} getValue={(r) => r.a} />
        <GridColumn name="B" id="b" defaultWidth={50} getValue={(r) => r.b} />
      </Grid>
    </FlexLayout>
  );
};
