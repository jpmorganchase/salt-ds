import { CellEditor, DropdownCellEditor, Grid, GridColumn } from "../src";
import "./grid.stories.css";
import { Story } from "@storybook/react";
import { createDummyInvestors, Investor, investorKeyGetter } from "./dummyData";

export default {
  title: "Data Grid/Data Grid",
  component: Grid,
  argTypes: {},
};

const dummyInvestors = createDummyInvestors();

const SortColumnsTemplate: Story<{}> = () => {
  const scoreOptions = ["-", "5%", "10%", "15%", "20%"];
  const onScoreChange = (row: Investor, rowIndex: number, value: string) => {
    dummyInvestors[rowIndex].score = value;
  };

  return (
    <Grid
      rowData={dummyInvestors}
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
        isSortable
      />
      <GridColumn
        name="Strategy"
        id="strategy"
        getValue={(rowData: Investor) => rowData.strategy.join(", ")}
        isSortable
      />
      <GridColumn
        name="Date incorporated"
        id="date"
        defaultWidth={150}
        getValue={(rowData: Investor) => rowData.date}
        isSortable
      />
      <GridColumn
        name="Score"
        id="score"
        getValue={(r) => r.score}
        onChange={onScoreChange}
        isSortable
        customSort={({ rowData, sortOrder }) => {
          // custom sort percentage score as number
          let sortedData = [...rowData].sort((a, b) => {
            const A = Number(a["score"]?.slice(0, length - 1));
            const B = Number(b["score"]?.slice(0, length - 1));

            return A < B ? -1 : 1;
          });

          if (sortOrder === "desc") {
            return sortedData.reverse();
          }

          return sortedData;
        }}
      >
        <CellEditor>
          <DropdownCellEditor options={scoreOptions} />
        </CellEditor>
      </GridColumn>
    </Grid>
  );
};

export const SortColumns = SortColumnsTemplate.bind({});
