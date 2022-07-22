import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  Subject,
  switchMap,
} from "rxjs";
import {
  ColumnDefinition,
  ColumnPinType,
  createHandler,
  createHook,
  GridBackgroundVariant,
  GridModel,
  RowKeyGetter,
} from "../grid";
import React from "react";
import {
  DataGridCellValue,
  DataGridCellValueProps,
  DataGridColumnHeader,
  DataGridColumnHeaderProps,
} from "./column-types";
import { GroupCellValue } from "./row-grouping";
import {
  DataGridRowGroupLevelSettings,
  DataGridRowGroupSettings,
} from "./DataGrid";
import { SortDirection, SortInfo } from "./sort";

export type ValueGetterFn<TRowData, TCellValue> = (
  rowNode: RowNode<TRowData>
) => TCellValue;
export type RowKeyGetterFn<TRowData> = (rowData: TRowData) => string;

export type ColFilterFn<TRowData> = (rowData: TRowData) => boolean;

export interface ColDef<TRowData = any, TColumnData = any> {
  key: string;
  field: string;
  type: string; // TODO remove
  width?: number;
  title?: string;
  data?: TColumnData;
  headerComponent?: React.ComponentType<
    DataGridColumnHeaderProps<TRowData, TColumnData>
  >;
  headerClassName?: string;
  pinned?: ColumnPinType;
  cellComponent?: React.ComponentType<
    DataGridCellValueProps<TRowData, TColumnData>
  >;
}

export type RowNodeType = "group" | "leaf";

export class GroupRowNode<TRowData = any> {
  public readonly rowNodeType = "group";
  public readonly key: string;
  public readonly name: string;
  public readonly isExpanded$: BehaviorSubject<boolean>;
  public readonly level: number;
  public readonly children: Array<RowNode<TRowData> | GroupRowNode<TRowData>>;
  public readonly useIsExpanded: () => boolean;
  public readonly setExpanded: (expanded: boolean) => void;
  public treeLines: string[] = [];

  public get isExpandable() {
    return this.children != undefined;
  }

  public constructor(
    key: string,
    name: string,
    level: number,
    children: Array<RowNode<TRowData> | GroupRowNode<TRowData>>
  ) {
    this.key = key;
    this.name = name;
    this.isExpanded$ = new BehaviorSubject<boolean>(true);
    this.level = level;
    this.children = children;
    this.useIsExpanded = createHook(this.isExpanded$);
    this.setExpanded = createHandler(this.isExpanded$);
  }
}

export class LeafRowNode<TRowData = any> {
  public readonly rowNodeType = "leaf";
  public readonly key: string;
  // TODO extract these into a "tree cell" class?
  public name: string = "";
  public level: number = 0;

  public readonly data$: BehaviorSubject<TRowData>;
  public readonly useData: () => TRowData;
  public treeLines: string[] = [];

  public constructor(key: string, data: TRowData) {
    this.key = key;
    this.data$ = new BehaviorSubject<TRowData>(data);
    this.useData = createHook(this.data$);
  }
}

export type RowNode<TRowData = any> =
  | GroupRowNode<TRowData>
  | LeafRowNode<TRowData>;

export function isGroupNode<TRowData = any>(
  rowNode: RowNode<TRowData>
): rowNode is GroupRowNode<TRowData> {
  return rowNode.rowNodeType === "group";
}

export function isLeafNode<TRowData = any>(
  rowNode: RowNode<TRowData>
): rowNode is LeafRowNode<TRowData> {
  return rowNode.rowNodeType === "leaf";
}

export interface ExpandCollapseEvent<TRowData = any> {
  rowNode: GroupRowNode<TRowData>;
  expand?: boolean;
}

export class DataGridColumn<TRowData = any, TColumnData = any> {
  public readonly definition: ColDef<TRowData, TColumnData>;
  // public readonly menu: ColumnMenuModel;
  public readonly sortDirection$: BehaviorSubject<SortDirection | undefined>;
  public readonly sortPriority$: BehaviorSubject<number | undefined>;
  public readonly data$: BehaviorSubject<TColumnData | undefined>;

  public readonly useSortDirection: () => SortDirection | undefined;
  public readonly useSortPriority: () => number | undefined;

