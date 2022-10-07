import { Story } from "@storybook/react";
import "./grid.stories.css";
import {
  ColumnGroup,
  DropdownCellEditor,
  Grid,
  GridCellValueProps,
  GridColumn,
  GridHeaderValueProps,
  NumericCellEditor,
  NumericColumn,
  RowKeyGetter,
  RowSelectionCheckboxColumn,
  RowSelectionRadioColumn,
  TextCellEditor,
} from "../src";
import { randomAmount, randomString, randomText } from "./utils";

import {
  createContext,
  CSSProperties,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FavoriteIcon,
} from "../../icons";
import { CellEditor } from "../src/CellEditor";
import { Pagination, Paginator } from "@jpmorganchase/uitk-lab";
import { FlexLayout } from "../../core";

export default {
  title: "Grid/New Grid",
  component: Grid,
  argTypes: {},
};

interface Investor {
  name: string;
  addedInvestors: string[];
  location: string;
  strategy: string[];
  cohort: string[];
  notes: string;
  amount: number;
}

const allLocations = [
  "New York, NY",
  "Jersey City, NJ",
  "Boston, MA",
  "San Francisco, CA",
];

function createDummyInvestors(): Investor[] {
  const a = [
    "Apple",
    "Orange",
    "Dragon fruit",
    "Coffee",
    "Fig",
    "Grape",
    "Hazelnut",
  ];
  const b = ["Investment", "Venture Capital", "Private Wealth"];
  const c = ["", "Inc."];
  const str = [
    ["FO"],
    ["PE"],
    ["VC"],
    ["FO", "PE"],
    ["FO", "PE", "VC"],
    ["VC", "PE"],
  ];
  const coh = [
    ["Potential Leads"],
    ["Top VCs"],
    ["Potential Leads", "Top VCs"],
  ];

  const investors: Investor[] = [];
  let i = 0;
  for (let x of a) {
    for (let y of b) {
      for (let z of c) {
        investors.push({
          name: [x, y, z].join(" "),
          addedInvestors: [],
          location: allLocations[i % allLocations.length],
          cohort: coh[i % coh.length],
          strategy: str[i % str.length],
          notes: "",
          amount: randomAmount(100, 300, 4),
        });
        ++i;
      }
    }
  }

  return investors;
}

const dummyInvestors = createDummyInvestors();

const rowKeyGetter = (rowData: Investor) => rowData.name;

const onAmountChange = (row: Investor, rowIndex: number, value: string) => {
  dummyInvestors[rowIndex].amount = parseFloat(value);
};

const onLocationChange = (row: Investor, rowIndex: number, value: string) => {
  dummyInvestors[rowIndex].location = value;
};

const GridStoryTemplate: Story<{}> = (props) => {
  return (
    <Grid
      rowData={dummyInvestors}
      rowKeyGetter={rowKeyGetter}
      className="table"
      zebra={true}
      columnSeparators={true}
      // hideHeader={true}
    >
      <ColumnGroup id="groupOne" name="Group One" pinned="left">
        <RowSelectionCheckboxColumn id="rowSelection" />
        <GridColumn
          name="Name"
          id="name"
          defaultWidth={200}
          getValue={(x) => x.name}
        />
      </ColumnGroup>
      <ColumnGroup id="groupTwo" name="Group Two">
        <GridColumn
          name="Location"
          id="location"
          defaultWidth={150}
          getValue={(x) => x.location}
          onChange={onLocationChange}
        >
          <CellEditor>
            <DropdownCellEditor options={allLocations} />
          </CellEditor>
        </GridColumn>
        <GridColumn
          name="Cohort"
          id="cohort"
          defaultWidth={200}
          getValue={(x) => x.cohort}
        />
      </ColumnGroup>
      <ColumnGroup id="groupThree" name="Group Three">
        <NumericColumn
          precision={2}
          id="amount"
          name="Amount"
          getValue={(x: Investor) => x.amount}
          onChange={onAmountChange}
        >
          <CellEditor>
            <NumericCellEditor />
          </CellEditor>
        </NumericColumn>
      </ColumnGroup>
      <ColumnGroup id="groupFour" name="Group Four">
        <GridColumn
          name="Strategy"
          id="strategy"
          getValue={(x) => x.strategy.join(", ")}
        />
      </ColumnGroup>
    </Grid>
  );
};

