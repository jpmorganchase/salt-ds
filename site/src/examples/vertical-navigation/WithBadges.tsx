import { Badge, StackLayout } from "@salt-ds/core";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/lab";
import { useState } from "react";
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

function NestedItem(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible onOpenChange={(_, expanded) => setCollapsed(!expanded)}>
        <VerticalNavigationItem
          active={location.pathname.startsWith(item.href) && collapsed}
        >
          <VerticalNavigationItemContent>
            <CollapsibleTrigger>
              <VerticalNavigationItemTrigger>
                <VerticalNavigationItemLabel>
                  {item.title}
                </VerticalNavigationItemLabel>
                <VerticalNavigationItemExpansionIcon />
              </VerticalNavigationItemTrigger>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <NestedItem key={child.title} item={child} />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </VerticalNavigationItem>
      </Collapsible>
    );
  }

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
          <VerticalNavigationItemLabel>
            {item.title}
          </VerticalNavigationItemLabel>
          {item.status && <Badge value={item.status} />}
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const WithBadges = () => {
  return (
    <StackLayout direction="row" gap={6}>
      <MockHistory>
        <VerticalNavigation appearance="indicator" style={{ minWidth: "30ch" }}>
          {nested.map((item) => (
            <NestedItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
      <MockHistory>
        <VerticalNavigation appearance="bordered" style={{ minWidth: "30ch" }}>
          {nested.map((item) => (
            <NestedItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
    </StackLayout>
  );
};