  public readonly setSortDirection: (
    sortDirection: SortDirection | undefined
  ) => void;
  public readonly setSortPriority: (sortPriority: number | undefined) => void;
  public readonly useData: () => TColumnData | undefined;
  public readonly setData: (data: TColumnData | undefined) => void;

  public constructor(definition: ColDef<TRowData, TColumnData>) {
    this.definition = definition;
    this.sortDirection$ = new BehaviorSubject<SortDirection | undefined>(
      undefined
    );
    this.sortPriority$ = new BehaviorSubject<number | undefined>(undefined);
    this.useSortDirection = createHook(this.sortDirection$);
    this.useSortPriority = createHook(this.sortPriority$);
    this.setSortDirection = createHandler(this.sortDirection$);
    this.setSortPriority = createHandler(this.sortPriority$);
    this.data$ = new BehaviorSubject<TColumnData | undefined>(definition.data);
    this.useData = createHook(this.data$);
    this.setData = createHandler(this.data$);
  }
}

export interface DataGridModelEvents<TRowData> {
  columnVisible?: () => void;
  columnPinned?: () => void;
  columnResized?: (column: DataGridColumn) => void;
  columnMoved?: (column: DataGridColumn) => void;
  columnsChanged?: (columns: DataGridColumn[]) => void;
  visibleColumnsChanged?: (columns: DataGridColumn[]) => void;
  cellKeyDown?: () => void;
  cellKeyPress?: () => void;
  scroll?: () => void;
  rowDataChanged?: (rowNode: RowNode<TRowData>) => void;
  cellClicked?: () => void;
  cellDoubleClicked?: () => void;
  cellFocused?: () => void;
  cellMouseOver?: () => void;
  cellMouseDown?: () => void;
  rowClicked?: (rowNode: RowNode<TRowData>) => void;
  rowDoubleClicked?: (rowNode: RowNode<TRowData>) => void;
  rowSelected?: (rowNode: RowNode<TRowData>) => void;
  selectionChanged?: () => void;
  rangeSelectionChanged?: () => void;
}

export interface DataGridModelOptions<TRowData> {
  rowKeyGetter: RowKeyGetterFn<TRowData>;
  data?: TRowData[];
  columnDefinitions?: ColDef<TRowData>[];
  events?: DataGridModelEvents<TRowData>;
}

export type FilterFn<TRowData> = (rowData: TRowData) => boolean;
export type SortFn<TRowData> = (a: TRowData, b: TRowData) => number;

export function groupRows<TRowData>(
  rows: LeafRowNode<TRowData>[],
  rowGrouping: DataGridRowGroupSettings<TRowData>,
  leafNodeGroupNameField?: keyof TRowData
) {
  let i = 0;
  const groupNodesBy = (
    nodes: LeafRowNode<TRowData>[],
    levels: DataGridRowGroupLevelSettings<TRowData>[],
    level: number
  ): RowNode<TRowData>[] => {
    if (levels.length === 0) {
      if (leafNodeGroupNameField) {
        nodes.forEach((leafNode) => {
          leafNode.name = String(
            leafNode.data$.getValue()[leafNodeGroupNameField]
          );
        });
      }
      return nodes;
    }
    const m = new Map<string, LeafRowNode<TRowData>[]>();
    nodes.forEach((r) => {
      const k = String(r.data$.getValue()[levels[0].field]);
      if (m.has(k)) {
        m.get(k)!.push(r);
      } else {
        m.set(k, [r]);
      }
    });
    return [...m.entries()].map(([k, v]) => {
      return new GroupRowNode<TRowData>(
        String(i++),
        k,
        level,
        groupNodesBy(v, levels.slice(1), level + 1)
      );
    });
  };

  const levels = rowGrouping.groupLevels;
  return groupNodesBy(rows, levels, 0);
}

export function flattenVisibleRows<TRowData>(
  topLevelRows: RowNode<TRowData>[]
) {
  const visibleRows: RowNode<TRowData>[] = [];

  const addToVisible = (
    nodes: RowNode<TRowData>[],
    lines: string[],
    level: number
  ) => {
    nodes.forEach((n, i) => {
      const isLastChild = nodes.length - i === 1;
      n.treeLines = [...lines, isLastChild ? "L" : "T"];
      visibleRows.push(n);
      if (isGroupNode(n)) {
        if (n.isExpanded$.getValue()) {
          addToVisible(
            n.children,
            [...lines, isLastChild ? " " : "I"],
            level + 1
          );
        }
      } else {
        n.level = level;
      }
    });
  };
  addToVisible(topLevelRows, [], 0);
  return visibleRows;
}

