import { NavigationItem, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import { Link, useLocation } from "react-router";
import { MockHistory } from "./MockHistory";

type NavItem = {
  title: string;
  href: string;
  children?: NavItem[];
};

const items: NavItem[] = [
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
    title: "Support",
    href: "/support",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

function NavItem({ item }: { item: NavItem }) {
  const location = useLocation();

  return (
    <li key={item.href}>
      <NavigationItem
        href={item.href}
        orientation="vertical"
        render={<Link to={item.href} />}
        active={location.pathname === item.href}
      >
        {item.title}
      </NavigationItem>
    </li>
  );
}

export const VerticalGroup = (): ReactElement => {
  return (
    <MockHistory>
      <nav>
        <StackLayout
          as="ul"
          gap="var(--salt-spacing-fixed-100)"
          style={{ listStyle: "none" }}
        >
          {items.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