const SingleRowSelectionTemplate: Story<{}> = (props) => {
  return (
    <Grid
      rowData={dummyInvestors}
      rowKeyGetter={rowKeyGetter}
      className="table"
      zebra={true}
      // columnSeparators={true}
      rowSelectionMode="single"
      // hideHeader={true}
    >
      <ColumnGroup id="groupOne" name="Group One" pinned="left">
        <RowSelectionRadioColumn id="rowSelection" />
        <GridColumn
          name="Name"
          id="name"
          defaultWidth={200}
          getValue={(x) => x.name}
        />
      </ColumnGroup>
      <ColumnGroup id="groupTwo" name="Group Two">
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
      </ColumnGroup>
      <ColumnGroup id="groupThree" name="Group Three">
        <GridColumn
          name="Amount"
          id="amount"
          defaultWidth={200}
          getValue={(x) => x.amount.toFixed(4)}
          align="right"
          onChange={onAmountChange}
        />
      </ColumnGroup>
      <ColumnGroup id="groupFour" name="Group Four">
        <GridColumn
          name="Strategy"
          id="strategy"
          getValue={(x) => x.strategy.join(", ")}
        />
      </ColumnGroup>
    </Grid>
  );
};

const dummyInvestors5 = dummyInvestors.slice(0, 5);

const SmallTemplate: Story<{}> = (props) => {
  return (
    <Grid
      rowData={dummyInvestors5}
      rowKeyGetter={rowKeyGetter}
      className="smallGrid"
      zebra={true}
      columnSeparators={true}
      // rowSelectionMode="single"
      // hideHeader={true}
    >
      <RowSelectionRadioColumn id="rowSelection" />
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
    </Grid>
  );
};

const PinnedColumnsTemplate: Story<{}> = (props) => {
  return (
    <Grid
      rowData={dummyInvestors}
      rowKeyGetter={rowKeyGetter}
      className="table"
    >
      <ColumnGroup id="groupOne" name="Group One" pinned="left">
        <GridColumn
          name="Name"
          id="name"
          defaultWidth={200}
          getValue={(x) => x.name}
        />
      </ColumnGroup>
      <ColumnGroup id="groupTwo" name="Group Two">
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
      </ColumnGroup>
      <ColumnGroup id="groupThree" name="Group Three">
        <GridColumn
          name="Amount"
          id="amount"
          defaultWidth={200}
          getValue={(x) => x.amount.toFixed(4)}
          align="right"
          onChange={onAmountChange}
        />
      </ColumnGroup>
      <ColumnGroup id="groupFour" name="Group Four" pinned="right">
        <GridColumn
          name="Strategy"
          id="strategy"
          getValue={(x) => x.strategy.join(", ")}
        />
      </ColumnGroup>
    </Grid>
  );
};

const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getColName = (n: number) => {
  const s: string[] = [];
  s.push(abc[n % abc.length]);

  while (n > abc.length - 1) {
    n = Math.floor(n / abc.length) - 1;
    s.push(abc[n % abc.length]);
  }

  s.reverse();
  return s.join("");
};

const dummyColumnNames = [...new Array(1000).keys()].map((i) => getColName(i));

const dummyData = [...new Array(30).keys()].map((i) => {
  const row: any = {
    id: `row${i}`,
  };
  dummyColumnNames.forEach((c) => {
    row[c] = randomString(5);
  });
  return row;
});

const rowIdGetter = (row: any) => row.id;

const LotsOfColumnsTemplate: Story<{}> = (props) => {
  return (
    <Grid
      rowData={dummyData}
      rowKeyGetter={rowIdGetter}
      className="table"
      columnSeparators={true}
    >
      {dummyColumnNames.map((name) => (
        <GridColumn
          key={name}
          name={name}
          id={name}
          defaultWidth={60}
          getValue={(x) => x[name]}
        />
      ))}
    </Grid>
  );
};

