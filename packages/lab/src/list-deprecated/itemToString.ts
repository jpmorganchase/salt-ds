import { isPlainObject } from "./internal/helpers";

export type ItemToStringFunction = (item: any) => string;

export function itemToString(item: any) {
  if (!isPlainObject(item)) {
    return String(item);
  }

  if (Object.hasOwn(item, "label")) {
    return String(item.label);
  }

  console.warn(
    [
      "itemToString: you've likely forgotten to set the label prop on the item object.",
      "You can also provide your own `itemToString` implementation.",
    ].join("\n"),
  );

  return "";
}
