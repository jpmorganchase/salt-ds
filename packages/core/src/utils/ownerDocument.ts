export function ownerDocument(node: Node | null | undefined): Document {
  return node?.ownerDocument || document;
}
