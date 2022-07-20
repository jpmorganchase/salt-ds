import { CellPosition } from "../model";

export function getAttribute(
  element: HTMLElement,
  attributeName: string
): [string, HTMLElement] {
  if (!element) {
    throw new Error(`Attribute "${attributeName}" not found`);
  }
  if (element.hasAttribute(attributeName)) {
    return [element.getAttribute(attributeName) as string, element];
  }
  return getAttribute(element.parentNode as HTMLElement, attributeName);
}

export function getRowIndex(element: HTMLElement): number {
  const [attribute] = getAttribute(element, "data-row-index");
  return parseInt(attribute, 10);
}

export function getRowKey(element: HTMLElement): string {
  const [rowKey] = getAttribute(element, "data-row-key");
  return rowKey;
}

export function getCellPosition(element: HTMLElement): CellPosition {
  const [rowIndexAttr] = getAttribute(element, "data-row-index");
  const [columnIndexAttr] = getAttribute(element, "data-column-index");
  const rowIndex = parseInt(rowIndexAttr, 10);
  const columnIndex = parseInt(columnIndexAttr, 10);
  return { rowIndex, columnIndex };
}
