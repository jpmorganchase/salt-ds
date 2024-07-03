export function getAnnouncement(
  itemCount: number | undefined,
  firstItem: string | null,
): string {
  return itemCount === 0 || itemCount === undefined
    ? "no results"
    : `${itemCount} ${itemCount > 1 ? "results" : "result"}${
        firstItem ? `, ${firstItem}` : ""
      }`;
}
