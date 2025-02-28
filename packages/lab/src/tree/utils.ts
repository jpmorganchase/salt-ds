import type TreeNode from "./Node";

export function sortByDOMLocation(
  a: [id: TreeNode.Id, element: TreeNode.Element],
  b: [id: TreeNode.Id, element: TreeNode.Element],
) {
  const aElement = a[1];
  const bElement = b[1];

  const position = aElement.compareDocumentPosition(bElement);

  if (
    position & Node.DOCUMENT_POSITION_FOLLOWING ||
    position & Node.DOCUMENT_POSITION_CONTAINED_BY
  ) {
    return -1;
  }

  if (
    position & Node.DOCUMENT_POSITION_PRECEDING ||
    position & Node.DOCUMENT_POSITION_CONTAINS
  ) {
    return 1;
  }

  return 0;
}
