import { Divider } from "@salt-ds/core";
import {
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/lab";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";

type NavItem = {
  title: string;
  href: string;
  icon?: ReactNode;
  children?: NavItem[];
};

const nested: NavItem[] = [
  {
    title: "Products",
    href: "/products",
    children: [
      { title: "Widgets", href: "/products/widgets" },
      { title: "Gadgets", href: "/products/gadgets" },
      { title: "Doodads", href: "/products/doodads" },
    ],
  },
  {
    title: "About Us",
    href: "/about",
    children: [
      { title: "Our Story", href: "/about/story" },
      { title: "Our Team", href: "/about/team" },
      { title: "Press", href: "/about/press" },
    ],
  },
  {
    title: "Support",
    href: "/support",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

export const Nested = () => {
  const location = useLocation();

  return (
    <VerticalNavigation style={{ minWidth: "30ch" }}>
      {nested.map((item) => (
        <VerticalNavigationItem
          key={item.title}
          active={location.pathname === item.href}
        >
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
              {item.title}
            </VerticalNavigationItemTrigger>
          </VerticalNavigationItemContent>
          {item.children && (
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <VerticalNavigationItem
                  key={child.title}
                  active={location.pathname === child.href}
                >
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger
                      render={<Link to={child.href} />}
                    >
                      {child.title}
                    </VerticalNavigationItemTrigger>
                  </VerticalNavigationItemContent>
                </VerticalNavigationItem>
              ))}
              <Divider variant="tertiary" />
            </VerticalNavigationSubMenu>
          )}
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
  );
};
