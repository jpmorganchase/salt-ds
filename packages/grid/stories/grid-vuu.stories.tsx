import {
  GridVuu,
  RowKeyGetter,
  VuuBidAskCell,
  VuuChartCell,
  VuuColumnDefinition,
  VuuConfig,
  VuuRow,
} from "@jpmorganchase/uitk-grid";

export default {
  title: "Lab/Grid/Vuu",
  component: GridVuu,
};

const getKey: RowKeyGetter<VuuRow> = (row, index) => {
  if (row) {
    return row.key;
  }
  return `R${index}`;
};

const columnDefinitions: VuuColumnDefinition[] = [
  {
    key: "bidAsk",
    type: "bidAsk",
    header: "Bid/Ask",
    getValue: (r) => [r[11], r[8]],
    cellFactory: { createCell: (r) => new VuuBidAskCell(r[11], r[8]) },
  },
  {
    key: "ask",
    type: "number",
    header: "Ask",
    getValue: (r) => r[8],
  },
  {
    key: "askChart",
    type: "chart",
    header: "Ask Chart",
    getValue: (r) => r[8],
    cellFactory: { createCell: (r) => new VuuChartCell([r[8]]) },
  },
  {
    key: "askSize",
    type: "number",
    header: "Ask Size",
    getValue: (r) => r[9],
  },
  {
    key: "askSizeChart",
    type: "chart",
    header: "Ask Size Chart",
    getValue: (r) => r[9],
    cellFactory: { createCell: (r) => new VuuChartCell([r[8]]) },
  },
  {
    key: "bbg",
    type: "string",
    header: "BBG",
    getValue: (r) => r[10],
  },
  {
    key: "bid",
    type: "number",
    header: "Bid",
    getValue: (r) => r[11],
  },
  {
    key: "bidSize",
    type: "number",
    header: "Bid Size",
    getValue: (r) => r[12],
  },
  {
    key: "close",
    type: "number",
    header: "Close",
    getValue: (r) => r[13],
  },
  {
    key: "currency",
    type: "string",
    header: "Currency",
    getValue: (r) => r[14],
  },
  {
    key: "description",
    type: "string",
    header: "Description",
    getValue: (r) => r[15],
  },
];

const vuuConfig: VuuConfig = {
  module: "SIMUL",
  table: "instrumentPrices",
  columns: [
    "ask",
    "askSize",
    "bbg",
    "bid",
    "bidSize",
    "close",
    "currency",
    "description",
    "exchange",
    "isin",
    "last",
    "lotSize",
    "open",
    "phase",
    "ric",
    "scenario",
  ],
};

export const GridVuuExample = () => {
  return (
    <GridVuu
      getKey={getKey}
      columnDefinitions={columnDefinitions}
      vuuConfig={vuuConfig}
    />
  );
};
