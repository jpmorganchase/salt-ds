import { Grid, GridColumn, SortOrder } from "@salt-ds/data-grid";
import { Decorator } from "@storybook/react";
import {
  Investor,
  investorKeyGetter,
  db,
  createDummyInvestors,
} from "./dummyData";
import { useEffect, useState } from "react";
import { ContentStatus } from "@salt-ds/lab";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Scrim, useTheme } from "@salt-ds/core";
import { rest } from "msw";
import "./grid.stories.css";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  parameters: {
    msw: {
      handlers: [
        rest.get("/api/investors", (req, res, ctx) => {
          const sortBy = req.url.searchParams.get("sort_by");

          const orderBy =
            sortBy
              ?.split(",")
              .map((s) => {
                const [sortColumn, sortOrder] = s.split(".");
                if (sortOrder && sortColumn) {
                  return {
                    [sortColumn]: sortOrder,
                  } as Record<keyof Investor, SortOrder>;
                }
              })
              .filter(Boolean) ?? [];

          const response = db.investor.findMany({
            // @ts-ignore
            orderBy,
            take: 50,
          });

          return res(ctx.json(response));
        }),
      ],
    },
  },
};

type SortModel = {
  column: keyof Investor | undefined;
  order: SortOrder;
};

const getInvestors = async (sortModel: SortModel) => {
  const url = new URL("/api/investors", window.location.origin);
  if (sortModel.column && sortModel.order !== SortOrder.NONE) {
    url.searchParams.set("sort_by", `${sortModel.column}.${sortModel.order}`);
  }
  const res = await fetch(url.toString());
  return res.json();
};

const useInvestors = (sortModel: SortModel) => {
  return useQuery<Investor[]>({
    queryKey: ["investors", sortModel],
    queryFn: () => getInvestors(sortModel),
    keepPreviousData: true,
  });
};

const queryClient = new QueryClient();

export function ServerSideSort() {
  const [sortModel, setSortModel] = useState<SortModel>({
    column: undefined,
    order: SortOrder.NONE,
  });
  const [showFetching, setShowFetching] = useState(false);
  const { isLoading, data, isFetching, isFetchedAfterMount } =
    useInvestors(sortModel);

  useEffect(() => {
    if (isFetching) {
      const timeout = setTimeout(() => {
        setShowFetching(true);
      }, 800);

      return () => {
        timeout && clearTimeout(timeout);
      };
    }
  }, [isFetching]);

  const { mode } = useTheme();

  if (isLoading) return <div>loading...</div>;

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
        open={showFetching && !isFetchedAfterMount}
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
          onSortOrderChange={({ sortOrder }) => {
            setSortModel({ order: sortOrder, column: "name" });
          }}
        />
        <GridColumn
          name="Strategy"
          id="strategy"
          getValue={(rowData: Investor) => rowData.strategy.join(", ")}
          sortable
          onSortOrderChange={({ sortOrder }) => {
            setSortModel({ order: sortOrder, column: "strategy" });
          }}
        />
        <GridColumn
          name="Date incorporated"
          id="date"
          defaultWidth={150}
          getValue={(rowData: Investor) => rowData.date}
          sortable
          onSortOrderChange={({ sortOrder }) => {
            setSortModel({ order: sortOrder, column: "date" });
          }}
        />
        <GridColumn
          name="Amount"
          id="amount"
          getValue={(rowData: Investor) =>
            showFetching ? "loading..." : rowData.amount
          }
          sortable
          onSortOrderChange={({ sortOrder }) => {
            setSortModel({ order: sortOrder, column: "amount" });
          }}
        />
      </Grid>
    </div>
  );
}

ServerSideSort.decorators = [
  ((Story) => (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  )) as Decorator,
];

const dummyInvestors = createDummyInvestors({ limit: 50 });

export function ClientSideSort() {
  return (
    <Grid
      rowData={dummyInvestors || []}
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
        name="Amount"
        id="amount"
        getValue={(rowData: Investor) => rowData.amount}
        sortable
        customSort={({ rowData, sortOrder }) => {
          const sortedData = [...rowData].sort((a, b) => {
            return a.amount < b.amount ? -1 : 1;
          });

          if (sortOrder === SortOrder.DESC) {
            return sortedData.reverse();
          }

          return sortedData;
        }}
      />
    </Grid>
  );
}
