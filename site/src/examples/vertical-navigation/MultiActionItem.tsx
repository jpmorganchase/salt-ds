import { Button, StackLayout } from "@salt-ds/core";
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
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { MockHistory } from "./MockHistory";

type NavItem = {
  title: string;
  href: string;
  icon?: ReactNode;
  children?: NavItem[];
};

const multiLevel: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Solutions",
    href: "/solutions",
    children: [
      {
        title: "By Industry",
        href: "/solutions/by-industry",
        children: [
          { title: "Healthcare", href: "/solutions/by-industry/healthcare" },
          { title: "Finance", href: "/solutions/by-industry/finance" },
          { title: "Education", href: "/solutions/by-industry/education" },
        ],
      },
      {
        title: "By Business Size",
        href: "/solutions/by-size",
        children: [
          { title: "Startups", href: "/solutions/by-size/startups" },
          {
            title: "Small & Medium Business",
            href: "/solutions/by-size/smb",
          },
          { title: "Enterprise", href: "/solutions/by-size/enterprise" },
        ],
      },
    ],
  },
  {
    title: "Company",
    href: "/company",
    children: [
      { title: "About Us", href: "/company/about" },
      { title: "Careers", href: "/company/careers" },
      { title: "Press Center", href: "/company/press" },
    ],
  },
];

function ExpandButtonItem(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible>
        <VerticalNavigationItem active={location.pathname === item.href}>
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
            <CollapsibleTrigger render={<Button appearance="transparent" />}>
              <VerticalNavigationItemExpansionIcon />
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <ExpandButtonItem key={child.title} item={child} />
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
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const MultiActionItem = () => {
  return (
    <StackLayout direction="row" gap={6}>
      <MockHistory>
        <VerticalNavigation appearance="indicator">
          {multiLevel.map((item) => (
            <ExpandButtonItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
      <MockHistory>
        <VerticalNavigation appearance="bordered">
          {multiLevel.map((item) => (
            <ExpandButtonItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
    </StackLayout>
  );
};
