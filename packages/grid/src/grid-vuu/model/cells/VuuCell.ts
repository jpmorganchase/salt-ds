import { BehaviorSubject } from "rxjs";
import { createHandler, createHook } from "../../../grid";
import { RawVuuRecord, VuuColumnDefinition } from "../VuuDataSet";

export interface IVuuCell {
  update: (record: RawVuuRecord, column: VuuColumnDefinition) => void;
}

export class VuuCell<T = any> implements IVuuCell {
  private readonly _value$: BehaviorSubject<T>;
  public useValue: () => T;
  public setValue: (value: T) => void;

  public constructor(value: T) {
    this._value$ = new BehaviorSubject<T>(value);
    this.useValue = createHook(this._value$);
    this.setValue = createHandler(this._value$);
  }

  public update(record: RawVuuRecord, column: VuuColumnDefinition) {
    const cellValue = column.getValue(record);
    this.setValue(cellValue);
  }
}
