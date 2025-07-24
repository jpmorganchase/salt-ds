import { isPlainObject } from "./isPlainObject";

export const defaultItemToString = (item: any) => {
  if (!isPlainObject(item)) {
    return String(item);
  }

  if (Object.hasOwn(item, "label")) {
    return String(item.label);
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      [
        "itemToString: you've likely forgotten to set the label prop on the item object.",
        "You can also provide your own `itemToString` implementation.",
      ].join("\n"),
    );
  }

  return "";
};
