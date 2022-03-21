import { BehaviorSubject } from "rxjs";
import { createHandler, createHook } from "../../../grid";
import {
  DataSetColumn,
  DataSetRow,
  DataSetTreeColumnDefinition,
} from "../DataSet";

export class TreeField {
  public readonly text$ = new BehaviorSubject<string>("");
  public readonly level$ = new BehaviorSubject<number>(0);
  public readonly isExpanded$ = new BehaviorSubject<boolean>(false);
  public readonly isExpandable$ = new BehaviorSubject<boolean>(false);

  public useText = createHook(this.text$);
  public setText = createHandler(this.text$);
  public useLevel = createHook(this.level$);
  public setLevel = createHandler(this.level$);
  public useIsExpanded = createHook(this.isExpanded$);
  public useIsExpandable = createHook(this.isExpandable$);
}

export function defaultTreeSortFn<T>(column: DataSetColumn<T>) {
  return function (a: DataSetRow<T>, b: DataSetRow<T>) {
    const { key } = column;
    const fieldA = a.treeField;
    const fieldB = b.treeField;
    const valueA = fieldA.text$.getValue();
    const valueB = fieldB.text$.getValue();
    if (valueA == null) {
      return valueB == null ? 0 : 1;
    }
    return (valueA || "")?.localeCompare(valueB || "");
  };
}

export function createTreeField<T>(item: T, column: DataSetColumn<T>) {
  const field = new TreeField();
  const definition = column.definition as DataSetTreeColumnDefinition<T>;
  const text = item[definition.field] as any as string;
  field.setText(text);
  return field;
}
