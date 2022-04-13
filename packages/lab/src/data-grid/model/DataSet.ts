import {
  ColumnPinType,
  createHandler,
  createHook,
  KeyOfType,
  RowKeyGetter,
} from "../../grid";
import {
  BehaviorSubject,
  combineLatest,
  map,
  OperatorFunction,
  scan,
  Subject,
} from "rxjs";
import {
  defaultNumericSortFn,
  defaultPriceSortFn,
  defaultTextSortFn,
  defaultTreeSortFn,
  NumericField,
  PriceField,
  TextField,
  TreeField,
} from "./fields";
import { createRows } from "./rowFactory";

export type SortFn<T> = (a: DataSetRow<T>, b: DataSetRow<T>) => number;

export type ColumnType = "text" | "numeric" | "tree" | "price";

interface BaseDataSetColumnDefinition<T> {
  key: string;
  title: string;
  sort?: SortFn<T>;
  type: ColumnType;
  pinned?: ColumnPinType;
}

export interface DataSetTextColumnDefinition<T>
  extends BaseDataSetColumnDefinition<T> {
  type: "text";
  field: KeyOfType<T, string>;
}

export interface DataSetNumericColumnDefinition<T>
  extends BaseDataSetColumnDefinition<T> {
  type: "numeric";
  precision?: number;
  field: KeyOfType<T, string>;
}

export interface DataSetTreeColumnDefinition<T>
  extends BaseDataSetColumnDefinition<T> {
  type: "tree";
  field: KeyOfType<T, string>;
}

export interface DataSetPriceColumnDefinition<T>
  extends BaseDataSetColumnDefinition<T> {
  type: "price";
  amountField: KeyOfType<T, number>;
  currencyField: KeyOfType<T, string>;
  precision: number;
}

export type DataSetColumnDefinition<T = any> =
  | DataSetTextColumnDefinition<T>
  | DataSetNumericColumnDefinition<T>
  | DataSetTreeColumnDefinition<T>
  | DataSetPriceColumnDefinition<T>;

export type TreeDataSetField =
  | NumericField
  | TextField
  | TreeField
  | PriceField;

export type SortDirection = "ascending" | "descending";

export class DataSetRow<T> {
  public readonly key: string;
  public readonly isExpanded$ = new BehaviorSubject<boolean>(false);
  public children: DataSetRow<T>[] | undefined;
  public readonly fields: Map<string, TreeDataSetField>;
  public readonly treeField: TreeField;

  public get isExpandable() {
    return this.children != null;
  }

  constructor(
    key: string,
    treeField: TreeField,
    fields: Map<string, TreeDataSetField>
  ) {
    this.key = key;
    this.treeField = treeField;
    this.fields = fields;
    this.isExpanded$.subscribe((isExpanded) =>
      this.treeField.isExpanded$.next(isExpanded)
    );
  }
}

export class DataSetColumn<T = any> {
  public readonly key: string;
  public readonly type: ColumnType;
  public readonly title: string;
  public readonly definition: DataSetColumnDefinition<T>;
  public readonly sort: SortFn<T>;

  public readonly sortDirection$ = new BehaviorSubject<
    SortDirection | undefined
  >(undefined);

  public useSortDirection = createHook(this.sortDirection$);

  constructor(definition: DataSetColumnDefinition<T>) {
    this.key = definition.key;
    this.title = definition.title;
    this.type = definition.type;
    this.definition = definition;
    this.sort = definition.sort || getDefaultSortFn(this);
  }
}

export interface ExpandEvent {
  rowKey: string;
  isExpanded: boolean;
}

export interface SortSettings {
  columnKey: string;
  direction: SortDirection;
}

export interface SortEvent {
  columnKey: string;
  direction?: SortDirection;
}

export function withPrevious<T>(): OperatorFunction<T, [T | undefined, T]> {
  return scan<T, [T | undefined, T], [T | undefined, T | undefined]>(
    (acc, curr) => [acc[1], curr] as [T | undefined, T],
    [undefined, undefined] as [T | undefined, T | undefined]
  );
}

function getDefaultSortFn<T>(column: DataSetColumn<T>) {
  switch (column.type) {
    case "text":
      return defaultTextSortFn(column);
    case "numeric":
      return defaultNumericSortFn(column);
    case "tree":
      return defaultTreeSortFn(column);
    case "price":
      return defaultPriceSortFn(column);
  }
}

export class DataSet<T = any> {
  private readonly getKey: RowKeyGetter<T>;
  private readonly childrenPropName: KeyOfType<T, T[] | undefined>;
  private readonly data$ = new BehaviorSubject<T[]>([]);
  private readonly columnDefinitions$ = new BehaviorSubject<
    DataSetColumnDefinition<T>[]
  >([]);
  public readonly columns$ = new BehaviorSubject<DataSetColumn[]>([]);
  private readonly columnsByKey$ = new BehaviorSubject<
    Map<string, DataSetColumn>
  >(new Map());
  private readonly sortSettings$ = new BehaviorSubject<
    SortSettings | undefined
  >(undefined);
  private readonly sortEvents$ = new Subject<SortEvent>();

