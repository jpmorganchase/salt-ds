import React from "react";
import { SidebarItem, useRoute, useStore } from "@jpmorganchase/mosaic-store";
import { VerticalNavigation } from "@jpmorganchase/mosaic-site-components";

export const PageNavigation = () => {
  const menu = useStore((state) => state.sidebarData) || [];
  let { route } = useRoute();

  if (!route) {
    route = "";
  }

  // This function evaluates the active route against the data of the sidebar menu, and determines which menu nodes need to be expanded for the current page as per the route.
  function getExpandedNodeIds(route: string, menu: SidebarItem[]): Set<string> {
    const expandedNodeIds = new Set<string>();

    const traverse = (node: SidebarItem) => {
      if (route.startsWith(node.id.replace("/index", ""))) {
        expandedNodeIds.add(node.id);
      }

      if (node.childNodes) {
        for (const childNode of node.childNodes) {
          traverse(childNode);
        }
      }
    };

    menu.forEach((node) => {
      traverse(node);
    });

    return expandedNodeIds;
  }
  return (
    <VerticalNavigation
      menu={menu}
      selectedNodeId={route}
      expandedNodeIds={getExpandedNodeIds(route, menu)}
    />
  );
};
