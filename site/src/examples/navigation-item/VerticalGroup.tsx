import { NavigationItem, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import { Link, useLocation } from "react-router";
import { type Item, navData } from "./data";
import { MockHistory } from "./MockHistory";

function NavItem({ item }: { item: Item }) {
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
          {navData.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
