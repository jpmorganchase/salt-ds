import { ColumnDefinition } from "../../model";

export function createEmptyColumn<T>(): ColumnDefinition<T> {
  return {
    key: "emptyColumn",
    title: "",
    width: 100,
  };
}
