import { BehaviorSubject } from "rxjs";
import { createHandler, createHook } from "../../../grid";
import {
  DataSetColumn,
  DataSetNumericColumnDefinition,
  DataSetRow,
} from "../DataSet";

export class NumericField {
  public readonly value$ = new BehaviorSubject<number | undefined>(undefined);
  private readonly precision$ = new BehaviorSubject<number>(2);
  public useValue = createHook(this.value$);
  public setValue = createHandler(this.value$);
  public usePrecision = createHook(this.precision$);
  public setPrecision = createHandler(this.precision$);

  constructor() {}
}

export function defaultNumericSortFn<T>(column: DataSetColumn<T>) {
  return function (a: DataSetRow<T>, b: DataSetRow<T>) {
    const { key } = column;
    const fieldA = a.fields.get(key) as NumericField;
    const fieldB = b.fields.get(key) as NumericField;
    const valueA = fieldA.value$.getValue();
    const valueB = fieldB.value$.getValue();
    if (valueA == null) {
      return valueB == null ? 0 : 1;
    }
    return valueB == null ? -1 : valueA - valueB;
  };
}

export function createNumericField<T>(item: T, column: DataSetColumn<T>) {
  const field = new NumericField();
  const definition = column.definition as DataSetNumericColumnDefinition<T>;
  const value = item[definition.field] as any as number;
  field.setValue(value);
  field.setPrecision(definition.precision || 2);
  return field;
}