  private readonly topLevelRows$ = new BehaviorSubject<DataSetRow<T>[]>([]);
  public readonly visibleRows$ = new BehaviorSubject<DataSetRow<T>[]>([]);
  public readonly sortedTopLevelRows$ = new BehaviorSubject<DataSetRow<T>[]>(
    []
  );
  private readonly rowsByKey$ = new BehaviorSubject<Map<string, DataSetRow<T>>>(
    new Map()
  );
  private readonly expandEvents$ = new Subject<ExpandEvent>();

  public setData = createHandler(this.data$);
  public setColumnDefinitions = createHandler(this.columnDefinitions$);

  public expandRow = createHandler(this.expandEvents$);
  public sort = createHandler(this.sortEvents$);
  public useColumnsByKey = createHook(this.columnsByKey$);

  constructor(
    getKey: RowKeyGetter<T>,
    childrenPropName: KeyOfType<T, T[] | undefined>
  ) {
    this.getKey = getKey;
    this.childrenPropName = childrenPropName;

    this.columnDefinitions$.subscribe((columnDefinitions) => {
      const columns: DataSetColumn[] = columnDefinitions.map((definition) => {
        return new DataSetColumn(definition);
      });
      this.columns$.next(columns);
    });

    this.columns$
      .pipe(
        map(
          (columns) =>
            new Map<string, DataSetColumn>(
              columns.map((column) => [column.key, column])
            )
        )
      )
      .subscribe(this.columnsByKey$);

    this.data$.subscribe((data) => {
      const topLevelRows = createRows(
        this.getKey,
        data,
        this.columns$.getValue(),
        this.childrenPropName
      );
      this.topLevelRows$.next(topLevelRows);
    });

    this.topLevelRows$.subscribe((topLevelRows) => {
      const rowsByKey = new Map<string, DataSetRow<T>>();
      this.addRowsToIndex(topLevelRows, rowsByKey);
      this.rowsByKey$.next(rowsByKey);
    });

    combineLatest([this.topLevelRows$, this.sortSettings$]).subscribe(
      ([topLevelRows, sortSettings]) => {
        const sortedTopLevelRows = [...topLevelRows];
        if (sortSettings) {
          const key = sortSettings.columnKey;
          const column = this.columnsByKey$.getValue().get(key);
          if (column) {
            sortedTopLevelRows.sort(column.sort);
            if (sortSettings.direction === "descending") {
              sortedTopLevelRows.reverse();
            }
          }
        }
        this.sortedTopLevelRows$.next(sortedTopLevelRows);
      }
    );

    this.sortedTopLevelRows$.subscribe((sortedTopLevelRows) => {
      const visibleRows: DataSetRow<T>[] = [];
      this.addVisibleRows(sortedTopLevelRows, visibleRows, 0);
      this.visibleRows$.next(visibleRows);
    });

    this.expandEvents$.subscribe((event) => {
      console.log(`expandEvents$: ${JSON.stringify(event)}`);
      const { rowKey, isExpanded } = event;
      const rowsByKey = this.rowsByKey$.getValue();
      const row = rowsByKey.get(rowKey);
      if (!row) {
        console.warn(`Row not found. rowKey: "${rowKey}".`);
        return;
      }
      row.isExpanded$.next(isExpanded);
      const sortedTopLevelRows = this.sortedTopLevelRows$.getValue();
      const visibleRows: DataSetRow<T>[] = [];
      this.addVisibleRows(sortedTopLevelRows, visibleRows, 0);
      this.visibleRows$.next(visibleRows);
    });

    this.sortEvents$.subscribe((event) => {
      const { columnKey } = event;
      const sortSettings = this.sortSettings$.getValue();
      const direction =
        event.direction ||
        (sortSettings &&
          sortSettings.columnKey === columnKey &&
          sortSettings.direction === "ascending")
          ? "descending"
          : "ascending";
      this.sortSettings$.next({ columnKey, direction });
    });

    this.sortSettings$
      .pipe(withPrevious())
      .subscribe(([oldSortSettings, newSortSettings]) => {
        if (
          oldSortSettings &&
          (!newSortSettings ||
            oldSortSettings.columnKey !== newSortSettings.columnKey)
        ) {
          const { columnKey } = oldSortSettings;
          const columns = this.columns$.getValue();
          const column = columns.find((c) => c.key === columnKey);
          if (column) {
            column.sortDirection$.next(undefined);
          }
        }
        if (newSortSettings) {
          const { columnKey, direction } = newSortSettings;
          const columns = this.columns$.getValue();
          const column = columns.find((c) => c.key === columnKey);
          if (column) {
            column.sortDirection$.next(direction);
          }
        }
      });
  }

  private addVisibleRows(
    rows: DataSetRow<T>[],
    visibleRows: DataSetRow<T>[],
    level: number
  ) {
    for (let row of rows) {
      row.treeField.setLevel(level);
      row.treeField.isExpandable$.next(
        !!row.children && row.children.length > 0
      );
      visibleRows.push(row);
      if (row.isExpanded$.getValue() && row.children) {
        this.addVisibleRows(row.children, visibleRows, level + 1);
      }
    }
  }

  private addRowsToIndex(
    rows: DataSetRow<T>[],
    index: Map<string, DataSetRow<T>>
  ) {
    for (let row of rows) {
      index.set(row.key, row);
      if (row.children) {
        this.addRowsToIndex(row.children, index);
      }
    }
  }
}
