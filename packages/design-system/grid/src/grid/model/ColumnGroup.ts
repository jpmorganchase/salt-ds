import { ColumnGroupDefinition } from "./ColumnGroupDefinition";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
} from "rxjs";
import { ColumnPinType } from "./ColumnDefinition";
import { Column } from "./Column";
import { sum } from "./GridModel";

export type ColumnGroupRowSeparatorType = "first" | "regular" | "last";
export type ColumnGroupColumnSeparatorType = "regular" | "none";

// Internal representation of a group of columns
export class ColumnGroup<T = any> {
  public readonly key: string;
  public index: number;
  public readonly definition: ColumnGroupDefinition<T>;

  public readonly pinned: BehaviorSubject<ColumnPinType | null>;
  public readonly columns: BehaviorSubject<Column<T>[]>;
  public readonly colSpan: BehaviorSubject<number>;
  public readonly title: BehaviorSubject<string>;
  public readonly rowSeparator: BehaviorSubject<ColumnGroupRowSeparatorType>;
  public readonly columnSeparator: BehaviorSubject<ColumnGroupColumnSeparatorType>;
  public readonly width: BehaviorSubject<number>;

  public constructor(definition: ColumnGroupDefinition<T>) {
    this.key = definition.key;
    this.index = 0;
    this.definition = definition;
    this.pinned = new BehaviorSubject<ColumnPinType>(definition.pinned || null);
    this.columns = new BehaviorSubject<Column<T>[]>([]);
    this.colSpan = new BehaviorSubject<number>(0);
    this.title = new BehaviorSubject<string>(definition.title);
    this.width = new BehaviorSubject<number>(0);
    this.rowSeparator = new BehaviorSubject<ColumnGroupRowSeparatorType>(
      "regular"
    );
    this.columnSeparator = new BehaviorSubject<ColumnGroupColumnSeparatorType>(
      "regular"
    );
    this.columns
      .pipe(
        map((columns) => columns.length),
        distinctUntilChanged()
      )
      .subscribe(this.colSpan);
    this.columns
      .pipe(
        map((columns) => {
          const widthStreams = columns.map((c) => c.width$);
          return combineLatest(widthStreams).pipe(map(sum));
        }),
        switchMap((x) => x)
      )
      .subscribe(this.width);
  }
}