export class DataGridModel<TRowData = any> {
  private readonly rowKeyGetter: RowKeyGetterFn<TRowData>;
  private readonly data$: BehaviorSubject<TRowData[]>;

  private readonly columnDefinitions$: BehaviorSubject<ColDef<TRowData>[]>;
  private readonly leafRows$: BehaviorSubject<LeafRowNode<TRowData>[]>;
  private readonly filteredLeafRows$: BehaviorSubject<LeafRowNode<TRowData>[]>; // Filtered but not sorted
  private readonly sortedLeafRows$: BehaviorSubject<LeafRowNode<TRowData>[]>; // Filtered and sorted

  private readonly columns$: BehaviorSubject<DataGridColumn[]>;
  private readonly topLevelRows$: BehaviorSubject<RowNode<TRowData>[]>;
  private readonly visibleRows$: BehaviorSubject<RowNode<TRowData>[]>;

  private readonly rowsByKey$: BehaviorSubject<Map<string, RowNode<TRowData>>>;
  private readonly expandEvents$: Subject<ExpandCollapseEvent>;

  private readonly filterFn$: BehaviorSubject<FilterFn<TRowData> | undefined>;
  private readonly sortFn$: BehaviorSubject<SortFn<TRowData> | undefined>;
  private readonly sortSettings$: BehaviorSubject<SortInfo[] | undefined>;
  private readonly leafNodeSortFn$: BehaviorSubject<
    SortFn<LeafRowNode<TRowData>> | undefined
  >;
  private readonly rowGrouping$: BehaviorSubject<
    DataGridRowGroupSettings<TRowData> | undefined
  >;
  private readonly showTreeLines$: BehaviorSubject<boolean>;
  private readonly leafNodeGroupNameField$: BehaviorSubject<
    undefined | keyof TRowData
  >;
  private readonly backgroundVariant$: BehaviorSubject<
    GridBackgroundVariant | undefined
  >;
  private readonly rowDividerField$: BehaviorSubject<
    keyof TRowData | undefined
  >;

  public readonly gridModel: GridModel<RowNode<TRowData>>;
  public readonly setRowData: (data: TRowData[]) => void;
  public readonly setColumnDefs: (columnDefs: ColDef<TRowData>[]) => void;

  public readonly setRowGrouping: (
    rowGrouping: DataGridRowGroupSettings<TRowData> | undefined
  ) => void;
  public readonly useRowGrouping: () =>
    | DataGridRowGroupSettings<TRowData>
    | undefined;
  public readonly setShowTreeLines: (showTreeLines: boolean) => void;
  public readonly useShowTreeLines: () => boolean;
  public readonly setLeafNodeGroupNameField: (
    field: undefined | keyof TRowData
  ) => void;
  public readonly setFilterFn: (
    filterFn: FilterFn<TRowData> | undefined
  ) => void;
  public readonly setSortFn: (sortFn: SortFn<TRowData> | undefined) => void;
  public readonly setSortSettings: (
    sortSettings: SortInfo[] | undefined
  ) => void;

  public readonly setBackgroundVariant: (
    backgroundVariant?: GridBackgroundVariant
  ) => void;

  public readonly setIsFramed: (isFramed: boolean | undefined) => void;
  public readonly setRowDividerField: (
    field: keyof TRowData | undefined
  ) => void;

  public readonly expandCollapseNode: (event: ExpandCollapseEvent) => void;

