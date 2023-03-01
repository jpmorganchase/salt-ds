import React from 'react';
import type { TabsLinkItem, TabsMenu, TabsMenuButtonItem } from '@jpmorganchase/mosaic-components';
import { TabMenuItemType } from '@jpmorganchase/mosaic-components';
import type {
  MenuLinkItem,
  AppHeaderMenuLinksItem,
  AppHeaderMenuLinkItem
} from '@jpmorganchase/mosaic-store';
import { useAppHeader, AppHeaderMenu, MenuItemType } from '@jpmorganchase/mosaic-store';

function createTabsMenu(menu: AppHeaderMenu): TabsMenu {
  const tabsMenu = menu.reduce<(TabsMenuButtonItem | TabsLinkItem)[]>((result, menuItem) => {
    const menu = menuItem as AppHeaderMenuLinksItem;
    const link = menuItem as AppHeaderMenuLinkItem;
    if (menu && menu.type === MenuItemType.MENU) {
      const tabsLinksItem: TabsMenuButtonItem = {
        title: menu.title,
        type: TabMenuItemType.MENU,
        links: menu.links.map(({ title, link }: MenuLinkItem) => ({
          type: TabMenuItemType.LINK,
          title,
          link
        })),
        onSelect: () => undefined
      };
      return [...result, tabsLinksItem];
    } else if (link && link.type === MenuItemType.LINK) {
      const tabsLinkItem: TabsLinkItem = {
        title: link.title,
        type: TabMenuItemType.LINK,
        link: link.link
      };
      return [...result, tabsLinkItem];
    }
    console.error('Unknown Menu item passed to createTabsMenu, ignoring', menu);
    return result;
  }, []);
  return tabsMenu;
}

export const withAppHeaderAdapter = Component => () => {
  const headerConfig = useAppHeader();
  const { homeLink, logo, menu: menuItems = [], title } = headerConfig || {};
  const tabsMenu = createTabsMenu(menuItems);
  return <Component homeLink={homeLink} logo={logo} menu={tabsMenu} title={title} />;
};
