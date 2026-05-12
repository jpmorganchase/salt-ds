export function isHTMLElement(node: unknown): node is HTMLElement {
  if (!node || typeof node !== "object") {
    return false;
  }

  const ownerDocument = (node as { ownerDocument?: Document | null })
    .ownerDocument;
  const defaultView = ownerDocument?.defaultView;

  return !!defaultView && node instanceof defaultView.HTMLElement;
}
