import { FC, useRef, useState } from "react";
import { ColumnDefinition, createTextColumn, Grid } from "../../../src";
import { randomAmount, randomSide, randomStatus, randomString } from "../utils";
import Timeout = NodeJS.Timeout;

export interface LazyGridRowData {
  identifier: string;
  client: string;
  side: string;
  status: string;
  quantity: number;
}

const keyGetter = (x: LazyGridRowData, index: number) =>
  x ? x.identifier : `row_${index}`;

const columnDefinitions: ColumnDefinition<LazyGridRowData>[] = [
  createTextColumn("identifier", "Identifier", "identifier", 160),
  createTextColumn("client", "Client", "client", 160),
  createTextColumn("side", "Side", "side", 80),
];

export interface LazyGridProps {}

export const LazyGrid: FC<LazyGridProps> = (props) => {
  const [data, setData] = useState<LazyGridRowData[]>(() => {
    const initialData: LazyGridRowData[] = [];
    initialData.length = 1000;
    return initialData;
  });
  const loaderRef = useRef<Timeout>();

  const onRowRangeLoaded = (
    start: number,
    end: number,
    rows: LazyGridRowData[]
  ) => {
    console.log(`Loaded rows [${start}, ${end}]`);
    setData((oldData) => {
      const newData: LazyGridRowData[] = [];
      newData.length = oldData.length;
      const length = end - start + 1;
      for (let i = 0; i < length; i++) {
        newData[start + i] = rows[i];
      }
      return newData;
    });
  };

  const onVisibleRangeChanged = ([start, end]: [number, number]) => {
    console.log(`VisibleRowRangeChanged: [${start}, ${end}]`);
    if (loaderRef.current) {
      clearTimeout(loaderRef.current);
    }
    loaderRef.current = setTimeout(() => {
      const loadedRowRange: LazyGridRowData[] = [];
      for (let i = 0; i <= end - start; i++) {
        const fakeRow: LazyGridRowData = data[i + start] || {
          identifier: `${start + i} - ${randomString(20)}`,
          client: randomString(20),
          side: randomSide(),
          status: randomStatus(),
          quantity: randomAmount(),
        };
        loadedRowRange.push(fakeRow);
      }
      onRowRangeLoaded(start, end, loadedRowRange);
    }, 200);
  };

  return (
    <Grid
      columnDefinitions={columnDefinitions}
      getKey={keyGetter}
      data={data}
      onVisibleRowRangeChanged={onVisibleRangeChanged}
    />
  );
};
