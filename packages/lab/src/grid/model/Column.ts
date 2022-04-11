import { ColumnDefinition, ColumnPinType } from "./ColumnDefinition";
import { BehaviorSubject } from "rxjs";
import { useObservable } from "./useObservable";

export const defaultColumnWidth = 150;
export type ColumnSeparatorType = "regular" | "none" | "groupEdge";

// Internal representation of a column.
export class Column<T = any, U = any> {
  public readonly key: string;
  public index: number = 0;
  public isResizable: boolean = false;
  public readonly definition: ColumnDefinition<T, U>;
  public readonly width$: BehaviorSubject<number>;
  public readonly isEditable$: BehaviorSubject<boolean>;

  public useWidth() {
    return useObservable(this.width$);
  }

  public useIsEditable() {
    return useObservable(this.isEditable$);
  }

  public readonly pinned$: BehaviorSubject<ColumnPinType | null>;
  public usePinned() {
    return useObservable(this.pinned$);
  }

  public readonly separator$: BehaviorSubject<ColumnSeparatorType>;
  public useSeparator() {
    return useObservable(this.separator$);
  }

  public readonly title$: BehaviorSubject<string>;
  public useTitle() {
    return useObservable(this.title$);
  }

  public constructor(definition: ColumnDefinition<T, U>) {
    this.key = definition.key;
    this.definition = definition;
    this.width$ = new BehaviorSubject<number>(
      definition.width != null ? definition.width : defaultColumnWidth
    );
    this.pinned$ = new BehaviorSubject<ColumnPinType>(null);
    this.separator$ = new BehaviorSubject<ColumnSeparatorType>("regular");
    this.title$ = new BehaviorSubject<string>(definition.title || "");
    this.isEditable$ = new BehaviorSubject(!!definition.isEditable);
  }
}