const dummyGroups: any[] = [
  {
    name: `Group ${getColName(0)}`,
    columns: [],
  },
];
dummyColumnNames.forEach((name) => {
  let groupIdx = dummyGroups.length - 1;
  let group = dummyGroups[groupIdx];
  if (group.columns.length > 4) {
    groupIdx += 1;
    group = {
      name: `Group ${getColName(groupIdx)}`,
      columns: [],
    };
    dummyGroups.push(group);
  }
  group.columns.push(name);
});

const LotsOfColumnGroupsTemplate: Story<{}> = (props) => {
  return (
    <Grid
      rowData={dummyData}
      rowKeyGetter={rowIdGetter}
      className="table"
      columnSeparators={true}
      rowSelectionMode={"none"}
    >
      {dummyGroups.map((group) => (
        <ColumnGroup key={group.name} name={group.name} id={group.name}>
          {group.columns.map((name: string) => (
            <GridColumn
              key={name}
              name={name}
              id={name}
              defaultWidth={60}
              getValue={(x) => x[name]}
            />
          ))}
        </ColumnGroup>
      ))}
    </Grid>
  );
};

/* Custom headers story. Sortable columns */

interface CustomHeadersStoryContext {
  sortBy: string;
  sort: (sortBy: string) => void;
  sortDesc: boolean;
}

const CustomHeadersStoryContext = createContext<
  CustomHeadersStoryContext | undefined
>(undefined);

const useCustomHeadersStoryContext = () => {
  const c = useContext(CustomHeadersStoryContext);
  if (!c) {
    throw new Error(`CustomHeadersStoryContext not found`);
  }
  return c;
};

const CustomHeader: FC<GridHeaderValueProps<any>> = (props) => {
  const { column } = props;
  const { sortBy, sortDesc, sort } = useCustomHeadersStoryContext();

  const onClick = () => {
    sort(props.column.info.props.id);
  };

  return (
    <div onClick={onClick} className="customHeader">
      <FavoriteIcon />
      <div className="customHeaderText">{column.info.props.name}</div>
      {sortBy === column.info.props.id ? (
        sortDesc ? (
          <ArrowDownIcon />
        ) : (
          <ArrowUpIcon />
        )
      ) : null}
    </div>
  );
};

const customHeadersColumnNames = dummyColumnNames.slice(0, 10);

const CustomHeadersTemplate: Story<{}> = (props) => {
  const [sortBy, setSortBy] = useState<string>("A");
  const [sortDesc, setSortDesc] = useState<boolean>(false);

  const sortedRows = useMemo(() => {
    const a = [...dummyData];
    a.sort((x, y) => {
      return x[sortBy].localeCompare(y[sortBy]);
    });
    if (sortDesc) {
      a.reverse();
    }
    return a;
  }, [sortBy, sortDesc]);

  const sort = useCallback(
    (c: string) => {
      if (c === sortBy) {
        setSortDesc((x) => !x);
      } else {
        setSortBy(c);
        setSortDesc(false);
      }
    },
    [sortBy, setSortBy, sortDesc, setSortDesc]
  );

  const contextValue: CustomHeadersStoryContext = useMemo(() => {
    return {
      sortBy,
      sortDesc,
      sort,
    };
  }, [sortBy, sortDesc, sort]);

  return (
    <CustomHeadersStoryContext.Provider value={contextValue}>
      <Grid
        rowData={sortedRows}
        rowKeyGetter={rowIdGetter}
        className="table"
        columnSeparators={true}
        zebra={true}
      >
        <RowSelectionCheckboxColumn id="rowSelector" />
        {customHeadersColumnNames.map((name) => (
          <GridColumn
            key={name}
            name={name}
            id={name}
            defaultWidth={100}
            getValue={(x) => x[name]}
            headerValueComponent={CustomHeader}
          />
        ))}
      </Grid>
    </CustomHeadersStoryContext.Provider>
  );
};

/* Custom cells story */

interface TreeRowData {
  id: string;
  level: number;
  children: TreeRowData[];
  name: string;
  expanded: boolean;
  a: string;
  b: string;
  c: string;
}

