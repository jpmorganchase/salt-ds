import { Story } from "@storybook/react";
import { useCallback, useState } from "react";
import { Investor } from "./dummyData";
import { randomAmount } from "./utils";
import {
  Grid,
  GridColumn,
  RowKeyGetter,
  RowSelectionCheckboxColumn,
} from "../src";

export default {
  title: "Grid/New Grid",
  component: Grid,
  argTypes: {},
};

const serverSideDataRowKeyGetter: RowKeyGetter<Investor> = (row, index) =>
  `Row${index}`;
const serverSideRowCount = 200000;

const ServerSideDataTemplate: Story<{}> = (props) => {
  const [rows, setRows] = useState<Investor[]>(() => {
    const rowData: Investor[] = [];
    rowData.length = serverSideRowCount;
    return rowData;
  });

  const onVisibleRowRangeChange = useCallback((start: number, end: number) => {
    setRows((oldRows) => {
      const nextRows: Investor[] = [];
      nextRows.length = serverSideRowCount;
      for (let i = start; i < end; ++i) {
        if (oldRows[i]) {
          nextRows[i] = oldRows[i];
        } else {
          nextRows[i] = {
            name: `Name ${i}`,
            addedInvestors: [],
            location: `Location ${i}`,
            cohort: [`Cohort ${i}`],
            strategy: [`Strategy ${i}`],
            notes: "",
            amount: randomAmount(100, 300, 4),
          };
        }
      }
      return nextRows;
    });
  }, []);

  return (
    <Grid
      rowData={rows}
      rowKeyGetter={serverSideDataRowKeyGetter}
      className="grid"
      zebra={true}
      columnSeparators={true}
      onVisibleRowRangeChange={onVisibleRowRangeChange}
    >
      <RowSelectionCheckboxColumn id="rowSelection" />
      <GridColumn
        name="Name"
        id="name"
        defaultWidth={200}
        getValue={(x) => x.name}
      />
      <GridColumn
        name="Location"
        id="location"
        defaultWidth={150}
        getValue={(x) => x.location}
      />
      <GridColumn
        name="Cohort"
        id="cohort"
        defaultWidth={200}
        getValue={(x) => x.cohort}
      />
      <GridColumn
        name="Amount"
        id="amount"
        defaultWidth={200}
        getValue={(x) => x.amount.toFixed(4)}
        align="right"
      />
      <GridColumn
        name="Strategy"
        id="strategy"
        getValue={(x) => x.strategy.join(", ")}
      />
    </Grid>
  );
};
export const ServerSideData = ServerSideDataTemplate.bind({});
