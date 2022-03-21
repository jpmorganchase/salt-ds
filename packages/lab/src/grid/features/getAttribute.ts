import { CellPosition } from "../model";

// Recursively searches for an attribute with the given name in the element and
// its parent chain.
// Returns the value of the attribute and the element that owns it.
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

// Which row is the given element in (returns row index)
export function getRowIndex(element: HTMLElement): number {
  const [attribute] = getAttribute(element, "data-row-index");
  return parseInt(attribute, 10);
}

// Which row is the given element in (returns row key)
export function getRowKey(element: HTMLElement): string {
  const [rowKey] = getAttribute(element, "data-row-key");
  return rowKey;
}

// Returns cell position when invoked for an element that is rendered within a cell
export function getCellPosition(element: HTMLElement): CellPosition {
  const [rowIndexAttr] = getAttribute(element, "data-row-index");
  const [columnIndexAttr] = getAttribute(element, "data-column-index");
  const rowIndex = parseInt(rowIndexAttr, 10);
  const columnIndex = parseInt(columnIndexAttr, 10);
  return { rowIndex, columnIndex };
}