  public constructor(options: DataGridModelOptions<TRowData>) {
    this.rowKeyGetter = options.rowKeyGetter;
    this.data$ = new BehaviorSubject<TRowData[]>(options.data || []);
    this.setRowData = createHandler(this.data$);
    this.columnDefinitions$ = new BehaviorSubject<ColDef<TRowData>[]>(
      options.columnDefinitions || []
    );
    this.setColumnDefs = createHandler(this.columnDefinitions$);
    this.rowGrouping$ = new BehaviorSubject<
      DataGridRowGroupSettings<TRowData> | undefined
    >(undefined);
    this.setRowGrouping = createHandler(this.rowGrouping$);
    this.useRowGrouping = createHook(this.rowGrouping$);

    this.leafRows$ = new BehaviorSubject<LeafRowNode<TRowData>[]>([]); // TODO init
    this.filteredLeafRows$ = new BehaviorSubject<LeafRowNode<TRowData>[]>([]);
    this.sortedLeafRows$ = new BehaviorSubject<LeafRowNode<TRowData>[]>([]);
    this.columns$ = new BehaviorSubject<DataGridColumn[]>([]); // TODO
    this.showTreeLines$ = new BehaviorSubject<boolean>(false);
    this.useShowTreeLines = createHook(this.showTreeLines$);
    this.setShowTreeLines = createHandler(this.showTreeLines$);
    this.leafNodeGroupNameField$ = new BehaviorSubject<
      keyof TRowData | undefined
    >(undefined);
    this.setLeafNodeGroupNameField = createHandler(
      this.leafNodeGroupNameField$
    );

    this.rowsByKey$ = new BehaviorSubject<Map<string, RowNode<TRowData>>>(
      new Map()
    );
    this.expandEvents$ = new Subject<ExpandCollapseEvent>();
    this.expandCollapseNode = createHandler(this.expandEvents$);

    const getRowKey: RowKeyGetter<RowNode<TRowData>> = (row, index) => {
      return row ? row.key : `row_${index}`;
    };

    this.gridModel = new GridModel<RowNode<TRowData>>(getRowKey);

    combineLatest([this.columnDefinitions$, this.rowGrouping$]).subscribe(
      ([columnDefinitions, rowGrouping]) => {
        const columns = columnDefinitions.map((colDef, index) => {
          return new DataGridColumn(colDef);
        });
        // TODO
        if (rowGrouping && rowGrouping.groupLevels.length > 0) {
          const groupColumn: DataGridColumn = new DataGridColumn({
            key: "group",
            field: "",
            type: "",
            title: rowGrouping.title,
            width: rowGrouping.width,
            cellComponent: GroupCellValue,
            pinned: rowGrouping.pinned,
          });
          columns.unshift(groupColumn);
        }
        this.columns$.next(columns);
      }
    );

    this.columns$.subscribe((columns) => {
      const gridColumnDefinitions = columns.map((column) => {
        const columnDefinition: ColumnDefinition<RowNode<TRowData>> = {
          key: column.definition.key,
          title: column.definition.title || column.definition.field,
          cellValueComponent: DataGridCellValue,
          data: column,
          headerValueComponent: DataGridColumnHeader,
          headerClassName: column.definition.headerClassName,
          pinned: column.definition.pinned,
          width: column.definition.width,
        };
        return columnDefinition;
      });
      this.gridModel.setColumnDefinitions(gridColumnDefinitions);
    });

    this.filterFn$ = new BehaviorSubject<FilterFn<TRowData> | undefined>(
      undefined
    );
    this.setFilterFn = createHandler(this.filterFn$);

    this.sortFn$ = new BehaviorSubject<SortFn<TRowData> | undefined>(undefined);
    this.setSortFn = createHandler(this.sortFn$);
    this.sortSettings$ = new BehaviorSubject<SortInfo[] | undefined>(undefined);
    this.setSortSettings = createHandler(this.sortSettings$);

    combineLatest([this.columns$, this.sortSettings$]).subscribe(
      ([columns, sortSettings]) => {
        for (let column of columns) {
          if (!sortSettings) {
            column.setSortDirection(undefined);
            column.setSortPriority(undefined);
            continue;
          }
          const priority = sortSettings.findIndex(
            (s) => s.columnName === column.definition.title
          );
          if (priority === -1) {
            column.setSortDirection(undefined);
            column.setSortPriority(undefined);
            continue;
          }
          const { direction } = sortSettings[priority];
          column.sortDirection$.next(direction);
          column.sortPriority$.next(priority);
        }
      }
    );

    this.leafNodeSortFn$ = new BehaviorSubject<
      SortFn<LeafRowNode<TRowData>> | undefined
    >(undefined);

    this.sortFn$
      .pipe(
        map((fn) =>
          !fn
            ? undefined
            : (a: LeafRowNode<TRowData>, b: LeafRowNode<TRowData>) =>
                fn(a.data$.getValue(), b.data$.getValue())
        )
      )
      .subscribe((fn) => this.leafNodeSortFn$.next(fn));

    this.topLevelRows$ = new BehaviorSubject<RowNode<TRowData>[]>([]);
    this.visibleRows$ = new BehaviorSubject<RowNode<TRowData>[]>([]);

    this.data$.subscribe((data) => {
      const rows = data.map((rowData, index) => {
        const key = this.rowKeyGetter(rowData);
        return new LeafRowNode(key, rowData);
      });

      this.leafRows$.next(rows);
    });

    combineLatest([this.leafRows$, this.filterFn$])
      .pipe(
        map(([leafNodes, filterFn]) =>
          filterFn != undefined
            ? leafNodes.filter((rowNode) => filterFn(rowNode.data$.getValue()))
            : leafNodes
        )
      )
      .subscribe((filteredNodes) => {
        this.filteredLeafRows$.next(filteredNodes);
      });

    combineLatest([this.filteredLeafRows$, this.leafNodeSortFn$])
      .pipe(
        map(([filteredLeafNodes, leafNodeSortFn]) => {
          const sortedNodes = [...filteredLeafNodes];
          if (leafNodeSortFn != undefined) {
            sortedNodes.sort(leafNodeSortFn);
          }
          return sortedNodes;
        })
      )
      .subscribe((sortedNodes) => {
        this.sortedLeafRows$.next(sortedNodes);
      });

    combineLatest([
      this.sortedLeafRows$,
      this.rowGrouping$,
      this.leafNodeGroupNameField$,
    ])
      .pipe(
        map(([sortedLeafNodes, rowGrouping, leafNodeGroupNameField]) =>
          rowGrouping == undefined || rowGrouping.groupLevels.length < 1
            ? sortedLeafNodes
            : groupRows(sortedLeafNodes, rowGrouping, leafNodeGroupNameField)
        ),
        distinctUntilChanged()
      )
      .subscribe((topLevelRows) => {
        this.topLevelRows$.next(topLevelRows);
      });

    this.topLevelRows$.subscribe((topLevelRows) => {
      this.visibleRows$.next(flattenVisibleRows(topLevelRows));
    });

    this.expandEvents$.subscribe((event) => {
      const { rowNode, expand = true } = event;
      rowNode.setExpanded(expand);
      const newVisibleRows = flattenVisibleRows(this.topLevelRows$.getValue());
      this.visibleRows$.next(newVisibleRows);
    });

    this.visibleRows$.subscribe((visibleRows) => {
      this.gridModel.setData(visibleRows);
    });

    this.rowDividerField$ = new BehaviorSubject<keyof TRowData | undefined>(
      undefined
    );
    this.setRowDividerField = createHandler(this.rowDividerField$);

    // TODO add comparer function to props
    this.rowDividerField$
      .pipe(
        map((rowDividerField) => {
          if (!rowDividerField) {
            return of({
              visibleRows: [],
              rowDividerField: undefined,
            });
          }
          return this.visibleRows$.pipe(
            map(
              (visibleRows) =>
                ({ visibleRows, rowDividerField } as {
                  visibleRows: RowNode<TRowData>[];
                  rowDividerField: keyof TRowData;
                })
            )
          );
        }),
        switchMap((x) => x),
        map(({ visibleRows, rowDividerField }) => {
          if (!rowDividerField) {
            return [];
          }
          const fieldValues = visibleRows.map((currentValue) => {
            if (!isLeafNode(currentValue)) {
              return undefined;
            }
            const currentRowData = currentValue.data$.getValue();
            return currentRowData ? currentRowData[rowDividerField] : undefined;
          });
          const rowDividers: number[] = [];
          for (let i = 0; i < fieldValues.length - 1; ++i) {
            if (fieldValues[i] != fieldValues[i + 1]) {
              rowDividers.push(i);
            }
          }
          return rowDividers;
        })
      )
      .subscribe((rowDividers) => this.gridModel.setRowDividers(rowDividers));

    this.backgroundVariant$ = new BehaviorSubject<
      GridBackgroundVariant | undefined
    >(undefined);
    this.setBackgroundVariant = createHandler(this.backgroundVariant$);
    this.backgroundVariant$.subscribe((backgroundVariant) => {
      this.gridModel.setBackgroundVariant(backgroundVariant);
    });

    this.setIsFramed = this.gridModel.setIsFramed;
  }
}
