import { BehaviorSubject } from "rxjs";
import { createHook } from "./utils";

// Internal representation of a row. Created for each visible row. Row component
// subscribes to this minimizing unnecessary re-renders.
export class Row<T = any> {
  public readonly key: string;

  public readonly index$: BehaviorSubject<number>;
  public useIndex: () => number;

  public readonly data$: BehaviorSubject<T>;
  public useData: () => T;

  public readonly isSelected$: BehaviorSubject<boolean>;
  public useIsSelected: () => boolean;

  public readonly isHoverOver$: BehaviorSubject<boolean>;
  public useIsHoverOver: () => boolean;

  public readonly cursorColumnIndex$: BehaviorSubject<number | undefined>;
  public useCursorColumnIndex: () => number | undefined;

  public readonly selectedCells$: BehaviorSubject<Set<string> | undefined>;
  public useSelectedCells: () => Set<string> | undefined;

  public readonly isEditMode$: BehaviorSubject<boolean>;
  public useIsEditMode: () => boolean;

  public readonly isZebra$: BehaviorSubject<boolean>;
  public useIsZebra: () => boolean;

  public readonly isDivided$: BehaviorSubject<boolean>;
  public useIsDivided: () => boolean;

  public constructor(key: string, index: number, data: T) {
    this.key = key;
    this.index$ = new BehaviorSubject<number>(index);
    this.data$ = new BehaviorSubject<T>(data);
    this.isSelected$ = new BehaviorSubject<boolean>(false);
    this.isHoverOver$ = new BehaviorSubject<boolean>(false);
    this.cursorColumnIndex$ = new BehaviorSubject<number | undefined>(
      undefined
    );
    this.isZebra$ = new BehaviorSubject<boolean>(false);
    this.isEditMode$ = new BehaviorSubject<boolean>(false);
    this.selectedCells$ = new BehaviorSubject<Set<string> | undefined>(
      undefined
    );
    this.isDivided$ = new BehaviorSubject<boolean>(false);

    this.useIndex = createHook(this.index$);
    this.useData = createHook(this.data$);
    this.useIsSelected = createHook(this.isSelected$);
    this.useIsHoverOver = createHook(this.isHoverOver$);
    this.useCursorColumnIndex = createHook(this.cursorColumnIndex$);
    this.useSelectedCells = createHook(this.selectedCells$);
    this.useIsEditMode = createHook(this.isEditMode$);
    this.useIsZebra = createHook(this.isZebra$);
    this.useIsDivided = createHook(this.isDivided$);
  }
}
