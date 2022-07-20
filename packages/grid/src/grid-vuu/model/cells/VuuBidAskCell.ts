import { BehaviorSubject } from "rxjs";
import { createHook } from "../../../grid";
import { RawVuuRecord, VuuColumnDefinition } from "../VuuDataSet";
import { IVuuCell } from "./VuuCell";

export class VuuBidAskCell implements IVuuCell {
  private readonly _value$: BehaviorSubject<[number, number]>;

  public useValue: () => [number, number];

  public constructor(bid: number, ask: number) {
    this._value$ = new BehaviorSubject<[number, number]>([bid, ask]);

    this.useValue = createHook(this._value$);
  }

  public update(record: RawVuuRecord, column: VuuColumnDefinition) {
    const newValue = column.getValue(record) as [number, number];
    this._value$.next(newValue);
  }
}
