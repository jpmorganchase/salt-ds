import { DataSetColumn, DataSetRow, TreeDataSetField } from "./DataSet";
import {
  createNumericField,
  createPriceField,
  createTextField,
  createTreeField,
  TreeField,
} from "./fields";
import { KeyOfType, RowKeyGetter } from "../../grid";

export function createRows<T>(
  getKey: RowKeyGetter<T>,
  data: T[],
  columns: DataSetColumn<T>[],
  childrenPropName: KeyOfType<T, T[] | undefined>
): DataSetRow<T>[] {
  return data.map((item, index) =>
    createRow(getKey, item, index, columns, childrenPropName)
  );
}

export function createRow<T>(
  getKey: RowKeyGetter<T>,
  item: T,
  index: number,
  columns: DataSetColumn<T>[],
  childrenPropName: KeyOfType<T, T[] | undefined>
) {
  const key = getKey(item, index);

  let treeField: TreeField | undefined = undefined;
  const fields = new Map<string, TreeDataSetField>();
  for (let c of columns) {
    if (c.type === "text") {
      fields.set(c.key, createTextField(item, c));
    } else if (c.type === "numeric") {
      fields.set(c.key, createNumericField(item, c));
    } else if (c.type === "tree") {
      treeField = createTreeField(item, c);
    } else if (c.type === "price") {
      fields.set(c.key, createPriceField(item, c));
    }
  }

  if (!treeField) {
    throw new Error(`Tree column definition is missing`);
  }

  const row = new DataSetRow<T>(key, treeField, fields);

  if (childrenPropName) {
    const subData = item[childrenPropName];
    if (subData) {
      row.children = createRows(
        getKey,
        subData as any as T[],
        columns,
        childrenPropName
      );
    }
  }

  return row;
}
