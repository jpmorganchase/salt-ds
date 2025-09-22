/** biome-ignore-all lint/correctness/useUniqueElementIds: GridColumns need static ids */
import { Grid, GridColumn } from "@salt-ds/data-grid";
import { ColorCellValue, type ColorValueCellProps } from "./ValueCells";

type SentimentData = {
  sentiment: string;
  feeling: string;
} & ColorValueCellProps;

const data = [
  { sentiment: "Neutral", color: "gray", feeling: "Comfort" },
  { sentiment: "Accented", color: "accent", feeling: "Trust" },
  { sentiment: "Caution", color: "orange", feeling: "Carefulness" },
  { sentiment: "Negative", color: "red", feeling: "Negativity" },
  { sentiment: "Positive", color: "green", feeling: "Positivity" },
] as SentimentData[];

const rowIdGetter = (row: SentimentData) => row.sentiment;

export const Sentiment = () => {
  return (
    <Grid
      rowData={data}
      rowKeyGetter={rowIdGetter}
      zebra={false}
      style={{
        width: "var(--grid-total-width)",
        height: "var(--grid-total-height)",
      }}
    >
      <GridColumn
        name="Sentiment"
        id="sentiment"
        defaultWidth={100}
        getValue={(r) => r.sentiment}
      />
      <GridColumn
        name="Color"
        id="color"
        defaultWidth={120}
        getValue={(r) => r.color}
        cellValueComponent={ColorCellValue}
      />
      <GridColumn
        name="Feeling"
        id="feeling"
        defaultWidth={150}
        getValue={(r) => r.feeling}
      />
    </Grid>
  );
};
