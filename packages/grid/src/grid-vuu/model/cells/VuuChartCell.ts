import { BehaviorSubject } from "rxjs";
import { createHandler, createHook } from "../../../grid";
import { RawVuuRecord, VuuColumnDefinition } from "../VuuDataSet";
import { IVuuCell } from "./VuuCell";

function normalize(value: number[], min: number, max: number) {
  const m = 1 / (max - min);
  return value.map((x) => (x - min) * m);
}

export class VuuChartCell implements IVuuCell {
  private readonly _value$: BehaviorSubject<number[]>;
  private readonly _normalizedValue$: BehaviorSubject<number[]>;
  private _min: number;
  private _max: number;
  public useValue: () => number[];
  public setValue: (value: number[]) => void;
  public useNormalizedValue: () => number[];

  public constructor(value: number[]) {
    this._value$ = new BehaviorSubject<number[]>(value);
    this._min = value.reduce((p, c) => Math.min(p, c));
    this._max = value.reduce((p, c) => Math.max(p, c));
    this.useValue = createHook(this._value$);
    this.setValue = createHandler(this._value$);
    this._normalizedValue$ = new BehaviorSubject<number[]>(
      normalize(value, this._min, this._max)
    );
    this.useNormalizedValue = createHook(this._normalizedValue$);
  }

  public update(record: RawVuuRecord, column: VuuColumnDefinition) {
    let newValueItem = column.getValue(record);
    if (newValueItem == null || Number.isNaN(newValueItem)) {
      newValueItem = 0;
    }
    let newNormalizedValue = this._normalizedValue$.getValue();
    let rangeChanged = newValueItem < this._min || newValueItem > this._max;
    const oldValue = this._value$.getValue();
    let newValue = [...oldValue, newValueItem];

    const maxLength = 20;

    while (newValue.length > maxLength) {
      const overflow = newValue.shift();
      newNormalizedValue.shift();
      rangeChanged =
        rangeChanged || overflow <= this._min || overflow >= this._max;
    }
    if (rangeChanged) {
      this._min = newValue.reduce((p, c) => Math.min(p, c));
      this._max = newValue.reduce((p, c) => Math.max(p, c));
      newNormalizedValue = normalize(newValue, this._min, this._max);
    } else {
      newNormalizedValue.push(
        (newValueItem - this._min) / (this._max - this._min)
      );
    }
    this._value$.next(newValue);
    this._normalizedValue$.next(newNormalizedValue);
  }
}
