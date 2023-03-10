import React, { FC, useEffect, useLayoutEffect, useState } from "react";
import classnames from "classnames";
import { Logo } from "@salt-ds/lab";
import { useBreakpoint, Link } from "@jpmorganchase/mosaic-components";
import type { TabsMenu, TabsLinkItem } from "@jpmorganchase/mosaic-components";
import { useRoute, SidebarItem } from "@jpmorganchase/mosaic-store";
import {
  AppHeaderDrawer,
  AppHeaderTabs,
} from "@jpmorganchase/mosaic-site-components";
import styles from "./AppHeader.module.css";

export type AppHeaderProps = {
  homeLink?: string;
  logo?: string;
  menu?: TabsMenu;
  title?: string;
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type MenuItem = { link: string; title?: string; links: TabsLinkItem[] };

const createDrawerMenu = (menu: any[]): SidebarItem[] =>
  menu.reduce((result: SidebarItem[], item: MenuItem) => {
    const parsedItem = {
      id: item.link,
      name: item.title,
      data: { link: item.link },
    };
    if (item?.links?.length) {
      const childNodes = createDrawerMenu(item.links);
      return [...result, { ...parsedItem, childNodes }];
    }
    return [...result, parsedItem];
  }, []);

export const AppHeader: FC<AppHeaderProps> = ({
  homeLink,
  logo,
  menu = [],
  title,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const breakpoint = useBreakpoint();
  const { route } = useRoute();

  const isMobileOrTablet = breakpoint === "mobile" || breakpoint === "tablet";

  useIsomorphicLayoutEffect(() => {
    setShowDrawer(isMobileOrTablet);
  }, [breakpoint]);

  const appHeaderLogo = isMobileOrTablet ? "/img/logo_mobile.svg" : logo;

  return (
    <>
      {showDrawer && (
        <div className={styles.drawer}>
          <AppHeaderDrawer menu={createDrawerMenu(menu)} />
        </div>
      )}
      <div className={styles.root}>
        {homeLink && (
          <Link href={homeLink} variant="component">
            {logo && <Logo appTitle={title} src={appHeaderLogo} />}
          </Link>
        )}
        {!showDrawer && (
          <div className={styles.appHeaderTabs}>
            <AppHeaderTabs key={route} menu={menu} />
          </div>
        )}
      </div>
    </>
  );
};
