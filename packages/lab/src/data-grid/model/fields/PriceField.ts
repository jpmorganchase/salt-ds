import { BehaviorSubject } from "rxjs";
import { createHandler, createHook } from "../../../grid";
import {
  DataSetColumn,
  DataSetPriceColumnDefinition,
  DataSetRow,
} from "../DataSet";

export interface Price {
  amount: number;
  currency: string;
  precision: number;
}

export class PriceField {
  public readonly value$ = new BehaviorSubject<Price | undefined>(undefined);
  public useValue = createHook(this.value$);
  public setValue = createHandler(this.value$);
}

export function defaultPriceSortFn<T>(column: DataSetColumn<T>) {
  return function (a: DataSetRow<T>, b: DataSetRow<T>) {
    const { key } = column;
    const fieldA = a.fields.get(key) as PriceField;
    const fieldB = b.fields.get(key) as PriceField;
    const valueA = fieldA.value$.getValue();
    const valueB = fieldB.value$.getValue();
    if (valueA == null) {
      return valueB == null ? 0 : 1;
    }
    if (valueB == null) {
      return -1;
    }
    const currencyComp = valueA.currency.localeCompare(valueB.currency);
    if (currencyComp !== 0) {
      return currencyComp;
    }
    return valueA.amount - valueB.amount;
  };
}

export function createPriceField<T>(item: T, column: DataSetColumn<T>) {
  const field = new PriceField();
  const definition = column.definition as DataSetPriceColumnDefinition<T>;
  const value: Price = {
    amount: item[definition.amountField] as any as number,
    currency: item[definition.currencyField] as any as string,
    precision: definition.precision,
  };
  field.setValue(value);
  return field;
}
