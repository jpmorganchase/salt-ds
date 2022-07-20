import { BehaviorSubject } from "rxjs";
import { createHandler, createHook } from "../../../grid";
import { RawVuuRecord, VuuColumnDefinition } from "../VuuDataSet";
import { IVuuCell } from "./VuuCell";

export class VuuNumericCell implements IVuuCell {
  private readonly _value$: BehaviorSubject<number>;
  private readonly _lastChange$: BehaviorSubject<number>;

  public useValue: () => number;
  public useLastChange: () => number;

  public setValue: (value: number) => void;

  public constructor(value: number) {
    this._value$ = new BehaviorSubject<number>(value);
    this._lastChange$ = new BehaviorSubject<number>(0);

    this.useValue = createHook(this._value$);
    this.setValue = createHandler(this._value$);
    this.useLastChange = createHook(this._lastChange$);
  }

  public update(record: RawVuuRecord, column: VuuColumnDefinition) {
    const newValue = column.getValue(record);
    const oldValue = this._value$.getValue();
    if (oldValue === newValue) {
      return;
    }
    const change = newValue - oldValue;
    this._value$.next(newValue);
    this._lastChange$.next(change);
  }
}
