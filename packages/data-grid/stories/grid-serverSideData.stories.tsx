import { DecoratorFn, Story } from "@storybook/react";
import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { rest } from "msw";
import { db, Investor, investorKeyGetter } from "./dummyData";
import { Grid, GridColumn, RowSelectionCheckboxColumn } from "../src";
import "./grid.stories.css";

export default {
  title: "Data Grid/Data Grid",
  component: Grid,
  parameters: {
    msw: {
      handlers: [
        rest.get("/api/investors", (req, res, ctx) => {
          const startParam = req.url.searchParams.get("start");
          const limitParam = req.url.searchParams.get("limit");
          const start = startParam ? Number(startParam) : 0;
          const limit = limitParam ? Number(limitParam) : 50;

          const response = db.investor.findMany({
            skip: start,
            take: limit,
          });

          return res(ctx.json(response));
        }),
      ],
    },
  },
};

const useInvestors = () => {
  return useInfiniteQuery<Investor[]>({
    queryKey: ["investors"],
    queryFn: async ({ pageParam = 0 }) => {
      const url = new URL("/api/investors", window.location.origin);
      url.searchParams.set("start", pageParam.toString());
      const res = await fetch(url.toString());
      return await res.json();
    },
    keepPreviousData: true,
    getNextPageParam: (_lastGroup, groups) => groups.flat().length,
  });
};

const queryClient = new QueryClient();
const ServerSideDataTemplate: Story<{}> = (props) => {
  const { fetchNextPage, data } = useInvestors();
  const rowData = data?.pages.flat() ?? [];
  const lastRow = rowData.length + 1;
  const onVisibleRowRangeChange = useCallback(
    (start: number, end: number) => {
      if (end + 10 > lastRow) {
        fetchNextPage();
      }
    },
    [lastRow]
  );
  return (
    <Grid
      rowData={rowData}
      rowKeyGetter={investorKeyGetter}
      className="grid"
      zebra={true}
      columnSeparators={true}
      onVisibleRowRangeChange={onVisibleRowRangeChange}
      headerIsFocusable={true}
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
        getValue={(x) => x.amount}
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
ServerSideData.decorators = [
  ((Story) => (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  )) as DecoratorFn,
];
