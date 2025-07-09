import { Card, Checkbox, FlexLayout } from "@salt-ds/core";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FavoriteIcon,
} from "@salt-ds/icons";
import type { StoryFn } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type CSSProperties,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  CellEditor,
  ColumnGroup,
  DropdownCellEditor,
  Grid,
  type GridCellValueProps,
  GridColumn,
  type GridHeaderValueProps,
  type GridProps,
  NumericCellEditor,
  NumericColumn,
  RowSelectionCheckboxColumn,
  RowSelectionRadioColumn,
} from "../src";
import {
  allLocations,
  createDummyInvestors,
  type Investor,
  investorKeyGetter,
} from "./dummyData";
import { randomString, randomText } from "./utils";
import "./grid.stories.css";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

const dummyInvestors = createDummyInvestors();

const onAmountChange = (row: Investor, rowIndex: number, value: string) => {
  dummyInvestors[rowIndex].amount = Number.parseFloat(value);
};

const onLocationChange = (row: Investor, rowIndex: number, value: string) => {
  dummyInvestors[rowIndex].location = value;
};

const GridStoryTemplate: StoryFn<GridProps> = () => {
  return (
    <Grid
      rowData={dummyInvestors}
      rowKeyGetter={investorKeyGetter}
      className="grid"
      zebra={true}
      columnSeparators={true}
      headerIsFocusable={true}
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

const SingleRowSelectionTemplate: StoryFn<GridProps> = () => {
  return (
    <Grid
      rowData={dummyInvestors}
      rowKeyGetter={investorKeyGetter}
      className="grid"
      zebra={true}
      rowSelectionMode="single"
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
          getValue={(x) => x.amount}
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

export const SimpleGrid = () => {
  return (
    <Grid rowData={dummyInvestors.slice(0, 5)} style={{ height: 223 }}>
      <GridColumn
        name="Name"
        id="name"
        defaultWidth={200}
        getValue={(rowData: Investor) => rowData.name}
      />
      <GridColumn
        name="Location"
        id="location"
        defaultWidth={150}
        getValue={(rowData: Investor) => rowData.location}
      />
      <GridColumn
        name="Cohort"
        id="cohort"
        defaultWidth={200}
        getValue={(rowData: Investor) => rowData.cohort}
      />
    </Grid>
  );
};

const SmallTemplate: StoryFn<GridProps> = () => {
  return (
    <Grid
      rowKeyGetter={investorKeyGetter}
      style={{ height: 223 }}
      rowData={dummyInvestors.slice(0, 5)}
      rowSelectionMode="single"
      zebra
      columnSeparators
      variant="primary"
    >
      <RowSelectionRadioColumn id="rowSelection" />
      <GridColumn
        name="Name"
        id="name"
        defaultWidth={200}
        getValue={(rowData: Investor) => rowData.name}
      />
      <GridColumn
        name="Location"
        id="location"
        defaultWidth={150}
        getValue={(rowData: Investor) => rowData.location}
      />
      <GridColumn
        name="Cohort"
        id="cohort"
        defaultWidth={200}
        getValue={(rowData: Investor) => rowData.cohort}
      />
    </Grid>
  );
};

const PinnedColumnsTemplate: StoryFn<GridProps> = () => {
  const [columnSeparators, setColumnSeparators] = useState<boolean>(false);
  const [pinnedSeparators, setPinnedSeparators] = useState<boolean>(true);

  const onChangeColumnSeparators = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    console.log(`Column separators ${checked ? "enabled" : "disabled"}`);
    setColumnSeparators(checked);
  };

  const onChangePinnedSeparators = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    console.log(`Pinned separators ${checked ? "enabled" : "disabled"}`);
    setPinnedSeparators(checked);
  };

  return (
    <FlexLayout direction="column" separators={true}>
      <Card>
        <FlexLayout direction="row">
          <Checkbox
            label="Column separators"
            checked={columnSeparators}
            onChange={onChangeColumnSeparators}
          />
          <Checkbox
            label="Pinned separators"
            checked={pinnedSeparators}
            onChange={onChangePinnedSeparators}
          />
        </FlexLayout>
      </Card>
      <Grid
        rowData={dummyInvestors}
        rowKeyGetter={investorKeyGetter}
        className="grid"
        columnSeparators={columnSeparators}
        pinnedSeparators={pinnedSeparators}
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
            defaultWidth={250}
            getValue={(x) => x.location}
          />
          <GridColumn
            name="Cohort"
            id="cohort"
            defaultWidth={300}
            getValue={(x) => x.cohort}
          />
        </ColumnGroup>
        <ColumnGroup id="groupThree" name="Group Three">
          <GridColumn
            name="Amount"
            id="amount"
            defaultWidth={250}
            getValue={(x) => x.amount}
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
    </FlexLayout>
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

const dummyData = [...new Array(40).keys()].map((i) => {
  const row: any = {
    id: `row${i}`,
  };
  dummyColumnNames.forEach((c) => {
    row[c] = randomString(5);
  });
  return row;
});

const rowIdGetter = (row: any) => row.id;

const LotsOfColumnsTemplate: StoryFn<GridProps> = (props) => {
  const { style } = props;
  return (
    <Grid
      style={style}
      rowData={dummyData}
      rowKeyGetter={rowIdGetter}
      className="grid"
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

const LotsOfColumnGroupsTemplate: StoryFn<GridProps> = () => {
  return (
    <Grid
      rowData={dummyData}
      rowKeyGetter={rowIdGetter}
      className="grid"
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
    throw new Error("CustomHeadersStoryContext not found");
  }
  return c;
};

const CustomHeader = (props: GridHeaderValueProps<any>) => {
  const { column } = props;
  const { sortBy, sortDesc, sort } = useCustomHeadersStoryContext();

  const onClick = () => {
    sort(props.column.info.props.id);
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: not used
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

const CustomHeadersTemplate: StoryFn<GridProps> = () => {
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
    [sortBy],
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
        className="grid"
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
    throw new Error("CustomCellsStoryContext not found");
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

const CustomCell = (props: GridCellValueProps<TreeRowData>) => {
  const { row } = props;
  const { expand } = useCustomCellsStoryContext();

  const style: CSSProperties = {
    width: `${row.data.level * 16}px`,
  };

  const onClick = () => {
    expand(row.data.id, !row.data.expanded);
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: not used
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
  const a = randomTreeData();
  dummyTreeData.push(a);
  for (let j = 0; j < 10; j++) {
    const b = randomTreeData();
    b.level = 1;
    a.children.push(b);
    for (let k = 0; k < 10; k++) {
      const c = randomTreeData();
      c.level = 2;
      b.children.push(c);
    }
  }
}

const CustomCellsTemplate: StoryFn<GridProps> = () => {
  const [data, setData] = useState(dummyTreeData);

  const dataById = useMemo(() => {
    const m = new Map<string, TreeRowData>();
    const indexRows = (rows: TreeRowData[]) => {
      for (const r of rows) {
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
    [dataById, data],
  );

  const visibleRows = useMemo(() => {
    const rows: TreeRowData[] = [];
    const addRows = (source: TreeRowData[]) => {
      for (const r of source) {
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
    [expand],
  );

  return (
    <CustomCellsStoryContext.Provider value={contextValue}>
      <Grid
        rowData={visibleRows}
        rowKeyGetter={rowIdGetter}
        className="grid"
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

const ColumnDragAndDropTemplate: StoryFn<GridProps> = () => {
  const [columnIds, setColumnIds] = useState<string[]>([
    "name",
    "location",
    "cohort",
  ]);

  const onColumnMoved = (
    columnId: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    console.log(`Column "${columnId}" moved from ${fromIndex} to ${toIndex}`);
    setColumnIds((old) => {
      const col = old[fromIndex];
      if (fromIndex < toIndex) {
        return [
          ...old.slice(0, fromIndex),
          ...old.slice(fromIndex + 1, toIndex),
          col,
          ...old.slice(toIndex),
        ];
      }
      return [
        ...old.slice(0, toIndex),
        col,
        ...old.slice(toIndex, fromIndex),
        ...old.slice(fromIndex + 1),
      ];
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
      rowKeyGetter={investorKeyGetter}
      style={{ height: 600 }}
      zebra={true}
      columnSeparators={true}
      columnMove={true}
      onColumnMoved={onColumnMoved}
    >
      {columnIds.map((id) => renderColumn(id))}
    </Grid>
  );
};

export const SmallGrid = SmallTemplate.bind({});
export const GridExample = GridStoryTemplate.bind({});
export const SingleRowSelect = SingleRowSelectionTemplate.bind({});
export const LotsOfColumns = LotsOfColumnsTemplate.bind({});
export const LotsOfColumnGroups = LotsOfColumnGroupsTemplate.bind({});
// export const PinnedColumns = PinnedColumnsTemplate.bind({});
// export const CustomHeaders = CustomHeadersTemplate.bind({});
// export const CustomCells = CustomCellsTemplate.bind({});
// export const ColumnDragAndDrop = ColumnDragAndDropTemplate.bind({});

GridExample.args = {};
