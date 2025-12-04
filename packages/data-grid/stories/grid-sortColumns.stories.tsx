/** biome-ignore-all lint/correctness/useUniqueElementIds: GridColumns need static ids */

import { Scrim, Spinner, useTheme } from "@salt-ds/core";
import { Grid, GridColumn, SortOrder } from "@salt-ds/data-grid";
import type { Decorator } from "@storybook/react-vite";
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { http } from "msw";
import { type CSSProperties, useEffect, useState } from "react";
import {
  createDummyInvestors,
  type Investor,
  investorKeyGetter,
  investors,
} from "./dummyData";
import "./grid.stories.css";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  parameters: {
    msw: {
      handlers: [
        http.get("/api/investors", ({ request }) => {
          const url = new URL(request.url);
          const sortBy = url.searchParams.get("sort_by");

          const orderBy = sortBy?.split(",").reduce(
            (acc, s) => {
              const [sortColumn, sortDirection] = s.split(".");

              if (
                sortColumn &&
                (sortDirection === "asc" || sortDirection === "desc")
              ) {
                acc[sortColumn] = sortDirection;
              }

              return acc;
            },
            {} as Record<string, "asc" | "desc">,
          );

          const response = investors.findMany(undefined, {
            orderBy,
            take: 50,
          });

          return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
          });
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
    placeholderData: keepPreviousData,
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
      style={
        {
          position: "relative",
          "--salt-overlayable-background":
            mode === "light"
              ? "var(--salt-color-gray-60-fade-background)"
              : "var(--salt-color-gray-300-fade-background)",
        } as CSSProperties
      }
    >
      <Scrim
        aria-label="Example Scrim"
        open={showFetching && !isFetchedAfterMount}
      >
        <Spinner size="medium" />
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
