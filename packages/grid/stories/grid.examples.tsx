import {
  ChangeEvent,
  MouseEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
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
  GridCellValueProps,
} from "../src";
import "./grid.examples.css";
import { Button, Checkbox, FlexItem, FlexLayout } from "../../core";
import {
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "../../lab";
import { StarIcon } from "../../lab/src/contact-details/internal/StarIcon";
import { FavoriteIcon, LinkedIcon } from "../../icons";

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
        className="grid-small"
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
        className="grid-small"
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

export interface BidAskPrice {
  bid: number;
  ask: number;
  precision: number;
}

export interface CurrencyPairRow {
  currencyPair: string;
  bidAskPrice: BidAskPrice;
  percentage: number;
}

export const BidAskCellValue = (props: GridCellValueProps<CurrencyPairRow>) => {
  const { row } = props;

  const { bid, ask, precision } = row.data.bidAskPrice;
  const bidText = bid.toFixed(precision);
  const askText = ask.toFixed(precision);

  return (
    <div className="bidAskCellValue">
      <span className="bid">{bidText}</span>
      <span>/</span>
      <span className="ask">{askText}</span>
    </div>
  );
};

export const PercentageCellValue = (
  props: GridCellValueProps<CurrencyPairRow>
) => {
  const { row } = props;

  const { percentage } = row.data;

  return (
    <div className="percentage">
      <LinearProgress value={percentage} />
    </div>
  );
};

export const ButtonsCellValue = (
  props: GridCellValueProps<CurrencyPairRow>
) => {
  return (
    <FlexLayout
      className="buttons"
      align="center"
      justify="center"
      direction="row"
      gap={1}
    >
      <Button>
        <FavoriteIcon size={12} />
      </Button>
      <Button>
        <LinkedIcon />
      </Button>
    </FlexLayout>
  );
};

export const CellCustomizationExample = () => {
  const rowData: CurrencyPairRow[] = useMemo(() => {
    const currencies = ["AUD", "USD", "SGD", "GBP", "HKD", "NZD", "EUR"];
    const result: CurrencyPairRow[] = [];
    for (let i = 0; i < currencies.length - 1; ++i) {
      for (let j = i + 1; j < currencies.length; ++j) {
        result.push({
          currencyPair: [currencies[i], currencies[j]].join("/"),
          bidAskPrice: {
            precision: 2,
            bid: Math.random() * 3,
            ask: Math.random() * 3,
          },
          percentage: Math.round(Math.random() * 100),
        });
      }
    }
    return result;
  }, []);

  const rowKeyGetter = useCallback(
    (row: CurrencyPairRow) => row.currencyPair,
    []
  );

  return (
    <Grid
      rowData={rowData}
      rowKeyGetter={rowKeyGetter}
      className="grid"
      zebra={true}
      columnSeparators={true}
    >
      <RowSelectionCheckboxColumn id="s" />
      <GridColumn
        name="Currency Pair"
        id="ccyPair"
        defaultWidth={100}
        getValue={(r) => r.currencyPair}
      />
      <GridColumn
        name="Bid/Ask"
        id="bidAsk"
        defaultWidth={120}
        getValue={(r) => r.currencyPair}
        cellValueComponent={BidAskCellValue}
      />
      <GridColumn
        name="Percentage"
        id="percentage"
        cellValueComponent={PercentageCellValue}
        defaultWidth={200}
      />
      <GridColumn
        name="Buttons"
        id="buttons"
        cellValueComponent={ButtonsCellValue}
      />
    </Grid>
  );
};

export const CssVariablesExample = (props: Partial<GridProps<DummyRow>>) => {
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
        className="grid-css-customization"
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
