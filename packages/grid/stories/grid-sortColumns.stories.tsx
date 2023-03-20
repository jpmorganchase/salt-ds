import {
  CellEditor,
  DropdownCellEditor,
  Grid,
  GridColumn,
  SortOrder,
} from "../src";
import "./grid.stories.css";
import { Story } from "@storybook/react";
import { createDummyInvestors, Investor, investorKeyGetter } from "./dummyData";
import { useEffect, useState } from "react";

export default {
  title: "Data Grid/Data Grid",
  component: Grid,
  argTypes: {},
};

const dummyInvestors = createDummyInvestors();

const api = (sortOrder: SortOrder) =>
  new Promise((resolve) => {
    setTimeout(() => {
      if (sortOrder === SortOrder.ASC) {
        const sortedItems = [...dummyInvestors].sort((a, b) => {
          return a.amount - b.amount;
        });
        return resolve(sortedItems);
      }
      if (sortOrder === SortOrder.DESC) {
        const sortedItems = [...dummyInvestors].sort((a, b) => {
          return b.amount - a.amount;
        });
        return resolve(sortedItems);
      }
      return resolve([...dummyInvestors]);
    }, 1000);
  });

const SortColumnsTemplate: Story = () => {
  const [serverData, setServerData] = useState<Investor[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    void api(sortOrder ?? SortOrder.NONE).then((data) => {
      setServerData(data as Investor[]);
      setLoading(false);
    });
  }, [sortOrder]);

  const scoreOptions = ["-", "5%", "10%", "15%", "20%"];

  const onScoreChange = (row: Investor, rowIndex: number, value: string) => {
    dummyInvestors[rowIndex].score = value;
  };

  return (
    <Grid
      rowData={serverData}
      rowKeyGetter={investorKeyGetter}
      style={{ height: 600 }}
      headerIsFocusable
      className="grid"
      zebra={true}
      columnSeparators={true}
    >
      <GridColumn
        name="Name"
        id="name"
        defaultWidth={200}
        getValue={(rowData: Investor) => rowData.name}
        sortable
      />
      <GridColumn
        name="Strategy"
        id="strategy"
        getValue={(rowData: Investor) => rowData.strategy.join(", ")}
        sortable
      />
      <GridColumn
        name="Date incorporated"
        id="date"
        defaultWidth={150}
        getValue={(rowData: Investor) => rowData.date}
        sortable
      />
      <GridColumn
        name="Score"
        id="score"
        getValue={(r) => r.score}
        onChange={onScoreChange}
        sortable
        align="right"
        customSort={({ rowData, sortOrder }) => {
          // custom sort percentage score as number
          const sortedData = [...rowData].sort((a, b) => {
            const A = Number(a["score"]?.slice(0, length - 1));
            const B = Number(b["score"]?.slice(0, length - 1));

            return A < B ? -1 : 1;
          });

          if (sortOrder === SortOrder.DESC) {
            return sortedData.reverse();
          }

          return sortedData;
        }}
      >
        <CellEditor>
          <DropdownCellEditor options={scoreOptions} />
        </CellEditor>
      </GridColumn>
      <GridColumn
        name="Amount"
        id="amount"
        getValue={(rowData: Investor) =>
          loading ? "loading..." : rowData.amount
        }
        sortable
        onSortOrderChange={({ sortOrder }) => {
          setSortOrder(sortOrder);
        }}
      />
    </Grid>
  );
};

export const SortColumns = SortColumnsTemplate.bind({});
