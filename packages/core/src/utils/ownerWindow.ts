import { ownerDocument } from "@jpmorganchase/uitk-core";

export function ownerWindow(node: Node | null | undefined): Window {
  const doc = ownerDocument(node);
  return doc.defaultView || window;
}
