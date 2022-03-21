import { BehaviorSubject } from "rxjs";
import { createHandler, createHook } from "../../../grid";
import {
  DataSetColumn,
  DataSetRow,
  DataSetTextColumnDefinition,
} from "../DataSet";

export class TextField {
  public readonly value$ = new BehaviorSubject<string | undefined>(undefined);
  public useValue = createHook(this.value$);
  public setValue = createHandler(this.value$);
  constructor() {}
}

export function defaultTextSortFn<T>(column: DataSetColumn<T>) {
  return function (a: DataSetRow<T>, b: DataSetRow<T>) {
    const { key } = column;
    const fieldA = a.fields.get(key) as TextField;
    const fieldB = b.fields.get(key) as TextField;
    const valueA = fieldA.value$.getValue();
    const valueB = fieldB.value$.getValue();
    return (valueA || "")?.localeCompare(valueB || "");
  };
}

export function createTextField<T>(item: T, column: DataSetColumn<T>) {
  const field = new TextField();
  const definition = column.definition as DataSetTextColumnDefinition<T>;
  const value = item[definition.field] as any as string;
  field.setValue(value);
  return field;
}
