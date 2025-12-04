import type { Decorator, StoryFn } from "@storybook/react-vite";
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { http } from "msw";
import { useCallback } from "react";
import { Grid, GridColumn, RowSelectionCheckboxColumn } from "../src";
import { type Investor, investorKeyGetter, investors } from "./dummyData";
import "./grid.stories.css";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  parameters: {
    msw: {
      handlers: [
        http.get("/api/investors", ({ request }) => {
          const url = new URL(request.url);
          const startParam = url.searchParams.get("start");
          const limitParam = url.searchParams.get("limit");
          const start = startParam ? Number(startParam) : 0;
          const limit = limitParam ? Number(limitParam) : 50;

          const response = investors.findMany(undefined, {
            skip: start,
            take: limit,
          });

          return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
          });
        }),
      ],
    },
  },
};

const useInvestors = () => {
  return useInfiniteQuery<Investor[]>({
    queryKey: ["investors"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const url = new URL("/api/investors", window.location.origin);
      url.searchParams.set("start", String(pageParam));
      const res = await fetch(url.toString());
      return res.json();
    },
    placeholderData: keepPreviousData,
    getNextPageParam: (_, pages) => pages.flat().length,
  });
};

const queryClient = new QueryClient();
const ServerSideDataTemplate: StoryFn = (props) => {
  const { fetchNextPage, data } = useInvestors();
  const rowData = data?.pages.flat() ?? [];
  const lastRow = rowData.length + 1;
  const onVisibleRowRangeChange = useCallback(
    (start: number, end: number) => {
      if (end + 10 > lastRow) {
        void fetchNextPage();
      }
    },
    [lastRow, fetchNextPage],
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
      <GridColumn<Investor>
        name="Name"
        id="name"
        defaultWidth={200}
        getValue={(x) => x.name}
      />
      <GridColumn<Investor>
        name="Location"
        id="location"
        defaultWidth={150}
        getValue={(x) => x.location}
      />
      <GridColumn<Investor>
        name="Cohort"
        id="cohort"
        defaultWidth={200}
        getValue={(x) => x.cohort}
      />
      <GridColumn<Investor>
        name="Amount"
        id="amount"
        defaultWidth={200}
        getValue={(x) => x.amount}
        align="right"
      />
      <GridColumn<Investor>
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
  )) as Decorator,
];
