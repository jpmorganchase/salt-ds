export type ItemToStringFunction = (item: any) => string;

const isPlainObject = (obj: unknown) =>
  Object.prototype.toString.call(obj) === "[object Object]";

export function itemToString(item: unknown): string {
  if (typeof item === "string") {
    return item;
  }
  if (!isPlainObject(item)) {
    return String(item);
  }

  if (item && typeof item === "object" && Object.hasOwn(item, "label")) {
    return String((item as { label?: string }).label);
  }

  console.warn(
    [
      "itemToString: you've likely forgotten to set the label prop on the item object.",
      "You can also provide your own `itemToString` implementation.",
    ].join("\n"),
  );

  return "";
}
