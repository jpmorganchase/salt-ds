import { NavigationItem, StackLayout } from "@salt-ds/core";
import { type ReactElement, useState } from "react";
import { Link, useLocation } from "react-router";
import { type Item, navData } from "./data";
import { MockHistory } from "./MockHistory";

function NavItem({ item, level = 0 }: { item: Item; level?: number }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  if (item.children && item.children.length > 0) {
    return (
      <li>
        <NavigationItem
          blurActive={location.pathname.startsWith(item.href) && !expanded}
          orientation="vertical"
          onExpand={() => {
            setExpanded((old) => !old);
          }}
          parent
          expanded={expanded}
          level={level}
        >
          {item.icon ? item.icon : undefined}
          {item.title}
        </NavigationItem>
        {expanded && (
          <StackLayout
            as="ul"
            gap="var(--salt-spacing-fixed-100)"
            style={{
              width: 250,
              listStyle: "none",
              paddingLeft: 0,
            }}
          >
            {item.children?.map((item) => (
              <NavItem key={item.href} item={item} level={level + 1} />
            ))}
          </StackLayout>
        )}
      </li>
    );
  }

  return (
    <li>
      <NavigationItem
        active={location.pathname === item.href}
        href={item.href}
        orientation="vertical"
        expanded={expanded}
        render={<Link to={item.href} />}
        level={level}
      >
        {item.icon ? item.icon : undefined}
        {item.title}
      </NavigationItem>
    </li>
  );
}

export const WithIcon = (): ReactElement => {
  return (
    <MockHistory>
      <nav>
        <StackLayout
          as="ul"
          gap="var(--salt-spacing-fixed-100)"
          style={{
            width: 250,
            listStyle: "none",
            paddingLeft: 0,
          }}
        >
          {navData.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
