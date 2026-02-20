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
  if (!status) return "";
  return status.split(" ").reduce((acc, word) => {
    return acc + word[0].toUpperCase();
  }, "");
}

/**
 * This function normalizes the selectedNodeId to match the href in navData.
 * It handles cases where the link might end with a tab route (e.g., /examples, /usage, /accessibility)
 * and checks if there's a corresponding index page in the navData.
 * If so, it returns the index page href; otherwise, it falls back to the base link without the tab route.
 */
export function normalizeSelectedNodeId(link: string, navData: Item[]): string {
  const tabRoutes = ["/examples", "/usage", "/accessibility"];
  const matchedRoute = tabRoutes.find((route) => link.endsWith(route));
  if (matchedRoute) {
    const base = link.slice(0, -matchedRoute.length);
    const indexLink = `${base}/index`;

    const exists = (items: Item[]): boolean =>
      items.some(
        (item) =>
          item.href === indexLink || (item.children && exists(item.children)),
      );
    if (exists(navData)) {
      return indexLink;
    }
    return base;
  }
  return link;
}

export type SidebarNodeWithStatus = SidebarItem & {
  data?: {
    status?: string;
  };
};

export function mapMenu(items: SidebarNodeWithStatus[]): Item[] {
  return (
    items?.map((item) => {
      let children: Item[] = [];
      if (item.kind === "group" && Array.isArray(item.childNodes)) {
        children = mapMenu(item.childNodes as SidebarNodeWithStatus[]);
      }
      // Remove children if only one child and its title matches the parent
      const shouldRemoveChildren =
        children.length === 1 && children[0].title === item.name;
      return {
        title: item.name,
        href: shouldRemoveChildren ? children[0].href : item.id,
        status: item.data?.status,
        children: shouldRemoveChildren ? undefined : children,
      };
    }) || []
  );
}
