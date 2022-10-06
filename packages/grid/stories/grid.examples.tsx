import {
  ChangeEvent,
  MouseEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Story } from "@storybook/react";
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
  TextCellEditor,
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
import { FavoriteIcon, LinkedIcon, UndoIcon } from "../../icons";
import { CellEditor } from "../src/CellEditor";

export default {
  title: "Examples",
  component: Grid,
  argTypes: {},
};

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

export const RowSelectionModesExampleTemplate: Story<{}> = (
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
export const RowSelectionModesExample = RowSelectionModesExampleTemplate.bind(
  {}
);

RowSelectionModesExample.args = {};

interface GridCssVar {
  name: string;
  value?: string;
  description: string;
}

const cssVarKeyGetter: RowKeyGetter<GridCssVar> = (row: GridCssVar) => row.name;

export const CssVariablesExample = (props: Partial<GridProps<GridCssVar>>) => {
  const variants = [`primary`, `secondary`, `zebra`];
  const [separators, setSeparators] = useState(false);
  const [index, setIndex] = useState(0);
  const [changes, setChanges] = useState<Array<() => void>>([]);

  const [cssVars, setCssVars] = useState<GridCssVar[]>([
    {
      name: "--uitkGrid-row-height",
      description: "Row height",
    },
    {
      name: "--uitkGrid-padding",
      description: "Left and right padding of grid cells and headers",
    },
    {
      name: "--uitkGrid-fontSize",
      description: "Font size for grid cells",
    },
    {
      name: "--uitkGrid-header-fontSize",
      description: "Font size for column headers",
    },
    {
      name: "--uitkGrid-dividerGap",
      description: "Controls the size of the column header separator",
    },
    {
      name: "--uitkGrid-background-primary",
      description: "Background in primary mode",
    },
    {
      name: "--uitkGrid-background-secondary",
      description: "Background in secondary mode",
    },
    {
      name: "--uitkGrid-zebraColor",
      description: "Background color of odd rows in zebra mode",
    },
    {
      name: "--uitkGrid-row-background-hover",
      description: "Background color of the row under the mouse cursor",
    },
    {
      name: "--uitkGrid-row-background-selected",
      description: "Background color of selected rows",
    },
    {
      name: "--uitkGrid-row-borderColor-selected",
      description: "Border color of selected rows",
    },
    {
      name: "--uitkGrid-cell-background-selected",
      description: "Background color of selected cells",
    },
    {
      name: "--uitkGrid-editableCell-borderColor",
      description: "Border color of editable cells",
    },
    {
      name: "--uitkGrid-editableCell-borderColor-hover",
      description: "Border color of the editable cell under the mouse cursor",
    },
    {
      name: "--uitkGrid-editableCell-background-active",
      description: "Background color of editable cells when in edit mode",
    },
    {
      name: "--uitkGrid-editableCell-color-active",
      description: "Font color of editable cells when in edit mode",
    },
    {
      name: "--uitkGrid-header-color",
      description: "Font color applied to column headers",
    },
    {
      name: "--uitkGrid-headerColumnSeparator-color",
      description: "Color of column header separators",
    },
    {
      name: "--uitkGrid-headerRowSeparator-color",
      description:
        "Color of the separator between column headers and grid body",
    },
    {
      name: "--uitkGrid-groupHeaderRowSeparator-color",
      description:
        "Color of the separator between column group headers and column headers",
    },
    {
      name: "--uitkGrid-groupHeader-color",
      description: "Foreground color of column group headers",
    },
    {
      name: "--uitkGrid-shadow-color",
      description:
        "Color of the shadow that separates pinned and unpinned columns",
    },
    {
      name: "--uitkGrid-columnDropTarget-color",
      description: "Color of column drop targets",
    },
    {
      name: "--uitkGrid-cursor-borderColor",
      description: "Keyboard cursor (focused cell) border color",
    },
    {
      name: "--uitkGrid-borderColor",
      description: "Border color of the grid (when framed)",
    },
    {
      name: "--uitkGrid-rowDivider-color",
      description: "Color of row separators",
    },
    {
      name: "--uitkGrid-columnDivider-color",
      description: "Color of column separators (when enabled)",
    },
    {
      name: "--uitkGrid-rowDivider-color-divided",
      description: "Color of row dividers between groups or rows",
    },
  ]);

  const updateCss = (rowIndex: number, value?: string) => {
    setCssVars((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...prev[rowIndex], value };
      return next;
    });
  };

  const onCssVarChange = (row: GridCssVar, rowIndex: number, value: string) => {
    const oldValue = row.value;
    updateCss(rowIndex, value);
    setChanges((old) => {
      const nextChanges = old.slice(old.length - 10);
      nextChanges.push(() => updateCss(rowIndex, oldValue));
      return nextChanges;
    });
  };

  const onUndo = () => {
    const nextChanges = [...changes];
    const change = nextChanges.pop()!;
    setChanges(nextChanges);
    change();
  };

  const style = useMemo(() => {
    return Object.fromEntries(cssVars.map((v) => [v.name, v.value]));
  }, [cssVars]);

  const onVariantChange: ToggleButtonGroupChangeEventHandler = (
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
            <ToggleButtonGroup onChange={onVariantChange} selectedIndex={index}>
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
          <FlexItem>
            <Button
              variant="secondary"
              onClick={onUndo}
              disabled={changes.length === 0}
            >
              <UndoIcon />
              {` Undo`}
            </Button>
          </FlexItem>
        </FlexLayout>
      </FlexItem>
      <Grid
        rowData={cssVars}
        rowKeyGetter={cssVarKeyGetter}
        className="grid-css-customization"
        variant={index === 1 ? "secondary" : "primary"}
        zebra={index === 2 ? true : false}
        columnSeparators={separators}
        style={style}
        {...props}
      >
        <RowSelectionCheckboxColumn id="s" />
        <GridColumn
          name="Name"
          id="name"
          defaultWidth={250}
          getValue={(r) => r.name}
        />
        <GridColumn
          name="Value"
          id="value"
          getValue={(r) => r.value || ""}
          onChange={onCssVarChange}
        >
          <CellEditor>
            <TextCellEditor />
          </CellEditor>
        </GridColumn>
        <GridColumn
          name="Description"
          id="description"
          defaultWidth={400}
          getValue={(r) => r.description}
        />
      </Grid>
    </FlexLayout>
  );
};
