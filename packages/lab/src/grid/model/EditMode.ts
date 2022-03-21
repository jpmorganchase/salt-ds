import { BehaviorSubject } from "rxjs";
import { useObservable } from "./useObservable";
import { createHook } from "./utils";

export interface IEditMode {
  readonly setInputValue: (value: string) => void;
  readonly useInputValue: () => string;
  readonly useIsActive: () => boolean;
  readonly start: () => void;
  readonly end: () => void;
  readonly cancel: () => void;
}

export class EditMode implements IEditMode {
  public readonly isActive$ = new BehaviorSubject<boolean>(false);
  public readonly inputValue$ = new BehaviorSubject<string>("");

  public readonly useIsActive = createHook(this.isActive$);

  public setInputValue(value: string) {
    console.log(`setInputValue("${value}")`);
    this.inputValue$.next(value);
  }

  public useInputValue() {
    return useObservable(this.inputValue$);
  }

  public start() {
    console.log(`start()`);
    this.isActive$.next(true);
  }

  public end() {
    console.log(`end()`);
    this.isActive$.next(false);
  }

  public cancel() {
    console.log(`cancel()`);
    this.isActive$.next(false);
  }
}
