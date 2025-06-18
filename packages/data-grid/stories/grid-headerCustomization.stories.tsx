import {
  FlexItem,
  FlexLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon, MenuIcon } from "@salt-ds/icons";
import { MenuButton } from "@salt-ds/lab";
import {
  createContext,
  type SyntheticEvent,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ColumnGroup,
  type ColumnGroupCellValueProps,
  Grid,
  type GridCellValueProps,
  GridColumn,
  type GridHeaderValueProps,
  NumericColumn,
} from "../src";
import { randomInt, randomNumber } from "./utils";
import "./grid.stories.css";
import type { StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

interface SalesInfo {
  itemsSold: number;
}

interface ExampleRow {
  name: string;
  price: number;
  monthlySales: SalesInfo[];
  total: number;
  totalCount: number;
}

type SalesViewMode = "monthly" | "quarterly" | "summary";
const viewModes: SalesViewMode[] = ["monthly", "quarterly", "summary"];
type SortableColId = "name" | "price";

interface SalesGridContext {
  viewMode: SalesViewMode;
  setViewMode: (m: SalesViewMode) => void;
  sortBy: SortableColId;
  setSortBy: (c: SortableColId) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (o: "asc" | "desc") => void;
}

const SalesGridContext = createContext<SalesGridContext | undefined>(undefined);

const months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
const quarters = [...new Array(4)].map((_, i) => `Q${i + 1}`);

/*
 * Column group header with toggle button for switching the view mode.
 * In `monthly` mode the group has 12 columns from Jan to Dec.
 * In `quarterly` mode the group has 4 columns Q1 - Q4.
 * In `summary` mode the group has 1 column `Summary`.
 * */
const SalesGroupHeaderValue = (props: ColumnGroupCellValueProps) => {
  const { group } = props;
  const { viewMode, setViewMode } = useContext(SalesGridContext)!;

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setViewMode(event.currentTarget.value as SalesViewMode);
  };

  return (
    <FlexLayout direction="row" wrap={false} align={"center"}>
      <span>{group.data.name}</span>
      <ToggleButtonGroup
        onChange={onChange}
        value={viewModes.indexOf(viewMode)}
      >
        {viewModes.map((m) => {
          return (
            <ToggleButton aria-label={m} value={m} key={m}>
              {m[0]}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </FlexLayout>
  );
};

/*
 * Custom group header for the main group containing `name` and `price` columns.
 * Pin button allows pinning the group to the left.
 * */
const ItemGroupHeaderValue = (props: ColumnGroupCellValueProps) => {
  const { group } = props;

  return (
    <FlexLayout direction="row" wrap={false} align={"center"}>
      <FlexItem grow={1}>
        <span>{group.data.name}</span>
      </FlexItem>
      <FlexItem>
        <MenuButton
          appearance="transparent"
          CascadingMenuProps={{
            initialSource: {
              menuItems: [{ title: "Menu Item 1" }, { title: "Menu Item 2" }],
            },
          }}
        >
          <MenuIcon />
        </MenuButton>
      </FlexItem>
    </FlexLayout>
  );
};

/**
 * Custom header for sortable columns `name` and `price`.
 * Displays an icon to indicate sort direction.
 */
const SortableColumnHeaderValue = (props: GridHeaderValueProps<ExampleRow>) => {
  const { name, id, align } = props.column.info.props;
  const { sortBy, setSortBy, sortOrder, setSortOrder } =
    useContext(SalesGridContext)!;
  const onClick = () => {
    if (sortBy === id) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(id as SortableColId);
      setSortOrder("asc");
    }
  };

  const title = <FlexItem grow={1}>{name}</FlexItem>;

  return (
    <FlexLayout direction="row" align="center" onClick={onClick} gap={0}>
      {align !== "right" && title}
      {sortBy === id &&
        (sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />)}
      {align === "right" && title}
    </FlexLayout>
  );
};

const SummaryCellValue = (props: GridCellValueProps<ExampleRow>) => {
  const { monthlySales } = props.row.data;

  return (
    <div className="summaryCellValue">
      <div className="miniChart">
        {monthlySales.map((x, i) => (
          <div
            key={i}
            className="miniChartBar"
            style={{ height: `${(x.itemsSold / 5).toFixed(0)}%` }}
          />
        ))}
      </div>
    </div>
  );
};

/*
 * An example of how to use the `headerValueComponent` property of columns and
 * column groups.
 * */
const HeaderCustomizationTemplate: StoryFn = () => {
  const rowData: ExampleRow[] = useMemo(() => {
    const names = [
      "Espresso",
      "Latte",
      "Cappuccino",
      "Orange Juice",
      "Americano",
      "Muffin",
      "Sandwich",
      "Croissant",
    ];

    const result: ExampleRow[] = [];
    for (let i = 0; i < names.length - 1; ++i) {
      const price = randomNumber(2, 5);
      const monthlySales: SalesInfo[] = [...new Array(12)].map((_) => ({
        itemsSold: randomInt(100, 500),
      }));
      const totalCount = monthlySales
        .map((x) => x.itemsSold)
        .reduce((p, c) => p + c, 0);
      const total = totalCount * price;
      result.push({
        name: names[i],
        price,
        monthlySales,
        totalCount,
        total,
      });
    }
    return result;
  }, []);

  const [viewMode, setViewMode] = useState<SalesViewMode>("monthly");
  const [isItemPinned, setItemPinned] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortableColId>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedRowData = useMemo(() => {
    let r = [...rowData].sort((a, b) => (a[sortBy] < b[sortBy] ? -1 : 1));
    if (sortOrder === "desc") {
      r = r.reverse();
    }
    return r;
  }, [rowData, sortBy, sortOrder]);

  const contextValue: SalesGridContext = useMemo(
    () => ({
      viewMode,
      setViewMode,
      isItemPinned,
      setItemPinned,
      sortBy,
      setSortBy,
      sortOrder,
      setSortOrder,
    }),
    [
      viewMode,
      setViewMode,
      isItemPinned,
      setItemPinned,
      sortBy,
      setSortBy,
      sortOrder,
      setSortOrder,
    ],
  );

  const rowKeyGetter = useCallback((row: ExampleRow) => row.name, []);

  return (
    <SalesGridContext.Provider value={contextValue}>
      <Grid
        rowData={sortedRowData}
        rowKeyGetter={rowKeyGetter}
        className="grid"
        zebra={true}
        columnSeparators={true}
      >
        <ColumnGroup
          name="Item"
          id="main_group"
          headerValueComponent={ItemGroupHeaderValue}
        >
          <GridColumn
            name="Name"
            id="name"
            defaultWidth={100}
            getValue={(r) => r.name}
            headerValueComponent={SortableColumnHeaderValue}
          />
          <NumericColumn
            name="Price"
            id="price"
            precision={2}
            getValue={(r: ExampleRow) => r.price}
            headerValueComponent={SortableColumnHeaderValue}
          />
        </ColumnGroup>
        <ColumnGroup
          name="Items sold"
          id="sales_group"
          headerValueComponent={SalesGroupHeaderValue}
        >
          {viewMode === "monthly" &&
            months.map((mth, i) => {
              return (
                <NumericColumn
                  id={mth}
                  key={mth}
                  name={mth}
                  defaultWidth={50}
                  precision={0}
                  getValue={(r: ExampleRow) => r.monthlySales[i].itemsSold}
                />
              );
            })}
          {viewMode === "quarterly" &&
            quarters.map((q, i) => {
              return (
                <NumericColumn
                  id={q}
                  key={q}
                  name={q}
                  precision={0}
                  defaultWidth={50}
                  getValue={(r: ExampleRow) =>
                    r.monthlySales
                      .slice(i * 3, i * 3 + 3)
                      .map((r) => r.itemsSold)
                      .reduce((p, c) => p + c, 0)
                  }
                />
              );
            })}
          {viewMode === "summary" && (
            <GridColumn
              id="summary"
              key="summary"
              name="Summary"
              defaultWidth={250}
              minWidth={160}
              cellValueComponent={SummaryCellValue}
            />
          )}
        </ColumnGroup>
        <ColumnGroup id="total_group" name="Total">
          <NumericColumn
            name="Count"
            id="total_count"
            precision={0}
            defaultWidth={70}
            getValue={(r: ExampleRow) => r.totalCount}
          />
          <NumericColumn
            precision={2}
            id="total"
            name="£"
            defaultWidth={80}
            getValue={(r: ExampleRow) => r.total}
          />
        </ColumnGroup>
      </Grid>
    </SalesGridContext.Provider>
  );
};

export const HeaderCustomization = HeaderCustomizationTemplate.bind({});
