import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import { createHandler, createHook } from "../../grid";

export interface GroupByColumn<T> {
  name: string;
  field: keyof T;
}

export class RowGroupingLevelModel<T> {
  public readonly column$: BehaviorSubject<GroupByColumn<T> | undefined>;
  public readonly columns$: BehaviorSubject<GroupByColumn<T>[]>;

  public readonly useColumn: () => GroupByColumn<T> | undefined;
  public readonly setColumn: (column: GroupByColumn<T> | undefined) => void;

  public readonly useColumns: () => GroupByColumn<T>[];

  constructor(columns: GroupByColumn<T>[]) {
    this.columns$ = new BehaviorSubject<GroupByColumn<T>[]>(columns);
    this.column$ = new BehaviorSubject<GroupByColumn<T> | undefined>(undefined);
    this.useColumn = createHook(this.column$);
    this.setColumn = createHandler(this.column$);
    this.useColumns = createHook(this.columns$);
  }
}

export class RowGroupingModel<T> {
  public readonly levels$: BehaviorSubject<RowGroupingLevelModel<T>[]>;
  public readonly useLevels: () => RowGroupingLevelModel<T>[];
  public readonly columns: GroupByColumn<T>[];
  public readonly rowGroupingSettings$: BehaviorSubject<
    GroupByColumn<T>[] | undefined
  >;
  public readonly useRowGroupingSettings: () => GroupByColumn<T>[] | undefined;

  constructor(columns: GroupByColumn<T>[]) {
    this.columns = columns;
    this.levels$ = new BehaviorSubject<RowGroupingLevelModel<T>[]>([
      new RowGroupingLevelModel(columns),
    ]);
    this.useLevels = createHook(this.levels$);
    this.rowGroupingSettings$ = new BehaviorSubject<
      GroupByColumn<T>[] | undefined
    >(undefined);
    this.useRowGroupingSettings = createHook(this.rowGroupingSettings$);

    this.levels$
      .pipe(
        map((levels) => {
          const levelColumns: BehaviorSubject<GroupByColumn<T> | undefined>[] =
            levels.map((level) => level.column$);
          return combineLatest(levelColumns);
        }),
        switchMap((x) => x),
        map((x) => x.filter((c) => c != undefined) as GroupByColumn<T>[])
      )
      .subscribe((levelColumns) =>
        this.rowGroupingSettings$.next(levelColumns)
      );
  }

  public addLevel(index: number) {
    const level = new RowGroupingLevelModel(this.columns);
    let levels = this.levels$.getValue();
    levels = [...levels.slice(0, index + 1), level, ...levels.slice(index + 1)];
    this.levels$.next(levels);
  }

  public deleteLevel(index: number) {
    let levels = this.levels$.getValue();
    if (levels.length === 1) {
      levels[0].setColumn(undefined);
      return;
    }
    levels = [...levels.slice(0, index), ...levels.slice(index + 1)];
    this.levels$.next(levels);
  }
}
