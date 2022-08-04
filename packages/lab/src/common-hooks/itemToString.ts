// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemToStringFunction = (item: any) => string;

const isPlainObject = (obj: unknown) =>
  Object.prototype.toString.call(obj) === "[object Object]";

export function itemToString(item: unknown): string {
  if (typeof item === "string") {
    return item;
  } else if (!isPlainObject(item)) {
    return String(item);
  }

  if (Object.prototype.hasOwnProperty.call(item, "label")) {
    return String((item as { label?: string }).label);
  }

  console.warn(
    [
      "itemToString: you've likely forgotten to set the label prop on the item object.",
      "You can also provide your own `itemToString` implementation.",
    ].join("\n")
  );

  return "";
}
