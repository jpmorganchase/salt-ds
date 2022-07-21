import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import { createHandler, createHook } from "../../grid";
import { FilterFn } from "../DataGridModel";

export type FilterRowKind = "where" | "and" | "or";
export type TextFilterRowOperator = "contains" | "starts with" | "ends with";
// export type NumericFilterRowOperator = "less than" | "equals" | "greater than";
// TODO

export interface FilterColumn<T> {
  name: string;
  field: keyof T;
}

export class FilterRowModel<T> {
  public readonly kind$: BehaviorSubject<FilterRowKind>;
  public readonly column$: BehaviorSubject<FilterColumn<T> | undefined>;
  public readonly columns$: BehaviorSubject<FilterColumn<T>[]>;
  public readonly operator$: BehaviorSubject<string>;
  public readonly operators$: BehaviorSubject<string[]>;
  public readonly query$: BehaviorSubject<string>;

  public readonly useKind: () => FilterRowKind;
  public readonly setKind: (kind: FilterRowKind) => void;
  public readonly useColumn: () => FilterColumn<T> | undefined;
  public readonly setColumn: (column: FilterColumn<T> | undefined) => void;
  public readonly useColumns: () => FilterColumn<T>[];
  public readonly useOperator: () => string;
  public readonly setOperator: (operator: string) => void;
  public readonly useOperators: () => string[];
  public readonly useQuery: () => string;
  public readonly setQuery: (query: string) => void;

  constructor(columns: FilterColumn<T>[], kind: FilterRowKind = "where") {
    this.kind$ = new BehaviorSubject<FilterRowKind>(kind);
    this.column$ = new BehaviorSubject<FilterColumn<T> | undefined>(undefined);
    this.columns$ = new BehaviorSubject<FilterColumn<T>[]>(columns);
    this.operator$ = new BehaviorSubject<string>("contains");
    this.operators$ = new BehaviorSubject<string[]>([
      "contains",
      "starts with",
      "ends with",
    ]);
    this.query$ = new BehaviorSubject<string>("");
    this.useKind = createHook(this.kind$);
    this.setKind = createHandler(this.kind$);
    this.useColumn = createHook(this.column$);
    this.setColumn = createHandler(this.column$);
    this.useColumns = createHook(this.columns$);
    this.useOperator = createHook(this.operator$);
    this.setOperator = createHandler(this.operator$);
    this.useOperators = createHook(this.operators$);
    this.useQuery = createHook(this.query$);
    this.setQuery = createHandler(this.query$);
  }
}

function createFilterFn<T>(
  column?: FilterColumn<T>,
  operator?: string,
  query?: string
) {
  if (!column || !operator || !query) {
    return () => true;
  }
  if (operator === "contains") {
    return (x: T) => String(x[column.field]).includes(query);
  }
  if (operator === "starts with") {
    return (x: T) => String(x[column.field]).startsWith(query);
  }
  if (operator === "ends with") {
    return (x: T) => String(x[column.field]).endsWith(query);
  }
  return () => true; // TODO
}

export class FilterModel<T> {
  public readonly rows$: BehaviorSubject<FilterRowModel<T>[]>;
  public readonly useRows: () => FilterRowModel<T>[];
  public readonly columns: FilterColumn<T>[];
  public readonly filterFn$: BehaviorSubject<FilterFn<T> | undefined>;
  public readonly useFilterFn: () => FilterFn<T> | undefined;

  constructor(columns: FilterColumn<T>[]) {
    this.columns = columns;
    this.rows$ = new BehaviorSubject<FilterRowModel<T>[]>([
      new FilterRowModel(this.columns),
    ]);
    this.useRows = createHook(this.rows$);
    this.filterFn$ = new BehaviorSubject<FilterFn<T> | undefined>(undefined);
    this.useFilterFn = createHook(this.filterFn$);

    this.rows$
      .pipe(
        map((rows) => {
          const rowFilters = rows.map((row) => {
            return combineLatest([
              row.kind$,
              row.column$,
              row.operator$,
              row.query$,
            ]).pipe(
              map(([kind, column, operator, query]) => {
                return [kind, createFilterFn(column, operator, query)] as [
                  string,
                  FilterFn<T>
                ];
              })
            );
          });
          return combineLatest(rowFilters).pipe(
            map((rowFilters) => {
              return function (x: T) {
                for (let rowFilter of rowFilters) {
                  const [kind, fn] = rowFilter;
                  // TODO and/or
                  if (!fn(x)) {
                    return false;
                  }
                }
                return true;
              };
            })
          );
        }),
        switchMap((x) => x)
      )
      .subscribe((fn) => {
        this.filterFn$.next(fn);
      });
  }

  public addRow(rowIndex: number) {
    const row = new FilterRowModel(this.columns, "and");
    let rows = this.rows$.getValue();
    rows = [...rows.slice(0, rowIndex + 1), row, ...rows.slice(rowIndex + 1)];
    this.rows$.next(rows);
  }

  public deleteRow(rowIndex: number) {
    let rows = this.rows$.getValue();
    if (rows.length === 1) {
      rows[0].setQuery("");
      return;
    }
    rows = [...rows.slice(0, rowIndex), ...rows.slice(rowIndex + 1)];
    if (rowIndex === 0) {
      rows[0].setKind("where");
    }
    this.rows$.next(rows);
  }
}
