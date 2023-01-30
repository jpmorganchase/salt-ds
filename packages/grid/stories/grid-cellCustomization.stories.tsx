import { useState } from "react";
import {
  Grid,
  GridCellValueProps,
  GridColumn,
  RowSelectionCheckboxColumn,
} from "../src";
import { LinearProgress, Tooltip, useTooltip } from "@salt-ds/lab";
import "./grid.stories.css";
import { FavoriteIcon } from "@salt-ds/icons";
import { Button, FlexLayout } from "@salt-ds/core";

export default {
  title: "Data Grid/Data Grid",
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

const ButtonsCellValue = ({
  value,
}: GridCellValueProps<CurrencyPairRow, string>) => {
  const { getTriggerProps, getTooltipProps } = useTooltip();

  if (!value) return null;

  const openProps = getTooltipProps({
    title: `Favorite ${value}`,
    status: "info",
  });

  return (
    <FlexLayout
      className="buttons"
      align="center"
      justify="center"
      direction="row"
      gap={1}
    >
      <Tooltip {...openProps} />
      <Button {...getTriggerProps<typeof Button>()}>
        <FavoriteIcon />
      </Button>
    </FlexLayout>
  );
};

const rowKeyGetter = (row: CurrencyPairRow) => row.currencyPair;

export const CellCustomization = () => {
  const [rowData] = useState<CurrencyPairRow[]>(() => {
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
  });

  return (
    <Grid
      rowData={rowData}
      rowKeyGetter={rowKeyGetter}
      className="grid"
      zebra
      columnSeparators
      headerIsFocusable
    >
      <RowSelectionCheckboxColumn id="s" />
      <GridColumn
        name="Currency Pair"
        id="ccyPair"
        defaultWidth={100}
        getValue={(r: CurrencyPairRow) => r.currencyPair}
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
        minWidth={120}
      />
      <GridColumn
        defaultWidth={50}
        name="Action"
        id="button"
        getValue={(r) => r.currencyPair}
        cellValueComponent={ButtonsCellValue}
      />
    </Grid>
  );
};
