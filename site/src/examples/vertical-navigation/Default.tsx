import {
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemTrigger,
} from "@salt-ds/lab";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";

type NavItem = {
  title: string;
  href: string;
  icon?: ReactNode;
  children?: NavItem[];
};

const simple: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Products",
    href: "/products",
  },
  {
    title: "About Us",
    href: "/about",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Careers",
    href: "/careers",
  },
];

export const Default = () => {
  const location = useLocation();

  return (
    <VerticalNavigation>
      {simple.map((item) => (
        <VerticalNavigationItem
          key={item.title}
          active={location.pathname === item.href}
        >
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
              {item.title}
            </VerticalNavigationItemTrigger>
          </VerticalNavigationItemContent>
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
  );
};
