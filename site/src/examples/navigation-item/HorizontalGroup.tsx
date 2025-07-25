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
        orientation="horizontal"
        render={<Link to={item.href} />}
        active={location.pathname === item.href}
      >
        {item.title}
      </NavigationItem>
    </li>
  );
}

export const HorizontalGroup = (): ReactElement => {
  return (
    <MockHistory>
      <nav>
        <StackLayout
          as="ul"
          direction="row"
          gap={1}
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
