import { MenuDescriptor } from "../CascadingMenuProps";

const ID_SEPARATOR = "-";

export type menuState = {
  id: string;
  flipped?: boolean;
  highlightedItemIndex?: number;
  level: number;
  parentId: string | null;
  childMenus: {
    [key: number]: string;
  };
  menuItems: MenuDescriptor[];
};

export type flattenedMenuState = {
  [key: string]: menuState;
};

export function deriveFlatStateFromTree(
  tree: MenuDescriptor,
  parentId: string | null = null,
  level = 0,
  generatedId = "salt-cascading-menu"
): flattenedMenuState {
  const { id = generatedId, menuItems = [] } = tree;
  return menuItems.reduce(
    (menuStructure, menuItem, index) => {
      if (hasSubMenu(menuItem)) {
        const generatedChildId = [generatedId, index].join(ID_SEPARATOR);
        menuStructure[id].childMenus[index] = menuItem.id || generatedChildId;

        const innerState = deriveFlatStateFromTree(
          menuItem,
          id,
          level + 1,
          generatedChildId
        );
        return { ...menuStructure, ...innerState };
      } else {
        return menuStructure;
      }
    },
    // Initialize the structure with the root menu
    {
      [id]: {
        id,
        parentId,
        childMenus: {},
        menuItems: tree.menuItems,
        level,
      },
    } as flattenedMenuState
  );
}

export function hasSubMenu(item: MenuDescriptor) {
  return item != null && !!item.menuItems && item.menuItems.length > 0;
}

export function isMenuItem(item: MenuDescriptor) {
  return item != null && !item.menuItems;
}

export function hasIcon(item: MenuDescriptor) {
  return item != null && !!item.icon;
}
