import React, { FC } from "react";
import { Logo, LogoImage } from "@salt-ds/lab";
import {
  useBreakpoint,
  Text,
  NavigationItem,
  StackLayout,
  Tooltip,
} from "@salt-ds/core";
import { Link, TabMenuItemType } from "@jpmorganchase/mosaic-components";
import type { TabsMenu } from "@jpmorganchase/mosaic-components";
import { useRoute, SidebarItem } from "@jpmorganchase/mosaic-store";
import { AppHeaderDrawer } from "@jpmorganchase/mosaic-site-components";
import styles from "./AppHeader.module.css";
import { HelpIcon, GithubIcon } from "@salt-ds/icons";
import { Search } from "./Search";
import { useRouter } from "next/navigation";

export interface AppHeaderProps {
  homeLink?: string;
  logo?: string;
  menu?: TabsMenu;
  title?: string;
}

const createDrawerMenu = (menu: TabsMenu): SidebarItem[] =>
  menu.reduce((result, item) => {
    if (item.type !== TabMenuItemType.LINK) return result;
    const parsedItem = {
      id: item.link,
      name: item.title ?? "",
      data: { link: item.link },
    } as SidebarItem;

    return [...result, parsedItem];
  }, [] as SidebarItem[]);

const actions: TabsMenu = [
  {
    title: "Support",
    link: "/salt/support-and-contributions/index",
    type: TabMenuItemType.LINK,
  },
  {
    title: "Github repository",
    link: "https://github.com/jpmorganchase/salt-ds",
    type: TabMenuItemType.LINK,
  },
];

export const AppHeader: FC<AppHeaderProps> = ({
  homeLink,
  logo,
  menu = [],
  title,
}) => {
  const { matchedBreakpoints } = useBreakpoint();
  const { route } = useRoute();
  const router = useRouter();

  const isMobileOrTablet = !matchedBreakpoints.includes("md");

  const appHeaderLogo = isMobileOrTablet ? "/img/logo_mobile.svg" : logo;

  return (
    <>
      {isMobileOrTablet && (
        <div className={styles.drawer}>
          <AppHeaderDrawer
            menu={createDrawerMenu(
              menu.concat(isMobileOrTablet ? actions : [])
            )}
          />
        </div>
      )}
      <div className={styles.root}>
        {!isMobileOrTablet && (
          <>
            {homeLink && (
              <Link href={homeLink} variant="component">
                {logo && (
                  <Logo>
                    <LogoImage
                      src={appHeaderLogo}
                      alt="Salt design system logo"
                    />
                    {title && <Text>{title}</Text>}
                  </Logo>
                )}
              </Link>
            )}
            <nav className={styles.appHeaderTabs}>
              <StackLayout
                as="ul"
                direction="row"
                style={{ listStyle: "none", padding: 0 }}
                gap={0}
              >
                {menu.map((item) => {
                  if (item.type === TabMenuItemType.LINK) {
                    return (
                      <li key={item.title}>
                        <NavigationItem
                          active={route?.includes(item.link)}
                          href={item.link}
                          onClick={(event) => {
                            event.preventDefault();
                            router.push(item.link);
                          }}
                        >
                          {item.title}
                        </NavigationItem>
                      </li>
                    );
                  }
                  return null;
                })}
              </StackLayout>
            </nav>
          </>
        )}
        <StackLayout direction="row" align="center" gap={1}>
          <Search />
          {!isMobileOrTablet && (
            <>
              <Tooltip content="Github repository" placement="bottom">
                <Link
                  href="https://github.com/jpmorganchase/salt-ds"
                  aria-label="GitHub repository"
                  variant="component"
                  className={styles.appHeaderLink}
                >
                  <GithubIcon aria-hidden />
                </Link>
              </Tooltip>
              <Tooltip content="Support" placement="bottom">
                <Link
                  href="/salt/support-and-contributions/index"
                  aria-label="Support"
                  variant="component"
                  className={styles.appHeaderLink}
                >
                  <HelpIcon aria-hidden />
                </Link>
              </Tooltip>
            </>
          )}
        </StackLayout>
      </div>
    </>
  );
};
