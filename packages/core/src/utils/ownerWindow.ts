import { ownerDocument } from "./ownerDocument";

export function ownerWindow(node: Node | null | undefined) {
  const doc = ownerDocument(node);
  return doc.defaultView || window;
}
