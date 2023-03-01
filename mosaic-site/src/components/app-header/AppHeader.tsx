import React, { FC, useEffect, useLayoutEffect, useState } from "react";

import { Logo } from "@salt-ds/lab";
import { useBreakpoint, Link } from "@jpmorganchase/mosaic-components";
import type { TabsMenu } from "@jpmorganchase/mosaic-components";
import { useRoute } from "@jpmorganchase/mosaic-store";
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

const createDrawerMenu = (menu) =>
  menu.reduce((result, item) => {
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

  useIsomorphicLayoutEffect(() => {
    setShowDrawer(breakpoint === "mobile" || breakpoint === "tablet");
  }, [breakpoint]);

  const appHeaderLogo =
    breakpoint === "mobile" || breakpoint === "tablet"
      ? "/img/logo_mobile.svg"
      : logo;

  return (
    <>
      {showDrawer && <AppHeaderDrawer menu={createDrawerMenu(menu)} />}
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
