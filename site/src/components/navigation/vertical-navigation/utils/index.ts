import type { SidebarItem } from "@jpmorganchase/mosaic-store";
import type { Item } from "../VerticalNavigation";
// Helper function to determine if the item or any of its children is selected
export function containsSelected(item: Item, selectedNodeId?: string): boolean {
  if (!selectedNodeId) return false;
  if (item.href === selectedNodeId) return true;
  return (
    Array.isArray(item.children) &&
    item.children.some((child) => containsSelected(child, selectedNodeId))
  );
}

export function statusToBadgeValue(status: string) {
  return status.split(" ").reduce((acc, word) => {
    return acc + word[0].toUpperCase();
  }, "");
}

export function normalizeSelectedNodeId(link: string, navData: Item[]): string {
  if (link.endsWith("/examples")) {
    const indexLink = link.replace(/\/examples$/, "/index");
    // Check if navData contains indexLink
    const exists = (items: Item[]): boolean =>
      items.some(
        (item) =>
          item.href === indexLink || (item.children && exists(item.children)),
      );
    if (exists(navData)) {
      return indexLink;
    }
    // Fallback to removing /examples
    return link.replace(/\/examples$/, "");
  }
  return link;
}

export function mapMenu(items: SidebarItem[]): Item[] {
  return (
    items?.map((item) => {
      // @ts-expect-error -- Fix later
      const children = mapMenu(item.childNodes || []);
      // Remove children if only one child and its title matches the parent
      const shouldRemoveChildren =
        children.length === 1 && children[0].title === item.name;
      return {
        title: item.name,
        href: shouldRemoveChildren ? children[0].href : item.id,
        // @ts-expect-error -- Fix later
        status: item?.status || item.data?.status,
        children: shouldRemoveChildren ? undefined : children,
      };
    }) || []
  );
}
