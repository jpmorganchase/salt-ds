import { useCallback, useMemo } from "react";
import {
  Grid,
  GridCellValueProps,
  GridColumn,
  RowSelectionCheckboxColumn,
} from "../src";
import { LinearProgress } from "@salt-ds/lab";
import "./grid.stories.css";
import { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

interface BidAskPrice {
  bid: number;
  ask: number;
  precision: number;
}

interface CurrencyPairRow {
  currencyPair: string;
  bidAskPrice: BidAskPrice;
  percentage: number;
}

const BidAskCellValue = (props: GridCellValueProps<CurrencyPairRow>) => {
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

const PercentageCellValue = (props: GridCellValueProps<CurrencyPairRow>) => {
  const { row } = props;

  const { percentage } = row.data;

  return (
    <div className="percentage">
      <LinearProgress value={percentage} />
    </div>
  );
};

const CellCustomizationTemplate: StoryFn<{}> = () => {
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
      headerIsFocusable={true}
    >
      <RowSelectionCheckboxColumn id="s" />
      <GridColumn
        name="Currency Pair"
        id="ccyPair"
        defaultWidth={100}
        getValue={(r) => r.currencyPair}
        sortable
      />
      <GridColumn
        name="Bid/Ask"
        id="bidAsk"
        defaultWidth={120}
        getValue={(r) => r.bidAskPrice.bid}
        sortable
        cellValueComponent={BidAskCellValue}
      />
      <GridColumn
        name="Percentage"
        id="percentage"
        cellValueComponent={PercentageCellValue}
        defaultWidth={200}
        minWidth={120}
        sortable
      />
    </Grid>
  );
};

export const CellCustomization = CellCustomizationTemplate.bind({});
