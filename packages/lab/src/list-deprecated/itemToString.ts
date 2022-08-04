import { isPlainObject } from "./internal/helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemToStringFunction = (item: any) => string;

export function itemToString(item: any) {
  if (!isPlainObject(item)) {
    return String(item);
  }

  if (Object.prototype.hasOwnProperty.call(item, "label")) {
    return String(item.label);
  }

  console.warn(
    [
      "itemToString: you've likely forgotten to set the label prop on the item object.",
      "You can also provide your own `itemToString` implementation.",
    ].join("\n")
  );

  return "";
}
