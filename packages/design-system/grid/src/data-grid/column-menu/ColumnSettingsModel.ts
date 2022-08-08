import { BehaviorSubject } from "rxjs";
import { ColumnPinType, createHandler, createHook } from "../../grid";

export class ColumnSettingsModel {
  public readonly pinned$: BehaviorSubject<ColumnPinType>;
  public readonly usePinned: () => ColumnPinType;
  public readonly setPinned: (pinType: ColumnPinType) => void;

  public constructor() {
    this.pinned$ = new BehaviorSubject<ColumnPinType>(null);
    this.usePinned = createHook(this.pinned$);
    this.setPinned = createHandler(this.pinned$);
  }
}
