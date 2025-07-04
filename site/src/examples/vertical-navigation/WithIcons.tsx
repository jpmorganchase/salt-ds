import {
  HelpSolidIcon,
  MessageSolidIcon,
  StorageSolidIcon,
  UserGroupSolidIcon,
} from "@salt-ds/icons";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/lab";
import { type ReactNode, useState } from "react";
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
    icon: <StorageSolidIcon aria-hidden />,
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
    icon: <UserGroupSolidIcon aria-hidden />,
    children: [
      { title: "Our Story", href: "/about/story" },
      { title: "Our Team", href: "/about/team" },
      { title: "Press", href: "/about/press" },
    ],
  },
  {
    title: "Support",
    href: "/support",
    icon: <HelpSolidIcon aria-hidden />,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: <MessageSolidIcon aria-hidden />,
  },
];

function NestedItem(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible onToggle={(_, expanded) => setCollapsed(!expanded)}>
        <VerticalNavigationItem
          active={location.pathname.startsWith(item.href) && collapsed}
        >
          <VerticalNavigationItemContent>
            <CollapsibleTrigger render={<VerticalNavigationItemTrigger />}>
              {item.icon ? item.icon : undefined} {item.title}{" "}
              <VerticalNavigationItemExpansionIcon />
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
          {item.icon ? item.icon : undefined} {item.title}
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const WithIcons = () => {
  return (
    <VerticalNavigation style={{ minWidth: "30ch" }}>
      {nested.map((item) => (
        <NestedItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};
