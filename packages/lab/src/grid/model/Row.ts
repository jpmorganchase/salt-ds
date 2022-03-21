import { BehaviorSubject } from "rxjs";
import { useObservable } from "./useObservable";

// Internal representation of a row. Created for each visible row. Row component
// subscribes to this minimizing unnecessary re-renders.
export class Row<T = any> {
  public readonly key: string;

  public readonly index$: BehaviorSubject<number>;
  public useIndex() {
    return useObservable(this.index$);
  }

  public readonly data$: BehaviorSubject<T>;
  public useData() {
    return useObservable(this.data$);
  }

  public readonly isSelected$: BehaviorSubject<boolean>;
  public useIsSelected() {
    return useObservable(this.isSelected$);
  }

  public readonly isHoverOver$: BehaviorSubject<boolean>;
  public useIsHoverOver() {
    return useObservable(this.isHoverOver$);
  }

  public readonly cursorColumnIndex$: BehaviorSubject<number | undefined>;
  public useCursorColumnIndex() {
    return useObservable(this.cursorColumnIndex$);
  }

  public readonly isEditMode$: BehaviorSubject<boolean>;
  public useIsEditMode() {
    return useObservable(this.isEditMode$);
  }

  public readonly isZebra$: BehaviorSubject<boolean>;
  public useIsZebra() {
    return useObservable(this.isZebra$);
  }

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
  }
}
