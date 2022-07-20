import { ColumnDefinition, ColumnPinType } from "./ColumnDefinition";
import { BehaviorSubject } from "rxjs";
import { createHook } from "./utils";

export const defaultColumnWidth = 150;
export type ColumnSeparatorType = "regular" | "none" | "groupEdge";

// Internal representation of a column.
export class Column<TRowData = any, TCellValue = any, TColumnData = any> {
  public readonly key: string;
  public index: number = 0;
  public isResizable: boolean = false;

  public readonly definition: ColumnDefinition<TRowData, TCellValue>;
  public readonly width$: BehaviorSubject<number>;
  public readonly isEditable$: BehaviorSubject<boolean>;
  public readonly pinned$: BehaviorSubject<ColumnPinType | null>;
  public readonly separator$: BehaviorSubject<ColumnSeparatorType>;
  public readonly title$: BehaviorSubject<string>;
  public readonly data$: BehaviorSubject<TColumnData | undefined>;

  public useWidth: () => number;
  public useIsEditable: () => boolean;
  public usePinned: () => ColumnPinType | null;
  public useSeparator: () => ColumnSeparatorType;
  public useTitle: () => string;
  public useData: () => TColumnData | undefined;

  public constructor(
    definition: ColumnDefinition<TRowData, TCellValue, TColumnData>
  ) {
    this.key = definition.key;
    this.definition = definition;
    this.width$ = new BehaviorSubject<number>(
      definition.width != null ? definition.width : defaultColumnWidth
    );
    this.pinned$ = new BehaviorSubject<ColumnPinType>(null);
    this.separator$ = new BehaviorSubject<ColumnSeparatorType>("regular");
    this.title$ = new BehaviorSubject<string>(definition.title || "");
    this.isEditable$ = new BehaviorSubject(!!definition.isEditable);
    this.data$ = new BehaviorSubject<TColumnData | undefined>(definition.data);

    this.useWidth = createHook(this.width$);
    this.useIsEditable = createHook(this.isEditable$);
    this.usePinned = createHook(this.pinned$);
    this.useSeparator = createHook(this.separator$);
    this.useTitle = createHook(this.title$);
    this.useData = createHook(this.data$);
  }
}
