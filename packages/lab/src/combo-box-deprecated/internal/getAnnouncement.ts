export function getAnnouncement(
  itemCount = 0,
  firstItem: string | null
): string {
  return itemCount === 0
    ? "no results"
    : `${itemCount} ${itemCount > 1 ? "results" : "result"}${
        firstItem ? `, ${firstItem}` : ""
      }`;
}