interface CustomCellsStoryContext {
  expand: (rowKey: string, expand: boolean) => void;
}

const CustomCellsStoryContext = createContext<
  CustomCellsStoryContext | undefined
>(undefined);

const useCustomCellsStoryContext = () => {
  const c = useContext(CustomCellsStoryContext);
  if (!c) {
    throw new Error(`CustomCellsStoryContext not found`);
  }
  return c;
};

const getId = (() => {
  let id = 0;
  return () => {
    id++;
    return id.toString();
  };
})();

const randomTreeData = (): TreeRowData => {
  return {
    id: getId(),
    name: randomText(1, 10, 20),
    children: [],
    expanded: false,
    level: 0,
    a: randomText(1, 10, 20),
    b: randomText(1, 10, 20),
    c: randomText(1, 10, 20),
  };
};

const CustomCell: FC<GridCellValueProps<TreeRowData>> = (props) => {
  const { row } = props;
  const { expand } = useCustomCellsStoryContext();

  const style: CSSProperties = {
    width: `${row.data.level * 16}px`,
  };

  const onClick = () => {
    expand(row.data.id, !row.data.expanded);
  };

  return (
    <div className="customTreeCell" onClick={onClick}>
      <div style={style} />
      {row.data.children.length > 0 ? (
        row.data.expanded ? (
          <ChevronDownIcon />
        ) : (
          <ChevronRightIcon />
        )
      ) : (
        <FavoriteIcon />
      )}
      <span className="treeNodeName">{row.data.name}</span>
    </div>
  );
};

const dummyTreeData: TreeRowData[] = [];
for (let i = 0; i < 10; i++) {
  let a = randomTreeData();
  dummyTreeData.push(a);
  for (let j = 0; j < 10; j++) {
    let b = randomTreeData();
    b.level = 1;
    a.children.push(b);
    for (let k = 0; k < 10; k++) {
      let c = randomTreeData();
      c.level = 2;
      b.children.push(c);
    }
  }
}

const CustomCellsTemplate: Story<{}> = (props) => {
  const [data, setData] = useState(dummyTreeData);

  const dataById = useMemo(() => {
    const m = new Map<string, TreeRowData>();
    const indexRows = (rows: TreeRowData[]) => {
      for (let r of rows) {
        m.set(r.id, r);
        indexRows(r.children);
      }
    };
    indexRows(data);
    return m;
  }, [data]);

  const expand = useCallback(
    (rowKey: string, expand: boolean) => {
      dataById.get(rowKey)!.expanded = expand;
      setData([...data]);
    },
    [dataById, setData]
  );

  const visibleRows = useMemo(() => {
    const rows: TreeRowData[] = [];
    const addRows = (source: TreeRowData[]) => {
      for (let r of source) {
        rows.push(r);
        if (r.expanded) {
          addRows(r.children);
        }
      }
    };
    addRows(data);
    return rows;
  }, [data]);

  const contextValue: CustomCellsStoryContext = useMemo(
    () => ({
      expand,
    }),
    [expand]
  );

  return (
    <CustomCellsStoryContext.Provider value={contextValue}>
      <Grid
        rowData={visibleRows}
        rowKeyGetter={rowIdGetter}
        className="table"
        columnSeparators={true}
        zebra={true}
      >
        <GridColumn
          name="Tree"
          id="tree"
          defaultWidth={200}
          getValue={(x) => x.name}
          cellValueComponent={CustomCell}
          pinned="left"
        />
        <GridColumn id="a" name="A" defaultWidth={100} getValue={(x) => x.a} />
        <GridColumn id="b" name="B" defaultWidth={200} getValue={(x) => x.b} />
        <GridColumn id="c" name="C" defaultWidth={250} getValue={(x) => x.c} />
      </Grid>
    </CustomCellsStoryContext.Provider>
  );
};

