import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  StackLayout,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/core";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { type Item, navData } from "./data";
import { MockHistory } from "./MockHistory";

function NestedItem(props: { item: Item }) {
  const { item } = props;

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <VerticalNavigationItem
        active={location.pathname.startsWith(item.href) && collapsed}
      >
        <Collapsible onOpenChange={(_, expanded) => setCollapsed(!expanded)}>
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
        </Collapsible>
      </VerticalNavigationItem>
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

export const CollapsibleSubmenu = () => {
  return (
    <StackLayout direction="row" gap={6}>
      <MockHistory>
        <VerticalNavigation
          aria-label="Collapsible indicator sidebar"
          appearance="indicator"
          style={{ minWidth: "30ch" }}
        >
          {navData.map((item) => (
            <NestedItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
      <MockHistory>
        <VerticalNavigation
          aria-label="Collapsible bordered sidebar"
          appearance="bordered"
          style={{ minWidth: "30ch" }}
        >
          {navData.map((item) => (
            <NestedItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
    </StackLayout>
  );
};
