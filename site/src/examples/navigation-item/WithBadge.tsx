import { Badge, NavigationItem, StackLayout } from "@salt-ds/core";
import { type ReactElement, useState } from "react";
import { Link, useLocation } from "react-router";
import { MockHistory } from "./MockHistory";

type NavItem = {
  title: string;
  href: string;
  status?: string;
  children?: NavItem[];
};

const nested: NavItem[] = [
  {
    title: "Home",
    href: "/",
    status: "New",
  },
  {
    title: "Products",
    href: "/products",
    children: [
      {
        title: "Widgets",
        href: "/products/widgets",
        children: [
          { title: "Widget A", href: "/products/widgets/widget-a" },
          { title: "Widget B", href: "/products/widgets/widget-b" },
          { title: "Widget C", href: "/products/widgets/widget-c" },
        ],
      },
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

function NavItem({ item, level = 0 }: { item: NavItem; level?: number }) {
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
        {item.title}
        {item.status && <Badge value={item.status} />}
      </NavigationItem>
    </li>
  );
}

export const WithBadge = (): ReactElement => {
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
          {nested.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
