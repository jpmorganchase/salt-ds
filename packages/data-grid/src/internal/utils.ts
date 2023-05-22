import { FocusedPart } from "../CursorContext";

export function getAttribute(
  element: HTMLElement,
  attributeName: string
): [string, HTMLElement] {
  if (!element || !element.hasAttribute) {
    throw new Error(`Attribute "${attributeName}" not found`);
  }
  if (element.hasAttribute(attributeName)) {
    return [element.getAttribute(attributeName) as string, element];
  }
  return getAttribute(element.parentNode as HTMLElement, attributeName);
}

export function getRowIndexAttribute(element: HTMLElement): number {
  const [attribute] = getAttribute(element, "data-row-index");
  return parseInt(attribute, 10);
}

export function getRowKeyAttribute(element: HTMLElement): string {
  const [rowKey] = getAttribute(element, "data-row-key");
  return rowKey;
}

export function getFocusablePosition(element: HTMLElement): {
  part: FocusedPart;
  columnIndex: number;
  rowIndex: number;
} {
  const [columnIndexAttr, cellElement] = getAttribute(
    element,
    "data-column-index"
  );
  const columnIndex = parseInt(columnIndexAttr, 10);
  const role = cellElement.getAttribute("role");
  if (role === "columnheader") {
    return { part: "header", columnIndex, rowIndex: 0 };
  }
  const [rowIndexAttr] = getAttribute(element, "data-row-index");
  const rowIndex = parseInt(rowIndexAttr, 10);
  return { part: "body", rowIndex, columnIndex };
}

export function getCellPosition(element: HTMLElement): [number, number] {
  const [rowIndexAttr] = getAttribute(element, "data-row-index");
  const [columnIndexAttr] = getAttribute(element, "data-column-index");
  const rowIndex = parseInt(rowIndexAttr, 10);
  const columnIndex = parseInt(columnIndexAttr, 10);
  return [rowIndex, columnIndex];
}

const addMapItem = <K, V>(old: Map<K, V>, k: K, v: V): Map<K, V> => {
  const m = new Map(old);
  m.set(k, v);
  return m;
};

export const makeMapAdder =
  <K, V>(k: K, v: V) =>
  (old: Map<K, V>) =>
    addMapItem(old, k, v);

const deleteMapItem = <K, V>(old: Map<K, V>, k: K): Map<K, V> => {
  const m = new Map(old);
  m.delete(k);
  return m;
};

export const makeMapDeleter =
  <K, V>(k: K) =>
  (old: Map<K, V>) =>
    deleteMapItem(old, k);

export const clamp = (x: number | undefined, min: number, max: number) => {
  if (x == undefined) {
    x = 0;
  }
  if (x < min) {
    return min;
  }
  if (x > max) {
    return max;
  }
  return x;
};