/* Column DnD */
const ColumnDragAndDropTemplate: Story<{}> = (props) => {
  const [columnIds, setColumnIds] = useState<string[]>([
    "name",
    "location",
    "cohort",
  ]);

  const onColumnMoved = (
    columnId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    setColumnIds((old) => {
      const col = old[fromIndex];
      if (fromIndex < toIndex) {
        return [
          ...old.slice(0, fromIndex),
          ...old.slice(fromIndex + 1, toIndex),
          col,
          ...old.slice(toIndex),
        ];
      } else {
        return [
          ...old.slice(0, toIndex),
          col,
          ...old.slice(toIndex, fromIndex),
          ...old.slice(fromIndex + 1),
        ];
      }
    });
  };

  const renderColumn = (id: string) => {
    switch (id) {
      case "name":
        return (
          <GridColumn
            key="name"
            name="Name"
            id="name"
            defaultWidth={200}
            getValue={(x) => x.name}
          />
        );
      case "location":
        return (
          <GridColumn
            key="location"
            name="Location"
            id="location"
            defaultWidth={150}
            getValue={(x) => x.location}
          />
        );
      case "cohort":
        return (
          <GridColumn
            key="cohort"
            name="Cohort"
            id="cohort"
            defaultWidth={200}
            getValue={(x) => x.cohort}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Grid
      rowData={dummyInvestors}
      rowKeyGetter={rowKeyGetter}
      className="smallGrid"
      zebra={true}
      columnSeparators={true}
      columnMove={true}
      onColumnMoved={onColumnMoved}
    >
      {columnIds.map((id) => renderColumn(id))}
    </Grid>
  );
};

const serverSideDataRowKeyGetter: RowKeyGetter<Investor> = (row, index) =>
  `Row${index}`;

const serverSideRowCount = 200000;

const ServerSideDataStoryTemplate: Story<{}> = (props) => {
  const [rows, setRows] = useState<Investor[]>(() => {
    const rowData: Investor[] = [];
    rowData.length = serverSideRowCount;
    return rowData;
  });

  const onVisibleRowRangeChange = useCallback((start: number, end: number) => {
    console.log(`onVisibleRowRangeChange(${start}, ${end}).`);
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
      className="table"
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
        onChange={onLocationChange}
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
        onChange={onAmountChange}
      />
      <GridColumn
        name="Strategy"
        id="strategy"
        getValue={(x) => x.strategy.join(", ")}
      />
    </Grid>
  );
};

const PaginationStoryTemplate: Story<{}> = (props) => {
  const [page, setPage] = useState<number>(1);
  const pageSize = 7;
  const pageCount = Math.ceil(dummyInvestors.length / pageSize);

  const onPageChange = (page: number) => {
    setPage(page);
  };

  const rowData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, dummyInvestors.length);
    return dummyInvestors.slice(start, end);
  }, [pageSize, page]);

  return (
    <FlexLayout direction={"column"} align={"end"}>
      <Grid
        rowData={rowData}
        rowKeyGetter={serverSideDataRowKeyGetter}
        className="paginatedGrid"
        zebra={true}
        columnSeparators={true}
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
          onChange={onLocationChange}
        />
        <GridColumn
          name="Amount"
          id="amount"
          defaultWidth={200}
          getValue={(x) => x.amount.toFixed(4)}
          align="right"
          onChange={onAmountChange}
        />
      </Grid>
      <Pagination page={page} onPageChange={onPageChange} count={pageCount}>
        <Paginator />
      </Pagination>
    </FlexLayout>
  );
};

export const GridExample = GridStoryTemplate.bind({});
export const SingleRowSelect = SingleRowSelectionTemplate.bind({});
export const SmallGrid = SmallTemplate.bind({});
export const PinnedColumns = PinnedColumnsTemplate.bind({});
export const LotsOfColumns = LotsOfColumnsTemplate.bind({});
export const LotsOfColumnGroups = LotsOfColumnGroupsTemplate.bind({});
export const CustomHeaders = CustomHeadersTemplate.bind({});
export const CustomCells = CustomCellsTemplate.bind({});
export const ColumnDragAndDrop = ColumnDragAndDropTemplate.bind({});
export const ServerSideData = ServerSideDataStoryTemplate.bind({});
export const GridPagination = PaginationStoryTemplate.bind({});

GridExample.args = {};
