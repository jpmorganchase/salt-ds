import {
  CellEditor,
  DropdownCellEditor,
  Grid,
  GridColumn,
  SortOrder,
} from "../src";
import "./grid.stories.css";
import { createDummyInvestors, Investor, investorKeyGetter } from "./dummyData";
import { useState } from "react";
import { Scrim, ContentStatus } from "@salt-ds/lab";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useTheme } from "@salt-ds/core";

export default {
  title: "Data Grid/Data Grid",
  component: Grid,
  argTypes: {},
};

const dummyInvestors = createDummyInvestors();

const api = (sortOrder: SortOrder): Promise<Investor[]> =>
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

const queryClient = new QueryClient();

export function SortColumns() {
  return (
    <QueryClientProvider client={queryClient}>
      <SortColumnsImpl />
    </QueryClientProvider>
  );
}

function SortColumnsImpl() {
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NONE);

  const { isLoading, data, isFetching, isFetchedAfterMount } = useQuery<
    Investor[]
  >(["sortOrder", sortOrder], () => api(sortOrder), {
    keepPreviousData: true,
  });

  const { mode } = useTheme();

  if (isLoading) return <div>loading...</div>;

  const scoreOptions = ["-", "5%", "10%", "15%", "20%"];

  const onScoreChange = (row: Investor, rowIndex: number, value: string) => {
    dummyInvestors[rowIndex].score = value;
  };

  return (
    <div
      style={{
        position: "relative",
        // @ts-ignore
        "--salt-overlayable-background":
          mode === "light"
            ? "var(--salt-color-gray-60-fade-background)"
            : "var(--salt-color-gray-300-fade-background)",
      }}
    >
      <Scrim
        aria-label="Example Scrim"
        open={isFetching && !isFetchedAfterMount}
        enableContainerMode
      >
        <ContentStatus status="loading" />
      </Scrim>

      <Grid
        rowData={data || []}
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
              const A = Number(a["score"]?.slice(0, a.score.length - 1));
              const B = Number(b["score"]?.slice(0, b.score.length - 1));

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
            isFetching ? "loading..." : rowData.amount
          }
          sortable
          onSortOrderChange={({ sortOrder }) => {
            setSortOrder(sortOrder);
          }}
        />
      </Grid>
    </div>
  );
}
